"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Post {
  id: number;
  user_id: number;
  username: string;
  title: string;
  content: string;
  image_urls: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

const PawBackground = () => {
  return (
    <div className="paw-bg">
      <span className="paw" style={{ left: "10%", animationDelay: "0s", animationDuration: "8s" }}>🐾</span>
      <span className="paw" style={{ left: "30%", animationDelay: "2s", animationDuration: "10s" }}>🐾</span>
      <span className="paw" style={{ left: "50%", animationDelay: "1s", animationDuration: "7s" }}>🐾</span>
      <span className="paw" style={{ left: "70%", animationDelay: "3s", animationDuration: "9s" }}>🐾</span>
      <span className="paw" style={{ left: "90%", animationDelay: "4s", animationDuration: "8s" }}>🐾</span>
    </div>
  );
};

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
      } else {
        router.push("/community");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const toggleLike = async () => {
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/posts/${postId}/like`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setPost(prev => prev ? { ...prev, likes_count: data.likes_count } : null);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment })
      });
      
      if (res.ok) {
        setNewComment("");
        setShowCommentForm(false);
        fetchComments();
        fetchPost();
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const deletePost = async () => {
    if (!confirm("确定要删除这篇帖子吗?")) return;
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/posts/${postId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        router.push("/community");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!confirm("确定要删除这条评论吗?")) return;
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/comments/${commentId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchComments();
        fetchPost();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <PawBackground />
        <header className="header">
          <div className="container">
            <h1>🐾 帖子详情</h1>
          </div>
        </header>
        <div className="loading-container">
          <div className="loading-pets">
            <span>📝</span>
            <span>💬</span>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div>
      <PawBackground />
      <header className="header">
        <div className="container">
          <h1>🐾 帖子详情</h1>
        </div>
      </header>

      <main className="container">
        <Link href="/community" className="back-link">← 返回社区</Link>
        
        <div style={{ 
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          marginTop: "20px",
          marginBottom: "25px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
            <span style={{ 
              background: "#4CAF50", 
              color: "white", 
              padding: "4px 10px", 
              borderRadius: "20px",
              fontSize: "0.85rem"
            }}>
              {post.username}
            </span>
            <span style={{ color: "#999", fontSize: "0.85rem" }}>
              {new Date(post.created_at).toLocaleString()}
            </span>
          </div>
          
          <h2 style={{ marginBottom: "15px" }}>{post.title}</h2>
          
          {post.content && (
            <p style={{ 
              color: "#333", 
              lineHeight: "1.8",
              marginBottom: "20px",
              whiteSpace: "pre-wrap"
            }}>
              {post.content}
            </p>
          )}

          {post.image_urls && (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "10px",
              marginBottom: "20px"
            }}>
              {post.image_urls.split(",").filter(url => url.trim()).map((url, idx) => (
                <img 
                  key={idx}
                  src={url.trim()}
                  alt=""
                  style={{ 
                    width: "100%", 
                    borderRadius: "8px",
                    objectFit: "cover"
                  }}
                />
              ))}
            </div>
          )}

          <div style={{ 
            display: "flex", 
            gap: "15px",
            paddingTop: "15px",
            borderTop: "1px solid #eee"
          }}>
            <button 
              onClick={toggleLike}
              style={{
                background: liked ? "#f44336" : "#f5f5f5",
                color: liked ? "white" : "#666",
                border: "none",
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              {liked ? "❤️" : "🤍"} {post.likes_count}
            </button>
            <button 
              onClick={() => setShowCommentForm(!showCommentForm)}
              style={{
                background: "#f5f5f5",
                border: "none",
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              💬 {post.comments_count}
            </button>
            <button 
              onClick={deletePost}
              style={{
                background: "#f5f5f5",
                border: "none",
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer",
                marginLeft: "auto",
                color: "#f44336"
              }}
            >
              删除帖子
            </button>
          </div>
        </div>

        <div style={{ 
          background: "white",
          padding: "20px",
          borderRadius: "12px"
        }}>
          <h3 style={{ marginBottom: "15px" }}>💬 评论 ({comments.length})</h3>
          
          {showCommentForm && (
            <form onSubmit={submitComment} style={{ marginBottom: "20px" }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的评论..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  resize: "vertical",
                  fontSize: "1rem"
                }}
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" className="btn btn-primary" style={{ background: "#4CAF50" }}>
                  发布评论
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCommentForm(false)}
                  style={{
                    background: "#f5f5f5",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          )}

          {comments.length === 0 ? (
            <p style={{ color: "#666", textAlign: "center", padding: "30px" }}>
              还没有评论，快来抢沙发！
            </p>
          ) : (
            <div>
              {comments.map((comment) => (
                <div 
                  key={comment.id}
                  style={{ 
                    padding: "15px",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ 
                        background: "#2196F3", 
                        color: "white", 
                        padding: "2px 8px", 
                        borderRadius: "15px",
                        fontSize: "0.8rem"
                      }}>
                        {comment.username}
                      </span>
                      <span style={{ color: "#999", fontSize: "0.8rem" }}>
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ color: "#333" }}>{comment.content}</p>
                  </div>
                  <button 
                    onClick={() => deleteComment(comment.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f44336",
                      cursor: "pointer",
                      padding: "5px"
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
