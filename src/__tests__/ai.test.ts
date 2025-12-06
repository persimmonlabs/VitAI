import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for OpenRouter API calls
global.fetch = vi.fn();

describe('AI Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Text Parsing', () => {
    it('should parse simple meal description', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: 'Chicken Breast with Rice',
                description: 'Grilled chicken breast (200g) with white rice (150g)',
                calories: 450,
                protein: 45,
                carbs: 50,
                fat: 8,
              }),
            },
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/ai/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'I had grilled chicken breast 200g with white rice 150g',
        }),
      });

      const data = await response.json();

      expect(data.name).toBe('Chicken Breast with Rice');
      expect(data.calories).toBe(450);
      expect(data.protein).toBe(45);
    });

    it('should parse meal with multiple items', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: 'Mixed Breakfast',
                description: '2 eggs, 2 slices of toast, coffee with milk',
                calories: 320,
                protein: 18,
                carbs: 28,
                fat: 14,
              }),
            },
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/ai/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '2 eggs, 2 slices of toast, coffee with milk',
        }),
      });

      const data = await response.json();

      expect(data.name).toBe('Mixed Breakfast');
      expect(data.calories).toBeGreaterThan(0);
    });

    it('should handle vague descriptions', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: 'Sandwich',
                description: 'A sandwich (estimated)',
                calories: 350,
                protein: 15,
                carbs: 40,
                fat: 12,
                confidence: 'low',
              }),
            },
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/ai/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'I had a sandwich',
        }),
      });

      const data = await response.json();

      expect(data.name).toBe('Sandwich');
      expect(data.confidence).toBe('low');
    });

    it('should handle parsing errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const response = await fetch('/api/ai/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Invalid input',
        }),
      });

      expect(response.ok).toBe(false);
    });

    it('should validate required nutritional fields', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: 'Apple',
                description: 'One medium apple',
                calories: 95,
                protein: 0.5,
                carbs: 25,
                fat: 0.3,
              }),
            },
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/ai/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'I ate an apple',
        }),
      });

      const data = await response.json();

      expect(data).toHaveProperty('calories');
      expect(data).toHaveProperty('protein');
      expect(data).toHaveProperty('carbs');
      expect(data).toHaveProperty('fat');
    });
  });

  describe('Photo Parsing (Mocked)', () => {
    it('should parse food photo and extract nutritional info', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: 'Pasta Carbonara',
                description: 'Plate of pasta carbonara with bacon and parmesan',
                calories: 650,
                protein: 28,
                carbs: 70,
                fat: 25,
                confidence: 'medium',
                items: [
                  { name: 'Spaghetti', amount: '200g' },
                  { name: 'Bacon', amount: '50g' },
                  { name: 'Parmesan', amount: '30g' },
                ],
              }),
            },
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';

      const response = await fetch('/api/ai/parse-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: mockImageData,
        }),
      });

      const data = await response.json();

      expect(data.name).toBe('Pasta Carbonara');
      expect(data.items).toHaveLength(3);
      expect(data.confidence).toBe('medium');
    });

    it('should handle unrecognizable food photos', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: 'Unknown Food',
                description: 'Unable to identify with confidence',
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                confidence: 'very_low',
                error: 'Food items not clearly visible',
              }),
            },
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const mockImageData = 'data:image/jpeg;base64,blurry-image';

      const response = await fetch('/api/ai/parse-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: mockImageData,
        }),
      });

      const data = await response.json();

      expect(data.confidence).toBe('very_low');
      expect(data.error).toBeDefined();
    });

    it('should detect multiple food items in photo', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: 'Complete Meal',
                description: 'Grilled chicken, vegetables, and rice',
                calories: 580,
                protein: 42,
                carbs: 55,
                fat: 15,
                items: [
                  { name: 'Grilled Chicken Breast', amount: '150g', calories: 248 },
                  { name: 'Broccoli', amount: '100g', calories: 55 },
                  { name: 'Brown Rice', amount: '150g', calories: 277 },
                ],
              }),
            },
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/ai/parse-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,meal-photo',
        }),
      });

      const data = await response.json();

      expect(data.items).toHaveLength(3);
      expect(data.items[0]).toHaveProperty('calories');
    });

    it('should validate image format', async () => {
      const response = await fetch('/api/ai/parse-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: 'invalid-base64-string',
        }),
      });

      expect(response.ok).toBe(false);
    });

    it('should handle API rate limits', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      const response = await fetch('/api/ai/parse-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,test',
        }),
      });

      expect(response.status).toBe(429);
    });
  });

  describe('AI Suggestions', () => {
    it('should suggest meal improvements', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  'Add more protein to reach your daily goal',
                  'Consider adding vegetables for fiber',
                  'Reduce portion size to stay within calorie budget',
                ],
                alternativeMeals: [
                  {
                    name: 'Grilled Chicken Salad',
                    calories: 350,
                    protein: 35,
                    reason: 'Higher protein, lower calories',
                  },
                ],
              }),
            },
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMeal: {
            calories: 600,
            protein: 20,
            carbs: 80,
            fat: 25,
          },
          dailyGoals: {
            calories: 2000,
            protein: 150,
            carbs: 200,
            fat: 65,
          },
          consumedToday: {
            calories: 1200,
            protein: 50,
            carbs: 130,
            fat: 40,
          },
        }),
      });

      const data = await response.json();

      expect(data.suggestions).toHaveLength(3);
      expect(data.alternativeMeals).toBeDefined();
    });
  });
});
