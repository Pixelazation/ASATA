import { supabase } from '@app/lib/supabase';

export const fetchUserData = async () => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('UserDetails')
    .select('email, first_name, last_name, birthdate, gender, mobile_number')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error) {
    throw new Error('Error fetching user data');
  }

  return data;
};

export const updateUserData = async (userId, updateData) => {
  const { error } = await supabase
    .from('UserDetails')
    .update(updateData)
    .eq('user_id', userId);

  if (error) {
    throw new Error('Error updating user data');
  }
};