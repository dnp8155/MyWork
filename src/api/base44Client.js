import { supabaseEntities } from '@/lib/supabaseEntities';
import { getSupabase } from '@/lib/supabaseClient';

export const base44 = {
  entities: supabaseEntities,
  auth: {
    async me() {
      const sb = await getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      return user;
    },
    async logout() {
      const sb = await getSupabase();
      await sb.auth.signOut();
    }
  }
};