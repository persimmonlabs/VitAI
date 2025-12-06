import { createClient } from '@/lib/supabase/server';
import { success, serverError } from '@/lib/api/response';

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    return success({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return serverError('Failed to logout');
  }
}
