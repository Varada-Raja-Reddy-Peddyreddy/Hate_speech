import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthScreen from "./components/auth/AuthScreen";
import UserFeed from "./pages/UserFeed";
import AdminFeed from "./pages/AdminFeed";
import Spinner from "./components/shared/Spinner";
import { DARK, LIGHT, FONTS } from "./theme/colors";

function AppRouter() {
  const { session, profile, loading } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const c = isDark ? DARK : LIGHT;

  const dynStyle = `
    body{background:${c.bg};transition:background .3s}
    ::-webkit-scrollbar-track{background:${c.scrollTrack}}
    ::-webkit-scrollbar-thumb{background:${c.scrollThumb};border-radius:4px}
  `;

  if (loading) {
    return (
      <>
        <style>{FONTS + dynStyle}</style>
        <div style={{
          minHeight: "100vh", background: c.bg,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Spinner c={c} size={32} />
        </div>
      </>
    );
  }

  if (!session || !profile) {
    return (
      <>
        <style>{FONTS + dynStyle}</style>
        <AuthScreen isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} c={c} />
      </>
    );
  }

  return (
    <>
      <style>{FONTS + dynStyle}</style>
      {profile.role === "admin"
        ? <AdminFeed c={c} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
        : <UserFeed  c={c} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
      }
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>
);
