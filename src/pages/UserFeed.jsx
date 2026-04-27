import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../hooks/usePosts";
import Navbar from "../components/nav/Navbar";
import ComposeBox from "../components/feed/ComposeBox";
import PostCard from "../components/feed/PostCard";
import Spinner from "../components/shared/Spinner";

function FlagBanner({ profile, c }) {
  if (!profile?.flag_reason) return null;

  const isBanned = profile.is_banned;
  const actionLabel = isBanned ? "Banned" : profile.flag_action === "warning" ? "Warning" : "Flagged";
  const borderColor = isBanned ? c.h : c.o;
  const bgColor     = isBanned ? c.hBg : c.oBg;
  const textColor   = isBanned ? c.h : c.o;

  return (
    <div style={{
      padding: "14px 18px", borderRadius: 12, marginBottom: 16,
      background: bgColor, border: `1px solid ${borderColor}`,
      display: "flex", gap: 12, alignItems: "flex-start"
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{isBanned ? "🚫" : "⚠️"}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: textColor, marginBottom: 3 }}>
          Account {actionLabel}
        </div>
        <div style={{ fontSize: 13, color: c.t, lineHeight: 1.55 }}>
          <span style={{ color: c.t2 }}>Reason: </span>{profile.flag_reason}
        </div>
        {isBanned && (
          <div style={{ fontSize: 12, color: c.t2, marginTop: 4 }}>
            Your account has been banned. You can view the feed but cannot post.
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserFeed({ c, isDark, onToggleTheme }) {
  const { profile, signOut } = useAuth();
  const { posts, loading, addPostOptimistic } = usePosts(false);
  const [freshId, setFreshId] = useState(null);

  function handlePosted(post) {
    addPostOptimistic(post);
    setFreshId(post.id);
  }

  return (
    <div style={{ minHeight: "100vh", background: c.bg, fontFamily: "'DM Sans',sans-serif", transition: "background .3s" }}>
      <Navbar c={c} isDark={isDark} onToggleTheme={onToggleTheme} profile={profile} onSignOut={signOut} isAdmin={false} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px" }}>

        {/* Flagged / banned banner */}
        <FlagBanner profile={profile} c={c} />

        {/* Hide compose box if banned */}
        {!profile?.is_banned && (
          <ComposeBox profile={profile} c={c} onPosted={handlePosted} />
        )}

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Spinner c={c} size={24} />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: c.t2, fontSize: 14 }}>
            No posts yet. Be the first to post!
          </div>
        )}

        {posts.map(p => (
          <PostCard key={p.id} post={p} fresh={p.id === freshId} c={c} userId={profile?.id} />
        ))}
      </div>
    </div>
  );
}
