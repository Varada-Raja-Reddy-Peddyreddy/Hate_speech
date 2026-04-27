import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { getClr, FONTS } from "../../theme/colors";
import ThemeToggle from "../shared/ThemeToggle";

export default function AuthScreen({ isDark, onToggleTheme, c }) {
  const [tab,      setTab]      = useState("signin");
  const [email,    setEmail]    = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState("");
  const [msg,      setMsg]      = useState("");

  const dynStyle = `body{background:${c.bg};transition:background .3s}`;

  async function handleSignIn(e) {
    e.preventDefault();
    setBusy(true); setError(""); setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  }

  async function handleSignUp(e) {
    e.preventDefault();
    if (!username.trim()) { setError("Username is required"); return; }
    setBusy(true); setError(""); setMsg("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim(), avatar_color: getClr(username.trim()) } },
    });
    if (error) setError(error.message);
    else setMsg("Account created! You can now sign in.");
    setBusy(false);
  }

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    background: c.s, border: `1px solid ${c.b}`,
    borderRadius: 10, color: c.t, fontSize: 14,
    outline: "none", marginBottom: 12,
    transition: "border-color .2s,background .3s,color .3s",
    fontFamily: "'DM Sans',sans-serif",
  };

  return (
    <>
      <style>{FONTS + dynStyle}</style>
      <div style={{
        minHeight: "100vh", background: c.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans',sans-serif", padding: 20, transition: "background .3s"
      }}>
        <div style={{
          position: "fixed", top: "18%", left: "50%",
          transform: "translateX(-50%)",
          width: 680, height: 360,
          background: `radial-gradient(ellipse,${c.aG} 0%,transparent 65%)`,
          pointerEvents: "none", zIndex: 0
        }} />
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 10 }}>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} c={c} />
        </div>

        <div style={{
          background: c.card, border: `1px solid ${c.b}`,
          borderRadius: 22, padding: "48px 40px",
          maxWidth: 420, width: "100%",
          animation: "up .5s ease", position: "relative",
          zIndex: 1, transition: "background .3s,border-color .3s"
        }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 800,
              fontSize: 40, color: c.t, letterSpacing: -2,
              lineHeight: 1, transition: "color .3s"
            }}>
              SRMConnect<span style={{ color: c.ac }}>.</span>
            </div>
            <div style={{ fontSize: 12, color: c.t2, marginTop: 8 }}>
              Your campus social network
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: "flex", gap: 4, background: c.s,
            borderRadius: 10, padding: 4, marginBottom: 24,
            border: `1px solid ${c.b}`
          }}>
            {[["signin","Sign In"],["signup","Sign Up"]].map(([id, lbl]) => (
              <button
                key={id}
                onClick={() => { setTab(id); setError(""); setMsg(""); }}
                style={{
                  flex: 1, padding: "8px", borderRadius: 8, border: "none",
                  background: tab === id ? c.ac : "transparent",
                  color: tab === id ? "#fff" : c.t2,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "all .2s", fontFamily: "'DM Sans',sans-serif"
                }}
              >{lbl}</button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={tab === "signin" ? handleSignIn : handleSignUp}>
            <label style={{ fontSize: 12, color: c.t2, display: "block", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = c.ac}
              onBlur={e => e.target.style.borderColor = c.b}
            />

            {tab === "signup" && (
              <>
                <label style={{ fontSize: 12, color: c.t2, display: "block", marginBottom: 6 }}>
                  Username
                </label>
                <input
                  type="text" required value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="yourname"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = c.ac}
                  onBlur={e => e.target.style.borderColor = c.b}
                />
              </>
            )}

            <label style={{ fontSize: 12, color: c.t2, display: "block", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ ...inputStyle, marginBottom: 20 }}
              onFocus={e => e.target.style.borderColor = c.ac}
              onBlur={e => e.target.style.borderColor = c.b}
            />

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 14,
                background: c.hBg, border: `1px solid ${c.hBd}`,
                color: c.h, fontSize: 12
              }}>{error}</div>
            )}
            {msg && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 14,
                background: c.nBg, border: `1px solid ${c.nBd}`,
                color: c.n, fontSize: 12
              }}>{msg}</div>
            )}

            <button
              type="submit" disabled={busy}
              style={{
                width: "100%", padding: "13px", borderRadius: 10, border: "none",
                background: busy ? c.b : c.ac,
                color: busy ? c.t2 : "#fff",
                fontSize: 14, fontWeight: 700,
                cursor: busy ? "default" : "pointer",
                fontFamily: "'Syne',sans-serif", letterSpacing: .3,
                transition: "background .2s"
              }}
            >
              {busy ? "Please wait…" : tab === "signin" ? "Sign In →" : "Create Account →"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
