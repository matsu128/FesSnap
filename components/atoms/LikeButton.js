import { supabase } from '../../lib/supabaseClient';
import { useState } from 'react';

export default function LikeButton({ imageId, likeCount, onLike, disabled }) {
  const [loading, setLoading] = useState(false);

  const handleLike = () => {
    if (disabled) return;
    if (onLike) onLike();
  };

  return (
    <button
      type="button"
      className="absolute bottom-1 right-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1.5 flex items-center gap-1 text-white text-xs transition-all duration-200 cursor-pointer backdrop-blur-sm"
      onClick={e => { e.stopPropagation(); handleLike(); }}
      disabled={disabled}
      aria-label="いいね"
    >
      <svg
        className="w-3.5 h-3.5 transition-all duration-200 text-white hover:text-red-300"
        viewBox="0 0 24 24"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      <span className="font-bold min-w-[1rem] text-center">{likeCount || 0}</span>
    </button>
  );
} 