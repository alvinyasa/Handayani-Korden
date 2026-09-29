import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zecdzrxaytxvrxasqxip.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ufUbgUI_WEC7NnvyBGS6RA_S_ctB_d7';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
