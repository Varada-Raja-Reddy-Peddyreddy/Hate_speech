import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Likes count is fetched separately per post via useLikes hook
const USER_QUERY = `
  id, body, platform, created_at,
  author:profiles!posts_author_id_fkey(username, avatar_color)
`;

const ADMIN_QUERY = `
  id, body, platform, is_flagged, created_at,
  author:profiles!posts_author_id_fkey(id, username, avatar_color, is_banned, flag_reason, flag_action),
  classification:classifications(class_id, class_label, confidence, reasoning)
`;

export function usePosts(isAdmin = false) {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select(isAdmin ? ADMIN_QUERY : USER_QUERY)
      .order("created_at", { ascending: false })
      .range(0, 49);

    if (error) {
      console.error("usePosts fetch error:", error.message, error.details);
    }
    if (data) setPosts(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("posts-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" },
        () => fetchPosts()
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts" },
        () => fetchPosts()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [isAdmin]);

  function addPostOptimistic(post) {
    setPosts(prev => [post, ...prev]);
  }

  function updatePostClassification(postId, classification) {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, classification, is_flagged: classification.class_id === 0 }
          : p
      )
    );
  }

  return { posts, loading, addPostOptimistic, updatePostClassification, refetch: fetchPosts };
}
