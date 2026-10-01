"use client";

import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";

type SupabaseContext = {
  supabase: SupabaseClient | null;
  isLoaded: boolean;
};
const Context = createContext<SupabaseContext>({
  supabase: null,
  isLoaded: false,
});

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoaded: isSessionLoaded } = useSession();
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);
  const sessionId = session?.id;

  // Supabase's Clerk third-party auth integration: every request carries the
  // current Clerk session token, which RLS reads via requesting_user_id().
  const supabase = useMemo(() => {
    if (!sessionId) return null;

    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        accessToken: async () =>
          (await sessionRef.current?.getToken()) ?? null,
      }
    );
  }, [sessionId]);

  return (
    <Context.Provider
      value={{ supabase, isLoaded: isSessionLoaded && !!supabase }}
    >
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => useContext(Context);
