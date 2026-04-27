import Avatar from "../shared/Avatar";
import ThemeToggle from "../shared/ThemeToggle";
import { initials } from "../../theme/colors";

export default function Navbar({ c, isDark, onToggleTheme, profile, onSignOut, isAdmin, tab, onTabChange }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 100,
      background: c.navBg, backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${c.b}`,
      transition: "background .3s,border-color .3s"
    }}>
      <div style={{
        maxWidth: isAdmin ? 960 : 640,
        margin: "0 auto", padding: "0 20px",
        height: 60, display: "flex", alignItems: "center", gap: 16
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800,
          fontSize: 22, color: c.t, letterSpacing: -1,
          marginRight: 4, transition: "color .3s", flexShrink: 0
        }}>
          SRMConnect<span style={{ color: c.ac }}>.</span>
        </div>

        {/* Admin tabs */}
        {isAdmin && (
          <div style={{ display: "flex", gap: 4, flex: 1 }}>
            {[["home","Home"],["flagged","Flagged ⚑"]].map(([id, lbl]) => (
              <button
                key={id}
                onClick={() => onTabChange && onTabChange(id)}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  background: tab === id ? c.b : "transparent",
                  color: tab === id ? c.t : c.t2,
                  fontSize: 13, fontWeight: tab === id ? 600 : 400,
                  cursor: "pointer", transition: "all .15s"
                }}
              >{lbl}</button>
            ))}
          </div>
        )}

        {!isAdmin && <div style={{ flex: 1 }} />}

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isAdmin && (
            <span style={{
              fontSize: 10, color: c.ac, background: c.aG,
              border: `1px solid ${c.ac}40`,
              padding: "2px 8px", borderRadius: 99, fontWeight: 600
            }}>
              ADMIN
            </span>
          )}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} c={c} />
          <div style={{ width: 1, height: 20, background: c.b }} />
          <span style={{ fontSize: 12, color: c.t2 }}>@{profile?.username}</span>
          <Avatar label={initials(profile?.username || "?")} color={profile?.avatar_color || "#7461f4"} size={30} />
          <button
            onClick={onSignOut}
            style={{
              padding: "4px 12px", borderRadius: 8,
              border: `1px solid ${c.b}`, background: "transparent",
              color: c.t2, fontSize: 12, cursor: "pointer",
              transition: "all .15s"
            }}
            onMouseEnter={e => { e.target.style.borderColor = c.h; e.target.style.color = c.h; }}
            onMouseLeave={e => { e.target.style.borderColor = c.b; e.target.style.color = c.t2; }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
