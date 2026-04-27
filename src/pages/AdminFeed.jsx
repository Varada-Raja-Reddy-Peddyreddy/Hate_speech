import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../hooks/usePosts";
import Navbar from "../components/nav/Navbar";
import ComposeBox from "../components/feed/ComposeBox";
import AdminPostCard from "../components/admin/AdminPostCard";
import StatsPanel from "../components/admin/StatsPanel";
import Spinner from "../components/shared/Spinner";

export default function AdminFeed({ c, isDark, onToggleTheme }) {
  const { profile, signOut } = useAuth();
  const { posts, loading, addPostOptimistic } = usePosts(true);
  const [tab,     setTab]     = useState("home");
  const [freshId, setFreshId] = useState(null);

  function handlePosted(post) {
    addPostOptimistic(post);
    setFreshId(post.id);
  }

  const tabPosts = tab === "flagged"
    ? posts.filter(p => p.is_flagged || (p.classification && p.classification.class_id < 2))
    : posts;

  return (
    <div style={{ minHeight: "100vh", background: c.bg, fontFamily: "'DM Sans',sans-serif", transition: "background .3s" }}>
      <Navbar
        c={c} isDark={isDark} onToggleTheme={onToggleTheme}
        profile={profile} onSignOut={signOut} isAdmin={true}
        tab={tab} onTabChange={setTab}
      />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px", display: "grid", gridTemplateColumns: "minmax(0,1fr) 260px", gap: 20, alignItems: "start" }}>
        <div>
          {tab === "home" && <ComposeBox profile={profile} c={c} onPosted={handlePosted} />}

          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Spinner c={c} size={24} />
            </div>
          )}

          {!loading && tabPosts.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: c.t2, fontSize: 14 }}>
              No posts here yet.
            </div>
          )}

          {tabPosts.map(p => (
            <AdminPostCard key={p.id} post={p} fresh={p.id === freshId} c={c} userId={profile?.id} />
          ))}
        </div>

        <StatsPanel posts={posts} c={c} />
      </div>
    </div>
  );
}
