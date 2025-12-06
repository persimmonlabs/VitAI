'use client';

import { useEffect } from 'react';
import { Button } from '@/components/atoms';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h2>

              <p className="text-gray-600 mb-4">
                We encountered an error while loading this page. Your data is safe.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-50 rounded-md p-4 mb-4">
                  <p className="text-sm font-mono text-gray-800 mb-2">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-gray-500 font-mono">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={reset}
                  className="flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try again</span>
                </Button>

                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  variant="outline"
                  className="flex items-center justify-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Go to dashboard</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          If the problem persists, try logging out and back in, or contact support.
        </p>
      </div>
    </div>
  );
}
