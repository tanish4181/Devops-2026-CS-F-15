import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Landing from "./pages/Landing";
import { ThemeProvider } from "./lib/theme";

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </ThemeProvider>
  );
}
