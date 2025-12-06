import React, { useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { SearchInput, FoodItemCard } from '@/components/molecules';

interface FoodResult {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  brand?: string;
}

interface FoodSearchProps {
  onSelectFood?: (food: FoodResult) => void;
  isLoading?: boolean;
  results?: FoodResult[];
  recentFoods?: FoodResult[];
  onSearch?: (query: string) => void;
}

export const FoodSearch: React.FC<FoodSearchProps> = ({
  onSelectFood,
  isLoading = false,
  results = [],
  recentFoods = [],
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecentFoods, setShowRecentFoods] = useState(true);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowRecentFoods(query.length === 0);
    onSearch?.(query);
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowRecentFoods(true);
    onSearch?.('');
  };

  const displayResults = searchQuery.length > 0 ? results : [];
  const showRecent = showRecentFoods && recentFoods.length > 0 && searchQuery.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="p-4 bg-white border-b sticky top-0 z-10">
        <SearchInput
          value={searchQuery}
          onSearchChange={handleSearch}
          onClear={handleClear}
          placeholder="Search foods..."
          className="w-full"
        />
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-primary-600 animate-spin mb-4" />
            <p className="text-gray-600">Searching foods...</p>
          </div>
        )}

        {/* Recent Foods */}
        {showRecent && !isLoading && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Recent Foods
              </h3>
            </div>
            <div className="space-y-2">
              {recentFoods.map((food) => (
                <FoodItemCard
                  key={food.id}
                  id={food.id}
                  name={food.name}
                  calories={food.calories}
                  protein={food.protein}
                  carbs={food.carbs}
                  fat={food.fat}
                  servingSize={`${food.servingSize} ${food.servingUnit}`}
                  brand={food.brand}
                  onClick={() => onSelectFood?.(food)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery.length > 0 && !isLoading && displayResults.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Results ({displayResults.length})
            </h3>
            <div className="space-y-2">
              {displayResults.map((food) => (
                <FoodItemCard
                  key={food.id}
                  id={food.id}
                  name={food.name}
                  calories={food.calories}
                  protein={food.protein}
                  carbs={food.carbs}
                  fat={food.fat}
                  servingSize={`${food.servingSize} ${food.servingUnit}`}
                  brand={food.brand}
                  onClick={() => onSelectFood?.(food)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State - No Results */}
        {searchQuery.length > 0 && !isLoading && displayResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 text-center max-w-sm">
              Try adjusting your search or add a custom food item
            </p>
          </div>
        )}

        {/* Empty State - Start Searching */}
        {searchQuery.length === 0 && !showRecent && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-3xl">🍎</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start searching
            </h3>
            <p className="text-gray-600 text-center max-w-sm">
              Search for foods by name or brand
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
