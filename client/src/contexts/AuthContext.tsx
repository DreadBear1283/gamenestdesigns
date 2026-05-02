import type { SafeUser } from "../../../drizzle/schema";
import { trpc } from "@/lib/trpc";
import { createContext, ReactNode, useContext, useMemo } from "react";

type AuthValue = {
  user: SafeUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  refetch: () => Promise<unknown>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const meQuery = trpc.auth.me.useQuery(undefined, { staleTime: 60_000 });

  const value = useMemo<AuthValue>(
    () => ({
      user: (meQuery.data as SafeUser | null | undefined) ?? null,
      isLoading: meQuery.isLoading,
      isAdmin: (meQuery.data as SafeUser | null | undefined)?.role === "admin",
      refetch: () => meQuery.refetch(),
    }),
    [meQuery.data, meQuery.isLoading, meQuery.refetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
