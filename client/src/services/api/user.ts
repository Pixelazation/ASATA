import { supabase } from '../../lib/supabase';

export const UserApi = {
  updateTimezone: async () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("UserDetails")
      .update({timezone: timezone})
      .eq('user_id', user.id);

    if (error) throw error;
  }
}