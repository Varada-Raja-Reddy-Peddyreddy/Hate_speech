import { useState } from "react";
import Avatar from "../shared/Avatar";
import Spinner from "../shared/Spinner";
import { supabase } from "../../lib/supabase";
import { initials } from "../../theme/colors";

export default function ComposeBox({ profile, c, onPosted }) {
  const [text,     setText]     = useState("");
  const [platform, setPlatform] = useState("Post");
  const [busy,     setBusy]     = useState(false);

  const LIMITS = { Tweet: 280, Post: 500, Thread: 1000, Blog: 3000 };
  const limit  = LIMITS[platform];
  const over   = text.length > limit;
  const canGo  = text.trim().length > 0 && !over && !busy;

  async function handleSubmit() {
    if (!canGo) return;
    setBusy(true);

    // 1. Insert post into Supabase
    const { data: post, error } = await supabase
      .from("posts")
      .insert({ body: text.trim(), platform, author_id: profile.id })
      .select(`id, body, platform, created_at,
               author:profiles(username, avatar_color),
               likes_count:likes(count)`)
      .single();

    if (error) { console.error(error); setBusy(false); return; }

    setText("");
    onPosted && onPosted(post);

    // 2. Background classification — fire and forget
    fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: post.body, post_id: post.id }),
    }).catch(console.error);

    setBusy(false);
  }

  return (
    <div style={{
      background: c.card, border: `1px solid ${c.b}`,
      borderRadius: 14, padding: "18px 20px", marginBottom: 14,
      transition: "background .3s,border-color .3s"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <Avatar label={initials(profile.username)} color={profile.avatar_color} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Tweet","Post","Thread","Blog"].map(p => (
            <button key={p} onClick={() => setPlatform(p)} style={{
              padding: "4px 13px", borderRadius: 99,
              border: `1px solid ${platform === p ? c.ac : c.b}`,
              background: platform === p ? c.aG : "transparent",
              color: platform === p ? c.ac : c.t2,
              fontSize: 12, cursor: "pointer", transition: "all .15s"
            }}>{p}</button>
          ))}
        </div>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={`What's on your mind, @${profile.username}?`}
        style={{
          width: "100%", minHeight: 90, background: "transparent",
          border: "none", color: c.t, fontSize: 14,
          lineHeight: 1.65, resize: "none", outline: "none", padding: 0,
          fontFamily: "'DM Sans',sans-serif"
        }}
      />

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 12, borderTop: `1px solid ${c.b}`, marginTop: 8
      }}>
        <span style={{ fontSize: 11, color: over ? c.h : c.t2 }}>
          {text.length}/{limit}{over && " · too long"}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!canGo}
          style={{
            padding: "8px 22px", borderRadius: 99, border: "none",
            background: canGo ? c.ac : c.b,
            color: canGo ? "#fff" : c.t2,
            fontSize: 13, fontWeight: 600,
            cursor: canGo ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", gap: 8,
            transition: "background .15s",
            fontFamily: "'Syne',sans-serif", letterSpacing: .2
          }}
        >
          {busy && <Spinner c={c} />}
          {busy ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}
