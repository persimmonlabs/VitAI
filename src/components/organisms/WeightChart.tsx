import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, Button } from '@/components/atoms';

interface WeightEntry {
  date: Date;
  weight: number;
}

interface WeightChartProps {
  data: WeightEntry[];
  goalWeight?: number;
  unit?: 'kg' | 'lbs';
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export const WeightChart: React.FC<WeightChartProps> = ({
  data,
  goalWeight,
  unit = 'kg',
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const filterDataByRange = (range: TimeRange): WeightEntry[] => {
    if (range === 'all') return data;

    const now = new Date();
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[range];

    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return data.filter(entry => entry.date >= cutoffDate);
  };

  const filteredData = filterDataByRange(timeRange);

  const chartData = filteredData.map(entry => ({
    date: entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: entry.weight,
    fullDate: entry.date,
  }));

  const currentWeight = data.length > 0 ? data[data.length - 1].weight : 0;
  const startWeight = filteredData.length > 0 ? filteredData[0].weight : 0;
  const weightChange = currentWeight - startWeight;

  const minWeight = Math.min(...filteredData.map(d => d.weight), goalWeight || Infinity);
  const maxWeight = Math.max(...filteredData.map(d => d.weight), goalWeight || -Infinity);
  const yAxisDomain = [
    Math.floor(minWeight - 2),
    Math.ceil(maxWeight + 2),
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900">
            {payload[0].payload.fullDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-lg font-bold text-primary-600 mt-1">
            {payload[0].value.toFixed(1)} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <Card className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weight Progress</h3>
          <p className="text-sm text-gray-600 mt-1">
            Track your weight over time
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {timeRangeOptions.map(option => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Current</p>
          <p className="text-xl font-bold text-gray-900">
            {currentWeight.toFixed(1)} <span className="text-sm font-normal">{unit}</span>
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Change</p>
          <p className={`text-xl font-bold ${weightChange < 0 ? 'text-green-600' : weightChange > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} <span className="text-sm font-normal">{unit}</span>
          </p>
        </div>
        {goalWeight && (
          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <p className="text-xs text-primary-700 mb-1">Goal</p>
            <p className="text-xl font-bold text-primary-700">
              {goalWeight.toFixed(1)} <span className="text-sm font-normal">{unit}</span>
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickMargin={10}
              />
              <YAxis
                domain={yAxisDomain}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {goalWeight && (
                <ReferenceLine
                  y={goalWeight}
                  stroke="#3b82f6"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: 'Goal',
                    position: 'right',
                    fill: '#3b82f6',
                    fontSize: 12,
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-gray-600 font-medium">No weight data yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Start logging your weight to see your progress
          </p>
        </div>
      )}

      {/* Progress to Goal */}
      {goalWeight && currentWeight !== goalWeight && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progress to goal</span>
            <span className="font-medium text-gray-900">
              {Math.abs(currentWeight - goalWeight).toFixed(1)} {unit} {currentWeight > goalWeight ? 'to lose' : 'to gain'}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.abs((startWeight - currentWeight) / (startWeight - goalWeight)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};
