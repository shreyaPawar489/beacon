"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type DemoUser = "maya" | "priya";
const STORAGE_KEY = "corroborate:user";

const isUser = (v: unknown): v is DemoUser => v === "maya" || v === "priya";

const UserContext = createContext<{ user: DemoUser; setUser: (u: DemoUser) => void }>({
  user: "maya",
  setUser: () => {},
});

// Priority: ?user= in the URL, then this tab's sessionStorage, then localStorage.
// sessionStorage is per tab, so two windows opened with ?user=maya and ?user=priya
// stay different users as you navigate.
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<DemoUser>("maya");

  useEffect(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("user");
      const saved = isUser(fromUrl)
        ? fromUrl
        : (sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY));
      if (isUser(saved)) {
        setUserState(saved);
        sessionStorage.setItem(STORAGE_KEY, saved);
      }
    } catch {}
  }, []);

  const setUser = (u: DemoUser) => {
    setUserState(u);
    try {
      sessionStorage.setItem(STORAGE_KEY, u);
      localStorage.setItem(STORAGE_KEY, u);
      const url = new URL(window.location.href);
      url.searchParams.set("user", u);
      window.history.replaceState(null, "", url);
    } catch {}
  };

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
