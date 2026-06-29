"use client";

import { authClient } from "@/lib/auth-client";
import { createContext, useContext } from "react";

type ClientSessionProps = ReturnType<typeof authClient.useSession>;
type FullSessionType = ClientSessionProps["data"];

interface AuthContextType {
  session: FullSessionType;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: AuthContextType["session"];
}) {
  const { data: clientSession } = authClient.useSession();

  const currentSession = clientSession ? clientSession : initialSession;

  return (
    <AuthContext.Provider value={{ session: currentSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
