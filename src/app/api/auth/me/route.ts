import { createClient } from '@/lib/supabase/server';
import { success } from '@/lib/api/response';
import { getAuthenticatedUser } from '@/lib/api/auth';

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('users_profile')
    .select('*')
    .eq('id', auth.user.id)
    .single();

  return success({
    user: {
      id: auth.user.id,
      email: auth.user.email,
      profile,
    },
  });
}
