import type { Locale } from '../types';

export function getFoodCreatePrompt(locale: Locale, foodName: string, context?: string): string {
  if (locale === 'pt-BR') {
    return `Você precisa criar uma entrada de banco de dados de alimentos para um item que não está em nosso banco de dados.

ALIMENTO SOLICITADO: "${foodName}"
${context ? `CONTEXTO ADICIONAL: ${context}` : ''}

SUA TAREFA:
1. Pesquise valores nutricionais típicos para este alimento
2. Se for um item de restaurante/marca, use valores típicos para aquele tipo de item
3. Forneça valores por 100g (padrão para nosso banco de dados)
4. Inclua um tamanho de porção típico para referência

CONSIDERAÇÕES:
- Use valores nutricionais brasileiros quando disponíveis
- Para itens de restaurante, estime baseado em receitas típicas
- Seja conservador - melhor superestimar calorias do que subestimar
- Inclua fonte de onde você obteve a informação

Responda APENAS em formato JSON válido:
{
  "success": true,
  "food": {
    "name": "Nome do alimento em português",
    "brand": "Nome da marca/restaurante se aplicável",
    "protein_per_100g": número,
    "carbs_per_100g": número,
    "fat_per_100g": número,
    "fiber_per_100g": número,
    "calories_per_100g": número,
    "source": "ai_generated",
    "serving_size": {
      "unit": "unidade típica (ex: 1 porção, 1 unidade)",
      "grams": número estimado em gramas
    }
  },
  "confidence": 0.0-1.0,
  "sources": ["Lista de fontes usadas para estimativa"],
  "notes": "Notas sobre como os valores foram estimados"
}`;
  }

  return `You need to create a food database entry for an item not in our database.

REQUESTED FOOD: "${foodName}"
${context ? `ADDITIONAL CONTEXT: ${context}` : ''}

YOUR TASK:
1. Research typical nutritional values for this food
2. If it's a restaurant/brand item, use typical values for that type of item
3. Provide values per 100g (standard for our database)
4. Include a typical serving size for reference

CONSIDERATIONS:
- Use reliable nutritional databases as reference
- For restaurant items, estimate based on typical recipes
- Be conservative - better to overestimate calories than underestimate
- Include source of where you got the information

Respond ONLY in valid JSON format:
{
  "success": true,
  "food": {
    "name": "Food name in English",
    "brand": "Brand/restaurant name if applicable",
    "protein_per_100g": number,
    "carbs_per_100g": number,
    "fat_per_100g": number,
    "fiber_per_100g": number,
    "calories_per_100g": number,
    "source": "ai_generated",
    "serving_size": {
      "unit": "typical unit (e.g., 1 serving, 1 piece)",
      "grams": estimated grams number
    }
  },
  "confidence": 0.0-1.0,
  "sources": ["List of sources used for estimate"],
  "notes": "Notes on how values were estimated"
}`;
}
