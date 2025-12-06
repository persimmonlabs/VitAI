'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useCreateWeightLogMutation } from '@/lib/query';
import { ArrowLeft } from 'lucide-react';

export default function LogWeightPage() {
  const router = useRouter();
  const createWeightLogMutation = useCreateWeightLogMutation();

  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!weight) {
      alert('Please enter your weight');
      return;
    }

    try {
      await createWeightLogMutation.mutateAsync({
        weight_value: parseFloat(weight),
        weight_unit: 'kg',
        logged_at: date ? new Date(date).toISOString() : new Date().toISOString(),
      });
      router.push('/app/weight');
    } catch (error) {
      console.error('Create weight log error:', error);
      alert('Failed to log weight. Please try again.');
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-white">
      {/* Header */}
      <div className="sticky top-14 z-30 border-b bg-white px-4 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">Log Weight</h2>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 p-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Weight (kg) *
          </label>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0.0"
            step="0.1"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Date *
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any notes about your weight..."
            className="min-h-[100px] w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!weight || createWeightLogMutation.isPending}
        >
          {createWeightLogMutation.isPending ? 'Saving...' : 'Save Weight'}
        </Button>
      </form>
    </div>
  );
}
