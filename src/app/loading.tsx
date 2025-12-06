import { Spinner } from '@/components/atoms';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">Loading VitAI...</p>
      </div>
    </div>
  );
}
