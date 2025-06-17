"use client";

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LikeButtonProps {
  postId: string;
  initialLikeCount?: number;
  initialLiked?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showCount?: boolean;
}

export default function LikeButton({
  postId,
  initialLikeCount = 0,
  initialLiked = false,
  variant = "ghost",
  size = "default",
  showCount = true,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [userLikeId, setUserLikeId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and if they've liked this post
    const checkAuthAndLike = async () => {
      try {
        // Check auth status
        const authResponse = await fetch("/api/auth/profile");
        if (!authResponse.ok) {
          setIsAuthenticated(false);
          return;
        }
        
        setIsAuthenticated(true);
        
        // Check if user has liked this post
        const likesResponse = await fetch(`/api/likes?postId=${postId}`);
        if (likesResponse.ok) {
          const likes = await likesResponse.json();
          // Update total like count
          setLikeCount(likes.length);
          
          // Find if current user has liked this post
          const userLike = likes.find((like: any) => like.isCurrentUser);
          if (userLike) {
            setLiked(true);
            setUserLikeId(userLike.id);
          } else {
            setLiked(false);
            setUserLikeId(null);
          }
        }
      } catch (error) {
        console.error("Error checking auth status or likes:", error);
      }
    };

    checkAuthAndLike();
  }, [postId]);

  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);

    try {
      if (liked) {
        // Unlike post
        if (userLikeId) {
          const response = await fetch(`/api/likes/${userLikeId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            setLiked(false);
            setLikeCount((prev) => Math.max(prev - 1, 0));
            setUserLikeId(null);
          }
        }
      } else {
        // Like post
        const response = await fetch("/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId }),
        });

        if (response.ok) {
          const newLike = await response.json();
          setLiked(true);
          setLikeCount((prev) => prev + 1);
          setUserLikeId(newLike.id);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleLikeClick}
            disabled={loading}
            className={`flex items-center space-x-1 ${liked ? "text-red-500" : ""}`}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <span className="text-lg">{liked ? "❤️" : "🤍"}</span>
            {showCount && <span>{likeCount}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isAuthenticated ? (liked ? "Unlike" : "Like") : "Sign in to like"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 