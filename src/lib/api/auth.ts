import { createClient } from '@/lib/supabase/server';
import { unauthorized } from './response';
import type { NextResponse } from 'next/server';
import type { ApiErrorResponse } from './response';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export async function getAuthenticatedUser(): Promise<
  | { success: true; user: AuthenticatedUser }
  | { success: false; response: NextResponse<ApiErrorResponse> }
> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      success: false,
      response: unauthorized('Please log in to continue'),
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email ?? '',
    },
  };
}

export async function requireAuth(): Promise<AuthenticatedUser> {
  const result = await getAuthenticatedUser();

  if (!result.success) {
    throw new Error('Unauthorized');
  }

  return result.user;
}
