import { createContext } from "react";

export type SessionContextValue = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

// Split from SessionProvider.tsx/useSession.ts on purpose — a file exporting
// both a context/hook and a component breaks React Fast Refresh (it can't
// tell which parts are safe to hot-swap).
export const SessionContext = createContext<SessionContextValue | null>(null);
