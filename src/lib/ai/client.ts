import type { AIMessage, AIResponse, AITool, AIClientConfig } from './types';

const DEFAULT_CONFIG: AIClientConfig = {
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
  model: process.env.OPENROUTER_MODEL ?? 'google/gemini-pro',
  baseUrl: 'https://openrouter.ai/api/v1',
  maxTokens: 4096,
  temperature: 0.3, // Lower for more consistent JSON output
};

export class AIClient {
  private config: AIClientConfig;

  constructor(config?: Partial<AIClientConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async chat(
    messages: AIMessage[],
    options?: {
      tools?: AITool[];
      stream?: boolean;
      temperature?: number;
    }
  ): Promise<AIResponse> {
    const { tools, stream = false, temperature } = options ?? {};

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'VitAI Nutrition Tracker',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: this.config.maxTokens,
        temperature: temperature ?? this.config.temperature,
        tools: tools,
        stream,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<AIResponse>;
  }

  async chatWithVision(
    systemPrompt: string,
    userText: string,
    imageBase64: string,
    options?: {
      tools?: AITool[];
    }
  ): Promise<AIResponse> {
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userText || 'Analyze this food image' },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ];

    return this.chat(messages, options);
  }

  async *chatStream(
    messages: AIMessage[],
    options?: {
      tools?: AITool[];
      temperature?: number;
    }
  ): AsyncGenerator<string, void, undefined> {
    const { tools, temperature } = options ?? {};

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'VitAI Nutrition Tracker',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: this.config.maxTokens,
        temperature: temperature ?? this.config.temperature,
        tools: tools,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data) as {
              choices: { delta: { content?: string } }[];
            };
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }
  }
}

// Singleton instance
let clientInstance: AIClient | null = null;

export function getAIClient(): AIClient {
  if (!clientInstance) {
    clientInstance = new AIClient();
  }
  return clientInstance;
}

export function createAIClient(config?: Partial<AIClientConfig>): AIClient {
  return new AIClient(config);
}
