import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { success, badRequest, conflict, serverError } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validation';
import { passwordSchema } from '@/domain/user';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').max(100),
});

export async function POST(request: Request) {
  const validation = await validateBody(request, registerSchema);
  if (!validation.success) return validation.response;

  const { email, password, name } = validation.data;

  try {
    const supabase = await createClient();

    // Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return conflict('Email already registered');
      }
      return badRequest(authError.message);
    }

    if (!authData.user) {
      return serverError('Failed to create user');
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users_profile')
      .insert({
        id: authData.user.id,
        name,
        email,
        onboarding_completed: false,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail the request - auth succeeded, profile can be created later
    }

    return success({
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      session: authData.session ? {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
      } : null,
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return serverError('Failed to register');
  }
}
