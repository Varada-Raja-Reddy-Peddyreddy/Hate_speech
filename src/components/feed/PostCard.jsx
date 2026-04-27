import { useState } from "react";
import Avatar from "../shared/Avatar";
import { useLikes } from "../../hooks/useLikes";
import { initials } from "../../theme/colors";

export default function PostCard({ post, fresh, c, userId }) {
  const likesCount = post.likes_count?.[0]?.count ?? post.likes_count ?? 0;
  const { liked, count, toggle } = useLikes(post.id, likesCount, userId);

  const timeAgo = (ts) => {
    const diff = (Date.now() - new Date(ts)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  const author = post.author || {};
  const avatarLabel = initials(author.username || "?");

  return (
    <div style={{
      background: c.card, border: `1px solid ${c.b}`,
      borderLeft: `3px solid ${c.b}`,
      borderRadius: 14, padding: "18px 20px", marginBottom: 10,
      animation: fresh ? "pop .35s ease" : "none",
      transition: "background .3s,border-color .3s"
    }}>
      {/* Author row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <Avatar label={avatarLabel} color={author.avatar_color || "#7461f4"} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: c.t }}>
              @{author.username || "unknown"}
            </span>
            <span style={{ fontSize: 11, color: c.t2 }}>{timeAgo(post.created_at)}</span>
            <span style={{
              fontSize: 10, color: c.t2,
              border: `1px solid ${c.b}`, padding: "1px 7px", borderRadius: 99
            }}>{post.platform}</span>
          </div>
          <p style={{ fontSize: 14, color: c.t, lineHeight: 1.68 }}>{post.body}</p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 18, paddingLeft: 48 }}>
        <button
          onClick={toggle}
          style={{
            background: "none", border: "none",
            color: liked ? c.h : c.t2, fontSize: 12,
            cursor: "pointer", display: "flex", alignItems: "center",
            gap: 4, padding: 0, transition: "color .15s"
          }}
        >
          {liked ? "♥" : "♡"} {count}
        </button>
        <button style={{
          background: "none", border: "none", color: c.t2,
          fontSize: 12, cursor: "pointer", display: "flex",
          alignItems: "center", gap: 4, padding: 0
        }}>
          ◯ {post.comments_count || 0}
        </button>
        <button style={{
          background: "none", border: "none", color: c.t2,
          fontSize: 12, cursor: "pointer", display: "flex",
          alignItems: "center", gap: 4, padding: 0, marginLeft: "auto"
        }}>
          ↗ Share
        </button>
      </div>
    </div>
  );
}
