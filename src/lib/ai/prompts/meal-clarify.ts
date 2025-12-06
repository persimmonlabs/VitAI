import type { Locale, MealParseResult } from '../types';

export function getMealClarifyPrompt(
  locale: Locale,
  previousResult: MealParseResult,
  userResponse: string,
  clarificationRound: number
): string {
  const itemsJson = JSON.stringify(previousResult.items, null, 2);

  if (locale === 'pt-BR') {
    return `Você está em uma conversa de esclarecimento sobre uma refeição (rodada ${clarificationRound} de 3 máximo).

RESULTADO ANTERIOR DA ANÁLISE:
${itemsJson}

RESPOSTA DO USUÁRIO AO ESCLARECIMENTO:
"${userResponse}"

SUA TAREFA:
1. Atualize os itens de alimento com base na resposta do usuário
2. Recalcule a confiança para os itens esclarecidos (deve aumentar)
3. Se ainda houver itens com confiança < 0.7, faça UMA pergunta de acompanhamento
4. Se esta é a rodada 3, faça seu melhor palpite e defina confiança para refletir incerteza

REGRAS:
- Seja conciso nas perguntas de acompanhamento
- Não repita perguntas já respondidas
- Use contexto brasileiro para estimativas de porção quando apropriado
- Se o usuário não souber, use valores médios típicos

Responda APENAS em formato JSON válido:
{
  "success": true,
  "items": [...], // itens atualizados
  "overall_confidence": 0.0-1.0,
  "clarifying_questions": [...], // apenas se ainda necessário E rodada < 3
  "clarification_complete": true/false
}`;
  }

  return `You are in a clarification conversation about a meal (round ${clarificationRound} of 3 maximum).

PREVIOUS ANALYSIS RESULT:
${itemsJson}

USER'S RESPONSE TO CLARIFICATION:
"${userResponse}"

YOUR TASK:
1. Update the food items based on the user's response
2. Recalculate confidence for clarified items (should increase)
3. If there are still items with confidence < 0.7, ask ONE follow-up question
4. If this is round 3, make your best guess and set confidence to reflect uncertainty

RULES:
- Be concise in follow-up questions
- Don't repeat questions already answered
- Use reasonable defaults if user is unsure
- Maximum one question per clarification round

Respond ONLY in valid JSON format:
{
  "success": true,
  "items": [...], // updated items
  "overall_confidence": 0.0-1.0,
  "clarifying_questions": [...], // only if still needed AND round < 3
  "clarification_complete": true/false
}`;
}
