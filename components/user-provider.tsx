"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Anonymous identity per device. No name, email or account: the first visit
// generates a random private ID, kept in localStorage, that owns this device's
// reports. People see a friendly pseudonym derived from it ("Quiet Fern").
//
// `?user=<id>` overrides it for the current tab only (sessionStorage), which is
// handy for running two identities side by side on one laptop.

const DEVICE_KEY = "corroborate:device";
const TAB_KEY = "corroborate:tab-user";

const ADJECTIVES = ["Quiet", "Brave", "Gentle", "Steady", "Bright", "Calm", "Kind", "Bold", "Clear", "Warm", "Swift", "Golden"];
const NOUNS = ["Fern", "River", "Willow", "Harbor", "Sparrow", "Cedar", "Meadow", "Lantern", "Comet", "Juniper", "Tide", "Aster"];

// Works over plain http too (crypto.randomUUID needs a secure context).
function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return "u_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function pseudonym(id: string): string {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `${ADJECTIVES[h % ADJECTIVES.length]} ${NOUNS[Math.floor(h / ADJECTIVES.length) % NOUNS.length]}`;
}

type UserContextValue = {
  /** Private ID that owns this device's reports. null until loaded on the client. */
  user: string | null;
  name: string;
  /** Forget this device's identity and start a fresh one (for shared/booth devices). */
  startFresh: () => void;
};

const UserContext = createContext<UserContextValue>({ user: null, name: "", startFresh: () => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    let id: string | null = null;
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("user");
      if (fromUrl) sessionStorage.setItem(TAB_KEY, fromUrl);
      id = sessionStorage.getItem(TAB_KEY) ?? localStorage.getItem(DEVICE_KEY);
      if (!id) {
        id = newId();
        localStorage.setItem(DEVICE_KEY, id);
      }
    } catch {
      id = newId(); // storage blocked (private mode): identity lasts for this page only
    }
    setUser(id);
  }, []);

  const startFresh = useCallback(() => {
    const id = newId();
    try {
      sessionStorage.removeItem(TAB_KEY);
      localStorage.setItem(DEVICE_KEY, id);
      const url = new URL(window.location.href);
      url.searchParams.delete("user");
      window.history.replaceState(null, "", url);
    } catch {}
    setUser(id);
  }, []);

  return (
    <UserContext.Provider value={{ user, name: user ? pseudonym(user) : "", startFresh }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
