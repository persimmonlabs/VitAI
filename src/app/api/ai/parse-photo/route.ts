import { z } from 'zod';
import { success, badRequest, serverError } from '@/lib/api/response';
import { getAuthenticatedUser } from '@/lib/api/auth';
import { validateBody } from '@/lib/api/validation';
import { createConversation, type Locale } from '@/lib/ai';
import { createClient } from '@/lib/supabase/server';

const parsePhotoSchema = z.object({
  image_base64: z.string().min(1, 'Image is required'),
  text: z.string().max(500).optional(), // Optional context about the image
});

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const validation = await validateBody(request, parsePhotoSchema);
  if (!validation.success) return validation.response;

  const { image_base64, text } = validation.data;

  // Validate base64 image
  if (!image_base64.match(/^[A-Za-z0-9+/=]+$/)) {
    return badRequest('Invalid base64 image');
  }

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

    // Create conversation and parse photo
    const conversation = createConversation(auth.user.id, locale);
    const result = await conversation.parsePhoto(image_base64, text, timezone);

    return success({
      conversation_id: conversation.conversationId,
      result,
      needs_clarification: conversation.needsClarification,
      next_question: conversation.getNextQuestion(),
    });
  } catch (error) {
    console.error('AI parse photo error:', error);
    return serverError('Failed to analyze photo');
  }
}
