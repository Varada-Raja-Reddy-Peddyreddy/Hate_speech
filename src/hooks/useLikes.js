import { useState } from "react";
import { supabase } from "../lib/supabase";

export function useLikes(postId, initialCount, userId) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(Number(initialCount) || 0);

  async function toggle() {
    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    setCount(c => wasLiked ? c - 1 : c + 1);

    if (wasLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
      if (error) { setLiked(wasLiked); setCount(c => wasLiked ? c + 1 : c - 1); }
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({ post_id: postId, user_id: userId });
      if (error) { setLiked(wasLiked); setCount(c => wasLiked ? c + 1 : c - 1); }
    }
  }

  return { liked, count, toggle };
}
