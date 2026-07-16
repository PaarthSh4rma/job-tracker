import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingEnvironmentVariables = [
  ["VITE_SUPABASE_URL", supabaseUrl],
  ["VITE_SUPABASE_ANON_KEY", supabaseAnonKey],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingEnvironmentVariables.length > 0) {
  throw new Error(
    `Missing required Supabase environment variables: ${missingEnvironmentVariables.join(
      ", ",
    )}`,
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
