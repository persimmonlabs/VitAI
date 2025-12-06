import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VitAI - AI-Powered Nutrition Tracking',
  description: 'Simple, beautiful, effective calorie and nutrition tracking powered by AI',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
