"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

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

interface PetsResponse {
  items: Pet[];
  total: number;
  page: number;
  pageSize: number;
}

const categories = [
  { id: "pet", label: "🐾 宠物" },
  { id: "food", label: "🍖 粮食" },
  { id: "medical", label: "💊 医疗" },
  { id: "toy", label: "🧸 玩具" },
  { id: "other", label: "📦 其他" },
];

const PawBackground = () => {
  return (
    <div className="paw-bg">
      <span className="paw" style={{ left: "10%", animationDelay: "0s", animationDuration: "8s" }}>🐾</span>
      <span className="paw" style={{ left: "25%", animationDelay: "2s", animationDuration: "10s" }}>🐾</span>
      <span className="paw" style={{ left: "40%", animationDelay: "1s", animationDuration: "7s" }}>🐾</span>
      <span className="paw" style={{ left: "55%", animationDelay: "3s", animationDuration: "9s" }}>🐾</span>
      <span className="paw" style={{ left: "70%", animationDelay: "4s", animationDuration: "8s" }}>🐾</span>
      <span className="paw" style={{ left: "85%", animationDelay: "5s", animationDuration: "6s" }}>🐾</span>
    </div>
  );
};

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("pet");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchPets();
  }, [activeCategory, currentPage, searchQuery]);

  const fetchPets = async () => {
    try {
      let url = `/api/pets?category=${activeCategory}&page=${currentPage}`;
      if (searchQuery) {
        url = `/api/pets/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage}`;
      }
      const res = await fetch(url);
      const data: PetsResponse = await res.json();
      setPets(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / data.pageSize));
    } catch (error) {
      console.error("Error fetching pets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchPets();
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(0);
  };

  const deletePet = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("确定要删除这只宠物吗?")) return;
    
    try {
      await fetch(`/api/pets/${id}`, { method: "DELETE" });
      fetchPets();
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

  const getAddLabel = (category: string) => {
    const map: Record<string, string> = {
      pet: "宠物",
      food: "粮食",
      medical: "医疗",
      toy: "玩具",
      other: "物品",
    };
    return map[category] || "宠物";
  };

  if (loading) {
    return (
      <div className="container">
        <PawBackground />
        <header className="header">
          <div className="container">
            <h1>🐾 宠物管理系统</h1>
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
    <ProtectedRoute>
      <div>
        <PawBackground />
        <header className="header">
          <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>🐾 宠物管理系统</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link href="/cart" style={{ color: "white", marginRight: "8px" }}>🛒 购物车</Link>
              <Link href="/orders" style={{ color: "white", marginRight: "8px" }}>📋 订单</Link>
              <Link href="/community" style={{ color: "white", marginRight: "8px" }}>💬 社区</Link>
              <Link href="/admin/dashboard" style={{ color: "white", marginRight: "8px" }}>📊 统计</Link>
              <span style={{ fontSize: "0.9rem" }}>欢迎, {user?.username}</span>
              <button onClick={logout} className="btn btn-secondary" style={{ padding: "8px 16px" }}>
                退出
              </button>
            </div>
          </div>
        </header>

      <main className="container">
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="搜索宠物/商品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "1rem"
            }}
          />
          <button type="submit" className="btn btn-primary">
            搜索
          </button>
        </form>

        <div className="tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`tab ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "24px", textAlign: "right" }}>
          <Link href={`/add?category=${activeCategory}`} className="btn btn-primary">
            + 添加{getAddLabel(activeCategory)}
          </Link>
        </div>

        {pets.length === 0 ? (
          <div className="empty-state">
            <h2>还没有宠物</h2>
            <p>点击上方按钮添加您的第一只宠物</p>
          </div>
        ) : (
          <>
            <div className="pet-grid">
              {pets?.map((pet, index) => (
                <Link href={`/pet/${pet.id}`} key={pet.id} className="pet-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <img
                    src={pet.image_url || "https://via.placeholder.com/300x200?text=Pet"}
                    alt={pet.name}
                    className="pet-image"
                  />
                  <div className="pet-info">
                    <h3 className="pet-name">{pet.name}</h3>
                    <span className="pet-species">{getSpeciesLabel(pet.species)}</span>
                    <p className="pet-description">{pet.description}</p>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "30px" }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  style={{ opacity: currentPage === 0 ? 0.5 : 1 }}
                >
                  上一页
                </button>
                <span style={{ display: "flex", alignItems: "center", padding: "0 16px" }}>
                  第 {currentPage + 1} / {totalPages} 页 (共 {total} 条)
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage >= totalPages - 1}
                  style={{ opacity: currentPage >= totalPages - 1 ? 0.5 : 1 }}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
    </ProtectedRoute>
  );
}
