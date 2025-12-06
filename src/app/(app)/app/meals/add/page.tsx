'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Camera, FileText, Edit3, X } from 'lucide-react';
import { useParseMealMutation, useFoodSearch } from '@/lib/query';

function AddMealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'photo' | 'text' | 'manual') || 'photo';

  const [activeTab, setActiveTab] = useState<'photo' | 'text' | 'manual'>(initialTab);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const parseTextMutation = useParseMealMutation();
  const { data: searchData, isLoading: isSearching } = useFoodSearch(searchQuery);

  interface FoodResult {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }

  const searchResults = (searchData as FoodResult[] | undefined) || [];

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please check permissions.');
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const base64Image = canvas.toDataURL('image/jpeg');
    setPhotoPreview(base64Image);
    stopCamera();
  };

  const handlePhotoSubmit = async () => {
    if (!photoPreview) return;

    try {
      const result = await parseTextMutation.mutateAsync({
        text: `Photo of meal: ${photoPreview.substring(0, 100)}...`,
      });

      router.push(`/app/meals/confirm?data=${encodeURIComponent(JSON.stringify(result))}`);
    } catch (error) {
      console.error('Parse error:', error);
      alert('Failed to analyze photo. Please try again.');
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    try {
      const result = await parseTextMutation.mutateAsync({
        text: textInput,
      });

      router.push(`/app/meals/confirm?data=${encodeURIComponent(JSON.stringify(result))}`);
    } catch (error) {
      console.error('Parse error:', error);
      alert('Failed to parse text. Please try again.');
    }
  };

  const handleManualSubmit = (foodId: string) => {
    router.push(`/app/meals/confirm?foodId=${foodId}`);
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-white">
      {/* Header */}
      <div className="sticky top-14 z-30 border-b bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Log Meal</h2>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setActiveTab('photo');
              stopCamera();
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors ${
              activeTab === 'photo'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Photo</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('text');
              stopCamera();
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors ${
              activeTab === 'text'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Text</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('manual');
              stopCamera();
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors ${
              activeTab === 'manual'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            <span>Manual</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Photo Tab */}
        {activeTab === 'photo' && (
          <div className="space-y-4">
            {!isCapturing && !photoPreview && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12">
                <Camera className="mb-4 h-16 w-16 text-gray-400" />
                <p className="mb-4 text-sm text-gray-600">Take a photo of your meal</p>
                <Button onClick={startCamera}>Open Camera</Button>
              </div>
            )}

            {isCapturing && (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="flex gap-2">
                  <Button onClick={capturePhoto} className="flex-1">
                    Capture
                  </Button>
                  <Button onClick={stopCamera} variant="ghost" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {photoPreview && (
              <div className="space-y-4">
                <img src={photoPreview} alt="Captured meal" className="w-full rounded-lg" />
                <div className="flex gap-2">
                  <Button
                    onClick={handlePhotoSubmit}
                    className="flex-1"
                    disabled={parseTextMutation.isPending}
                  >
                    {parseTextMutation.isPending ? 'Analyzing...' : 'Analyze Photo'}
                  </Button>
                  <Button
                    onClick={() => {
                      setPhotoPreview(null);
                      startCamera();
                    }}
                    variant="ghost"
                    className="flex-1"
                  >
                    Retake
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text Tab */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Describe your meal
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g., Grilled chicken breast with steamed broccoli and brown rice"
                className="min-h-[120px] w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              onClick={handleTextSubmit}
              className="w-full"
              disabled={!textInput.trim() || parseTextMutation.isPending}
            >
              {parseTextMutation.isPending ? 'Parsing...' : 'Parse Meal'}
            </Button>
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search for food
              </label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search foods..."
                className="w-full"
              />
            </div>

            {isSearching && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleManualSubmit(food.id)}
                    className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <div className="font-medium">{food.name}</div>
                    <div className="mt-1 text-sm text-gray-600">
                      {food.calories} cal • {food.protein}g protein • {food.carbs}g carbs • {food.fat}g fat
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery && !isSearching && searchResults.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No foods found. Try a different search term.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AddMealPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <AddMealContent />
    </Suspense>
  );
}
