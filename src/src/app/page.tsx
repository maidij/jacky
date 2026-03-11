"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

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

const categories = [
  { id: "food", label: "🍖 粮食" },
  { id: "medical", label: "💊 医疗" },
  { id: "toy", label: "🧸 玩具" },
  { id: "other", label: "📦 其他" },
];

const PawBackground = () => {
  const paws = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${5 + Math.random() * 5}s`,
  }));

  return (
    <div className="paw-bg">
      {paws.map((paw) => (
        <span
          key={paw.id}
          className="paw"
          style={{
            left: paw.left,
            animationDelay: paw.animationDelay,
            animationDuration: paw.animationDuration,
          }}
        >
          🐾
        </span>
      ))}
    </div>
  );
};

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("food");

  useEffect(() => {
    fetchPets();
  }, [activeCategory]);

  const fetchPets = async () => {
    try {
      const url = activeCategory === "all" 
        ? "/api/pets" 
        : `/api/pets?category=${activeCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      setPets(data);
    } catch (error) {
      console.error("Error fetching pets:", error);
    } finally {
      setLoading(false);
    }
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
    <div>
      <PawBackground />
      <header className="header">
        <div className="container">
          <h1>🐾 宠物管理系统</h1>
        </div>
      </header>

      <main className="container">
        <div className="tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`tab ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "24px", textAlign: "right" }}>
          <Link href="/add" className="btn btn-primary">
            + 添加宠物
          </Link>
        </div>

        {pets.length === 0 ? (
          <div className="empty-state">
            <h2>还没有宠物</h2>
            <p>点击上方按钮添加您的第一只宠物</p>
          </div>
        ) : (
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
                  <p className="pet-age">年龄: {pet.age} 岁</p>
                  <p className="pet-description">{pet.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
