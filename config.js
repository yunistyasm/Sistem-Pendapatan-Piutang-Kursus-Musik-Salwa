// Public browser config: use only the Supabase project URL and publishable key.
// Never put a service_role or secret key in this file.
const SUPABASE_URL = "https://ruosvzyqcwhzyhiizlci.supabase.co";
const SUPABASE_KEY = "sb_publishable_bRx4p4G50gttd5juc_8i6w_1p47rRSF";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);