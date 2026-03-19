"use client";

import { useState, useEffect } from "react";
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

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/posts?skip=${(page - 1) * pageSize}&limit=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="container">
        <PawBackground />
        <header className="header">
          <div className="container">
            <h1>🐾 宠物社区</h1>
          </div>
        </header>
        <div className="loading-container">
          <div className="loading-pets">
            <span>🐕</span>
            <span>🐱</span>
            <span>🐰</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PawBackground />
      <header className="header">
        <div className="container">
          <h1>🐾 宠物社区</h1>
        </div>
      </header>

      <main className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <p style={{ color: "#666" }}>共 {total} 篇帖子</p>
          <Link href="/community/create" className="btn btn-primary" style={{ background: "#4CAF50" }}>
            ✏️ 发布帖子
          </Link>
        </div>

        {posts.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px"
          }}>
            <p style={{ fontSize: "3rem", marginBottom: "15px" }}>📝</p>
            <p style={{ color: "#666", fontSize: "1.1rem" }}>
              还没有帖子，成为第一个发帖的人吧！
            </p>
            <Link href="/community/create" className="btn btn-primary" style={{ 
              background: "#4CAF50",
              marginTop: "20px",
              display: "inline-block"
            }}>
              立即发帖
            </Link>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/community/post/${post.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div 
                  style={{ 
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    marginBottom: "15px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <span style={{ 
                      background: "#4CAF50", 
                      color: "white", 
                      padding: "4px 10px", 
                      borderRadius: "20px",
                      fontSize: "0.8rem"
                    }}>
                      {post.username}
                    </span>
                    <span style={{ color: "#999", fontSize: "0.85rem" }}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ marginBottom: "10px", color: "#333" }}>{post.title}</h3>
                  {post.content && (
                    <p style={{ 
                      color: "#666", 
                      lineHeight: "1.6",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical"
                    }}>
                      {post.content}
                    </p>
                  )}
                  <div style={{ 
                    display: "flex", 
                    gap: "20px", 
                    marginTop: "15px",
                    color: "#666",
                    fontSize: "0.9rem"
                  }}>
                    <span>❤️ {post.likes_count}</span>
                    <span>💬 {post.comments_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "30px" }}>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                background: page === 1 ? "#f5f5f5" : "white",
                borderRadius: "8px",
                cursor: page === 1 ? "not-allowed" : "pointer"
              }}
            >
              上一页
            </button>
            <span style={{ padding: "8px 16px", color: "#666" }}>
              第 {page} / {totalPages} 页
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                background: page === totalPages ? "#f5f5f5" : "white",
                borderRadius: "8px",
                cursor: page === totalPages ? "not-allowed" : "pointer"
              }}
            >
              下一页
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
