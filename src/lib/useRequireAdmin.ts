"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";

export function useRequireAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let hasAuthEvent = false;

    const checkAdmin = async (
      session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"],
      shouldRedirect = false,
    ) => {
      const user = session?.user;

      if (!user) {
        if (shouldRedirect && isMounted) {
          setLoading(false);
          router.replace("/login");
        }
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error || profile?.role !== "admin") {
        if (isMounted) setLoading(false);
        router.replace("/login");
        return;
      }

      if (isMounted) setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        hasAuthEvent = true;
        void checkAdmin(session, true);
      },
    );

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void checkAdmin(session, hasAuthEvent);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return loading;
}
