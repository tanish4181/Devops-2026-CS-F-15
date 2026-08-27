import { createContext, createElement, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

const THEME_KEY = "bugpilot-theme";

type ThemeContextValue = {
  dark: boolean;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(getInitialTheme);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  return createElement(
    ThemeContext.Provider,
    { value: { dark, toggle: () => setDark((value) => !value) } },
    children,
  );
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("useTheme must be used within ThemeProvider");
  return theme;
}
