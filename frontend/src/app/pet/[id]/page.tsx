"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Message } from "@arco-design/web-react";

interface Pet {
  id: number;
  name: string;
  species: string;
  category: string;
  age: number;
  description: string;
  image_url: string;
  created_at: string;
}

interface Review {
  id: number;
  pet_id: number;
  user_id: number;
  username: string;
  rating: number;
  comment: string;
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

export default function PetDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchPet();
    fetchReviews();
    checkFavorite();
  }, [params.id]);

  const checkFavorite = async () => {
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/favorites/check/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.is_favorited);
      }
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await fetch(`http://10.224.205.37:8000/api/favorites/${params.id}`, { method: "DELETE" });
        setIsFavorited(false);
      } else {
        await fetch("http://10.224.205.37:8000/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pet_id: parseInt(params.id) })
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const fetchPet = async () => {
    try {
      const res = await fetch(`/api/pets/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setPet(data);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching pet:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        fetch(`/api/reviews/${params.id}`),
        fetch(`/api/reviews/${params.id}/stats`)
      ]);
      const reviewsData = await reviewsRes.json();
      const statsData = await statsRes.json();
      setReviews(reviewsData);
      setReviewStats(statsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet_id: parseInt(params.id),
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
      Message.success("评价成功！");
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const deletePet = async () => {
    if (!confirm("确定要删除这只宠物吗?")) return;
    try {
      await fetch(`/api/pets/${params.id}`, { method: "DELETE" });
      router.push("/");
    } catch (error) {
      console.error("Error deleting pet:", error);
    }
  };

  const getSpeciesLabel = (species: string) => {
    const map: Record<string, string> = {
      dog: "🐕 狗",
      cat: "🐱 猫",
      bird: "🐦 鸟",
      rabbit: "🐰 兔",
      other: "🐾 其他",
    };
    return map[species] || species;
  };

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      pet: "🐾 宠物",
      food: "🍖 粮食",
      medical: "💊 医疗",
      toy: "🧸 玩具",
      other: "📦 其他",
    };
    return map[category] || category;
  };

  const addToCart = async () => {
    if (!pet) return;
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/cart?user_id=1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pet_id: pet.id, quantity: 1 }),
      });
      if (res.ok) {
        Message.success("已添加到购物车！");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <PawBackground />
        <header className="header">
          <div className="container">
            <h1>🐾 宠物详情</h1>
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

  if (!pet) {
    return null;
  }

  return (
    <div>
      <PawBackground />
      <header className="header">
        <div className="container">
          <h1>🐾 宠物详情</h1>
        </div>
      </header>

      <main className="container">
        <Link href="/" className="back-link">← 返回列表</Link>
        
        <div className="detail-container">
          <img
            src={pet.image_url || "https://via.placeholder.com/800x400?text=Pet"}
            alt={pet.name}
            className="detail-image"
          />
          <div className="detail-content">
            <h2 className="pet-name" style={{ fontSize: "2rem" }}>{pet.name}</h2>
            <span className="pet-species">{getSpeciesLabel(pet.species)}</span>
            <p style={{ marginTop: "8px" }}>
              <span style={{ 
                display: "inline-block", 
                background: "#4CAF50", 
                color: "white", 
                padding: "6px 14px", 
                borderRadius: "20px",
                fontSize: "0.85rem"
              }}>
                {getCategoryLabel(pet.category)}
              </span>
            </p>
            {pet.category === "pet" && (
            <p className="pet-age" style={{ marginTop: "16px", fontSize: "1.1rem" }}>
              年龄: {pet.age} 岁
            </p>
            )}
            {pet.description && (
              <p style={{ marginTop: "20px", color: "#666", lineHeight: "1.8" }}>
                {pet.description}
              </p>
            )}
            <div className="detail-actions">
              <button onClick={addToCart} className="btn btn-primary" style={{ background: "#4CAF50" }}>
                🛒 加入购物车
              </button>
              <button 
                onClick={toggleFavorite}
                className="btn btn-primary"
                style={{ background: isFavorited ? "#f44336" : "#9E9E9E" }}
              >
                {isFavorited ? "❤️ 已收藏" : "🤍 收藏"}
              </button>
              {pet.category === "pet" && (
                <Link href={`/health/${pet.id}`} className="btn btn-primary" style={{ background: "#2196F3" }}>
                  📋 健康档案
                </Link>
              )}
              {pet.category === "pet" && (
                <Link href={`/appointments?pet_id=${pet.id}`} className="btn btn-primary" style={{ background: "#FF9800" }}>
                  📅 预约服务
                </Link>
              )}
              <Link href={`/edit/${pet.id}`} className="btn btn-primary">
                编辑
              </Link>
              <button onClick={deletePet} className="btn btn-danger">
                删除
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3>用户评价</h3>
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn btn-primary">
              {showReviewForm ? "取消评价" : "我要评价"}
            </button>
          </div>
          
          <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
            <span style={{ fontSize: "1.2rem", marginRight: "10px" }}>⭐ {reviewStats.average}</span>
            <span style={{ color: "#666" }}>({reviewStats.count} 条评价)</span>
          </div>

          {showReviewForm && (
            <form onSubmit={submitReview} style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
              <div className="form-group">
                <label>评分</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        color: star <= newReview.rating ? "#ffc107" : "#ddd"
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>评价内容</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  required
                  placeholder="分享您的使用体验..."
                  rows={3}
                />
              </div>
              <button type="submit" className="btn btn-primary">提交评价</button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p style={{ color: "#666", textAlign: "center" }}>暂无评价，快来抢先评价吧！</p>
          ) : (
            <div>
              {reviews.map((review) => (
                <div key={review.id} style={{ background: "white", padding: "15px", borderRadius: "8px", marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "bold" }}>{review.username}</span>
                    <span style={{ color: "#ffc107" }}>{"★".repeat(review.rating)}</span>
                  </div>
                  <p style={{ color: "#666" }}>{review.comment}</p>
                  <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "8px" }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
