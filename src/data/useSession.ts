import { useContext } from "react";

import { SessionContext } from "./session-context";
import type { SessionContextValue } from "./session-context";

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
