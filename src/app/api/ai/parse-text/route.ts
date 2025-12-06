import { z } from 'zod';
import { success, serverError } from '@/lib/api/response';
import { getAuthenticatedUser } from '@/lib/api/auth';
import { validateBody } from '@/lib/api/validation';
import { createConversation, type Locale } from '@/lib/ai';
import { createClient } from '@/lib/supabase/server';

const parseTextSchema = z.object({
  text: z.string().min(1, 'Text is required').max(1000),
  conversation_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const validation = await validateBody(request, parseTextSchema);
  if (!validation.success) return validation.response;

  const { text } = validation.data;

  try {
    // Get user's locale and timezone
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('users_profile')
      .select('language, timezone')
      .eq('id', auth.user.id)
      .single();

    const locale = (profile?.language ?? 'en') as Locale;
    const timezone = profile?.timezone ?? 'UTC';

    // Create conversation and parse text
    const conversation = createConversation(auth.user.id, locale);
    const result = await conversation.parseText(text, timezone);

    return success({
      conversation_id: conversation.conversationId,
      result,
      needs_clarification: conversation.needsClarification,
      next_question: conversation.getNextQuestion(),
    });
  } catch (error) {
    console.error('AI parse text error:', error);
    return serverError('Failed to analyze text');
  }
}
