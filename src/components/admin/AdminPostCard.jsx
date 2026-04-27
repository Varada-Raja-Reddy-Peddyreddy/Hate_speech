import { useState } from "react";
import Avatar from "../shared/Avatar";
import { useLikes } from "../../hooks/useLikes";
import { initials } from "../../theme/colors";
import UserFlagModal from "./UserFlagModal";

function Badge({ cls, c }) {
  const MAP = [
    { label: "Hate Speech", dot: c.h, bg: c.hBg, bd: c.hBd },
    { label: "Offensive",   dot: c.o, bg: c.oBg, bd: c.oBd },
    { label: "Neutral",     dot: c.n, bg: c.nBg, bd: c.nBd },
  ];
  const m = MAP[cls.class_id] || MAP[2];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 99,
      background: m.bg, border: `1px solid ${m.bd}`,
      color: m.dot, fontSize: 11, fontWeight: 600,
      whiteSpace: "nowrap", letterSpacing: .1
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot, display: "inline-block" }} />
      {m.label} · {(cls.confidence * 100).toFixed(0)}%
    </span>
  );
}

export default function AdminPostCard({ post, fresh, c, userId }) {
  const [expanded,   setExpanded]   = useState(false);
  const [flagModal,  setFlagModal]  = useState(false);

  const cls = post.classification;
  const { liked, count, toggle } = useLikes(post.id, 0, userId);

  const leftClr = cls
    ? cls.class_id === 0 ? c.h : cls.class_id === 1 ? c.o : c.b
    : c.b;

  const timeAgo = (ts) => {
    const diff = (Date.now() - new Date(ts)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  const author = post.author || {};

  return (
    <>
      <div style={{
        background: c.card, border: `1px solid ${c.b}`,
        borderLeft: `3px solid ${leftClr}`,
        borderRadius: 14, padding: "18px 20px", marginBottom: 10,
        animation: fresh ? "pop .35s ease" : "none",
        transition: "background .3s,border-color .3s"
      }}>
        {/* Author */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <Avatar label={initials(author.username || "?")} color={author.avatar_color || "#7461f4"} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: c.t }}>@{author.username}</span>
              <span style={{ fontSize: 11, color: c.t2 }}>{timeAgo(post.created_at)}</span>
              <span style={{ fontSize: 10, color: c.t2, border: `1px solid ${c.b}`, padding: "1px 7px", borderRadius: 99 }}>{post.platform}</span>
              {post.is_flagged && (
                <span style={{ fontSize: 10, color: c.h, background: c.hBg, border: `1px solid ${c.hBd}`, padding: "1px 8px", borderRadius: 99 }}>
                  Flagged
                </span>
              )}
              {author.is_banned && (
                <span style={{ fontSize: 10, color: "#fff", background: c.h, padding: "1px 8px", borderRadius: 99 }}>
                  Banned
                </span>
              )}
            </div>
            <p style={{ fontSize: 14, color: c.t, lineHeight: 1.68 }}>{post.body}</p>
          </div>
        </div>

        {/* Classification badge or pending */}
        <div style={{ paddingLeft: 48, marginBottom: 12 }}>
          {cls
            ? <Badge cls={cls} c={c} />
            : <span style={{ fontSize: 11, color: c.t3, fontStyle: "italic" }}>Classifying…</span>
          }
        </div>

        {/* Accordion — HateGuard details */}
        {cls && (
          <div
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: "10px 14px", background: c.s, borderRadius: 10,
              cursor: "pointer", border: `1px solid ${c.b}`,
              marginBottom: 12, transition: "background .2s,border-color .3s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = c.bHov}
            onMouseLeave={e => e.currentTarget.style.background = c.s}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.n, display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 11, color: c.ac, fontWeight: 600 }}>HateGuard-7B</span>
              <span style={{ fontSize: 10, color: c.t3 }}>· Davidson (2017) BERT</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: c.t2, transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s", display: "inline-block" }}>▾</span>
            </div>
            {expanded && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${c.b}`, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: c.t3, minWidth: 74 }}>Class</span>
                  <Badge cls={cls} c={c} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: c.t3 }}>Confidence</span>
                    <span style={{ fontSize: 11, color: c.t, fontWeight: 600 }}>{(cls.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 4, background: c.b, borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${cls.confidence * 100}%`, background: cls.class_id === 0 ? c.h : cls.class_id === 1 ? c.o : c.n, borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ fontSize: 12, color: c.t2, lineHeight: 1.55 }}>
                  <span style={{ color: c.t3 }}>Reasoning  </span>
                  <span style={{ color: c.t }}>{cls.reasoning}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 18 }}>
          <button onClick={toggle} style={{ background: "none", border: "none", color: liked ? c.h : c.t2, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0, transition: "color .15s" }}>
            {liked ? "♥" : "♡"} {count}
          </button>
          <button style={{ background: "none", border: "none", color: c.t2, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
            ◯ {post.comments_count || 0}
          </button>
          <button
            onClick={() => setFlagModal(true)}
            style={{
              marginLeft: "auto", padding: "4px 12px", borderRadius: 99,
              border: `1px solid ${c.hBd}`, background: c.hBg,
              color: c.h, fontSize: 11, fontWeight: 600, cursor: "pointer"
            }}
          >
            ⚑ Flag User
          </button>
        </div>
      </div>

      {flagModal && (
        <UserFlagModal
          targetUser={author}
          onClose={() => setFlagModal(false)}
          c={c}
        />
      )}
    </>
  );
}
