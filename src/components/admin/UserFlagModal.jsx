import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function UserFlagModal({ targetUser, onClose, c }) {
  const { profile: adminProfile } = useAuth();
  const [reason, setReason]   = useState("");
  const [action, setAction]   = useState("warning");
  const [busy,   setBusy]     = useState(false);
  const [done,   setDone]     = useState(false);

  async function handleSubmit() {
    if (!reason.trim()) return;
    setBusy(true);

    await supabase.from("user_flags").insert({
      flagged_user_id: targetUser.id,
      admin_id: adminProfile.id,
      reason: reason.trim(),
      action,
    });

    if (action === "ban") {
      await supabase.from("profiles").update({ is_banned: true }).eq("id", targetUser.id);
    } else if (action === "unban") {
      await supabase.from("profiles").update({ is_banned: false }).eq("id", targetUser.id);
    }

    setBusy(false);
    setDone(true);
    setTimeout(onClose, 1200);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        background: c.card, border: `1px solid ${c.b}`,
        borderRadius: 18, padding: "32px 28px",
        maxWidth: 400, width: "100%",
        animation: "pop .25s ease"
      }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
            <div style={{ color: c.n, fontWeight: 600 }}>Action recorded</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: c.t, marginBottom: 4 }}>
              Flag User
            </div>
            <div style={{ fontSize: 12, color: c.t2, marginBottom: 20 }}>
              @{targetUser.username}
            </div>

            <label style={{ fontSize: 12, color: c.t2, display: "block", marginBottom: 6 }}>Action</label>
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {["warning","ban","unban"].map(a => (
                <button key={a} onClick={() => setAction(a)} style={{
                  flex: 1, padding: "7px", borderRadius: 8, border: `1px solid ${action === a ? c.ac : c.b}`,
                  background: action === a ? c.aG : "transparent",
                  color: action === a ? c.ac : c.t2,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  textTransform: "capitalize"
                }}>{a}</button>
              ))}
            </div>

            <label style={{ fontSize: 12, color: c.t2, display: "block", marginBottom: 6 }}>Reason</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe why this action is being taken…"
              rows={3}
              style={{
                width: "100%", padding: "10px 14px",
                background: c.s, border: `1px solid ${c.b}`,
                borderRadius: 10, color: c.t, fontSize: 13,
                resize: "none", outline: "none", marginBottom: 16,
                fontFamily: "'DM Sans',sans-serif"
              }}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${c.b}`,
                background: "transparent", color: c.t2, fontSize: 13, cursor: "pointer"
              }}>Cancel</button>
              <button onClick={handleSubmit} disabled={busy || !reason.trim()} style={{
                flex: 1, padding: "10px", borderRadius: 10, border: "none",
                background: action === "ban" ? c.h : c.ac,
                color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: busy || !reason.trim() ? "not-allowed" : "pointer",
                opacity: busy || !reason.trim() ? .6 : 1
              }}>
                {busy ? "Saving…" : "Confirm"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
