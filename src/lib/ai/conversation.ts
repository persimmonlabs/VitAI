import { v4 as uuid } from 'uuid';
import type {
  ConversationState,
  ConversationMessage,
  MealParseResult,
  Locale,
  AIMessage,
} from './types';
import { CONFIDENCE_THRESHOLD, MAX_CLARIFICATION_ROUNDS } from './types';
import { getAIClient } from './client';
import {
  getMealParseTextPrompt,
  getMealParsePhotoPrompt,
  getMealClarifyPrompt,
} from './prompts';

export class ConversationManager {
  private state: ConversationState;

  constructor(userId: string, locale: Locale = 'en') {
    this.state = {
      id: uuid(),
      user_id: userId,
      messages: [],
      clarification_round: 0,
      max_clarification_rounds: MAX_CLARIFICATION_ROUNDS,
      locale,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  get conversationId(): string {
    return this.state.id;
  }

  get currentResult(): MealParseResult | undefined {
    return this.state.current_parse_result;
  }

  get needsClarification(): boolean {
    const result = this.state.current_parse_result;
    if (!result) return false;

    return (
      result.overall_confidence < CONFIDENCE_THRESHOLD &&
      this.state.clarification_round < this.state.max_clarification_rounds &&
      (result.clarifying_questions?.length ?? 0) > 0
    );
  }

  get isComplete(): boolean {
    const result = this.state.current_parse_result;
    if (!result) return false;

    return (
      result.overall_confidence >= CONFIDENCE_THRESHOLD ||
      this.state.clarification_round >= this.state.max_clarification_rounds
    );
  }

  async parseText(
    text: string,
    timezone: string = 'UTC'
  ): Promise<MealParseResult> {
    const systemPrompt = getMealParseTextPrompt(this.state.locale, timezone);

    this.addMessage({
      role: 'user',
      content: text,
      timestamp: new Date(),
    });

    const client = getAIClient();
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ];

    const response = await client.chat(messages);
    const content = response.choices[0]?.message.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const result = this.parseJsonResponse(content);

    this.addMessage({
      role: 'assistant',
      content: content,
      timestamp: new Date(),
      metadata: { parsed_result: result },
    });

    this.state.current_parse_result = result;
    return result;
  }

  async parsePhoto(
    imageBase64: string,
    text?: string,
    timezone: string = 'UTC'
  ): Promise<MealParseResult> {
    const systemPrompt = getMealParsePhotoPrompt(this.state.locale, timezone);

    this.addMessage({
      role: 'user',
      content: text ?? 'Analyze this food image',
      timestamp: new Date(),
      metadata: { image_base64: imageBase64.substring(0, 100) + '...' }, // Store truncated for logging
    });

    const client = getAIClient();
    const response = await client.chatWithVision(
      systemPrompt,
      text ?? '',
      imageBase64
    );

    const content = response.choices[0]?.message.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const result = this.parseJsonResponse(content);

    this.addMessage({
      role: 'assistant',
      content: content,
      timestamp: new Date(),
      metadata: { parsed_result: result },
    });

    this.state.current_parse_result = result;
    return result;
  }

  async processClarification(userResponse: string): Promise<MealParseResult> {
    if (!this.state.current_parse_result) {
      throw new Error('No previous result to clarify');
    }

    this.state.clarification_round++;

    const systemPrompt = getMealClarifyPrompt(
      this.state.locale,
      this.state.current_parse_result,
      userResponse,
      this.state.clarification_round
    );

    this.addMessage({
      role: 'user',
      content: userResponse,
      timestamp: new Date(),
    });

    const client = getAIClient();
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userResponse },
    ];

    const response = await client.chat(messages);
    const content = response.choices[0]?.message.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const result = this.parseJsonResponse(content);

    this.addMessage({
      role: 'assistant',
      content: content,
      timestamp: new Date(),
      metadata: { parsed_result: result },
    });

    this.state.current_parse_result = result;
    return result;
  }

  getNextQuestion(): string | null {
    const result = this.state.current_parse_result;
    if (!result?.clarifying_questions?.length) {
      return null;
    }

    return result.clarifying_questions[0]?.question ?? null;
  }

  getState(): ConversationState {
    return { ...this.state };
  }

  private addMessage(message: ConversationMessage): void {
    this.state.messages.push(message);
    this.state.updated_at = new Date();
  }

  private parseJsonResponse(content: string): MealParseResult {
    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;

    try {
      const parsed = JSON.parse(jsonString?.trim() ?? '{}') as MealParseResult;

      // Ensure required fields
      return {
        success: parsed.success ?? true,
        items: parsed.items ?? [],
        overall_confidence: parsed.overall_confidence ?? 0.5,
        meal_type_suggestion: parsed.meal_type_suggestion,
        clarifying_questions: parsed.clarifying_questions,
        error: parsed.error,
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        success: false,
        items: [],
        overall_confidence: 0,
        error: 'Failed to parse AI response',
      };
    }
  }
}

// Factory function
export function createConversation(
  userId: string,
  locale: Locale = 'en'
): ConversationManager {
  return new ConversationManager(userId, locale);
}
