import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";

function Landing() {
  return null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
