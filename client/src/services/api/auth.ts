import {sleep} from '@app/utils/help';
import {Auth$Login$Response} from '@app/utils/types/api';

import { supabase } from '../../lib/supabase';

export class AuthApi {
  login = async (): Promise<Auth$Login$Response> => {
    // faking request
    await sleep(1000); // sleeping for 1s

    return {
      status: 'success',
      data: {
        'some-session-info?': {},
      },
    };
  };

  signIn =  async function (email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
  };

  signUp = async function (email: string, password: string) {
    return await supabase.auth.signUp({
      email: email,
      password: password,
    })
  };

  insertUserDetails = async function (details: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    mobile_number: string;
    gender: string;
    birthdate: string;
  }) {
    const { data, error } = await supabase
      .from('UserDetails')
      .insert([details]);

    return { data, error };
  };
}
