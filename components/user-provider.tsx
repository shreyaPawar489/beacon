"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type DemoUser = "maya" | "priya";
const STORAGE_KEY = "corroborate:user";

const UserContext = createContext<{ user: DemoUser; setUser: (u: DemoUser) => void }>({
  user: "maya",
  setUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<DemoUser>("maya");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "maya" || saved === "priya") setUserState(saved);
    } catch {}
  }, []);

  const setUser = (u: DemoUser) => {
    setUserState(u);
    try {
      localStorage.setItem(STORAGE_KEY, u);
    } catch {}
  };

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
