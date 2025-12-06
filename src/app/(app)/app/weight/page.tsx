'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { WeightChart } from '@/components/organisms/WeightChart';
import { useWeightLogs } from '@/lib/query';
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';

interface WeightLog {
  id: string;
  weight: number;
  loggedAt: string;
  note?: string;
}

export default function WeightPage() {
  const router = useRouter();
  const { data, isLoading } = useWeightLogs();
  const weightLogs = (data as WeightLog[] | undefined) || [];

  const latestWeight = weightLogs[0];
  const previousWeight = weightLogs[1];
  const weightChange = latestWeight && previousWeight
    ? latestWeight.weight - previousWeight.weight
    : 0;

  const handleLogWeight = () => {
    router.push('/app/weight/log');
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark px-4 py-8 text-white">
        <h2 className="mb-2 text-2xl font-bold">Weight Tracking</h2>
        <p className="text-sm opacity-90">Monitor your progress over time</p>
      </div>

      {/* Current Weight Card */}
      <div className="px-4 py-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Current Weight</h3>
            <Button onClick={handleLogWeight} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Log Weight
            </Button>
          </div>

          {latestWeight ? (
            <div>
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold">{latestWeight.weight}</span>
                <span className="text-lg text-gray-600">kg</span>
              </div>
              {weightChange !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${
                  weightChange > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {weightChange > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>
                    {Math.abs(weightChange).toFixed(1)} kg from last entry
                  </span>
                </div>
              )}
              <div className="mt-1 text-sm text-gray-500">
                {new Date(latestWeight.loggedAt).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No weight entries yet. Log your first weight!
            </div>
          )}
        </div>
      </div>

      {/* Weight Chart */}
      {weightLogs.length > 0 && (
        <div className="px-4 pb-6">
          <h3 className="mb-4 text-lg font-semibold">Progress Chart</h3>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <WeightChart data={weightLogs as any} />
          </div>
        </div>
      )}

      {/* Recent Logs */}
      {weightLogs.length > 0 && (
        <div className="px-4 pb-8">
          <h3 className="mb-4 text-lg font-semibold">Recent Logs</h3>
          <div className="space-y-2">
            {weightLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
              >
                <div>
                  <div className="font-medium">{log.weight} kg</div>
                  <div className="text-sm text-gray-500">
                    {new Date(log.loggedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                {log.note && (
                  <div className="text-sm text-gray-600">{log.note}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
