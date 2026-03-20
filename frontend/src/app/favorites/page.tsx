"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Message } from "@arco-design/web-react";

interface FavoriteItem {
  id: number;
  pet_id: number;
  pet_name: string;
  pet: {
    id: number;
    name: string;
    species: string;
    category: string;
    age: number;
    description: string;
    image_url: string;
    price: number;
    stock: number;
  };
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

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("http://10.224.205.37:8000/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (petId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("确定要从收藏中移除吗?")) return;
    
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/favorites/${petId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setFavorites(prev => prev.filter(f => f.pet_id !== petId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const addToCart = async (petId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("http://10.224.205.37:8000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pet_id: petId, quantity: 1 })
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
            <h1>❤️ 我的收藏</h1>
          </div>
        </header>
        <div className="loading-container">
          <div className="loading-pets">
            <span>❤️</span>
            <span>⭐</span>
            <span>💫</span>
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
          <h1>❤️ 我的收藏</h1>
        </div>
      </header>

      <main className="container">
        <Link href="/" className="back-link">← 返回首页</Link>
        
        <p style={{ color: "#666", marginTop: "15px", marginBottom: "20px" }}>
          共 {favorites.length} 件收藏商品
        </p>

        {favorites.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px"
          }}>
            <p style={{ fontSize: "3rem", marginBottom: "15px" }}>💫</p>
            <p style={{ color: "#666", fontSize: "1.1rem" }}>
              还没有收藏的商品，去逛逛吧！
            </p>
            <Link href="/" className="btn btn-primary" style={{ 
              background: "#4CAF50",
              marginTop: "20px",
              display: "inline-block"
            }}>
              去逛逛
            </Link>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px"
          }}>
            {favorites.map((item) => (
              <Link 
                key={item.id} 
                href={`/pet/${item.pet_id}`}
                style={{ textDecoration: "none" }}
              >
                <div 
                  style={{ 
                    background: "white",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                    height: "100%"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 5px 20px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src={item.pet.image_url || "https://via.placeholder.com/300x200?text=Pet"}
                      alt={item.pet.name}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover"
                      }}
                    />
                    <button
                      onClick={(e) => removeFavorite(item.pet_id, e)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "rgba(255,255,255,0.9)",
                        border: "none",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                      }}
                    >
                      ❤️
                    </button>
                    {item.pet.stock <= 0 && (
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <span style={{
                          background: "#f44336",
                          color: "white",
                          padding: "5px 15px",
                          borderRadius: "20px",
                          fontSize: "0.9rem"
                        }}>
                          已售罄
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "15px" }}>
                    <h3 style={{ marginBottom: "8px", fontSize: "1.1rem" }}>{item.pet.name}</h3>
                    <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "5px" }}>
                      {getSpeciesLabel(item.pet.species)}
                    </p>
                    {item.pet.category === "pet" && (
                      <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "10px" }}>
                        年龄: {item.pet.age} 岁
                      </p>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ 
                        fontSize: "1.3rem", 
                        fontWeight: "bold", 
                        color: "#f44336" 
                      }}>
                        ¥{item.pet.price.toFixed(2)}
                      </span>
                      {item.pet.stock > 0 && (
                        <button
                          onClick={(e) => addToCart(item.pet_id, e)}
                          style={{
                            background: "#4CAF50",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            cursor: "pointer",
                            fontSize: "0.85rem"
                          }}
                        >
                          🛒 加购
                        </button>
                      )}
                    </div>
                    <p style={{ 
                      fontSize: "0.8rem", 
                      color: "#999", 
                      marginTop: "10px" 
                    }}>
                      收藏于 {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
