import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { success, unauthorized, badRequest, serverError } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validation';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: Request) {
  const validation = await validateBody(request, loginSchema);
  if (!validation.success) return validation.response;

  const { email, password } = validation.data;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return unauthorized('Invalid email or password');
      }
      return badRequest(error.message);
    }

    if (!data.user || !data.session) {
      return unauthorized('Login failed');
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return success({
      user: {
        id: data.user.id,
        email: data.user.email,
        profile,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return serverError('Failed to login');
  }
}
