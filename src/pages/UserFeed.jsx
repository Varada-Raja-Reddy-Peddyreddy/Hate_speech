import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../hooks/usePosts";
import Navbar from "../components/nav/Navbar";
import ComposeBox from "../components/feed/ComposeBox";
import PostCard from "../components/feed/PostCard";
import Spinner from "../components/shared/Spinner";

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
        <ComposeBox profile={profile} c={c} onPosted={handlePosted} />

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
