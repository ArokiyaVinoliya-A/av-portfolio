import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL =
    "https://oaszlwwissiauclonlsx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_yD8Q_u0keDoLRmzIolDqgw_tuDKOR98";

export const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );