"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const PawBackground = () => {
  const paws = Array.from({ length: 6 }, (_, i) => ({
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

export default function PetDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPet();
  }, [params.id]);

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
      food: "🍖 粮食",
      medical: "💊 医疗",
      toy: "🧸 玩具",
      other: "📦 其他",
    };
    return map[category] || category;
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
            <p className="pet-age" style={{ marginTop: "16px", fontSize: "1.1rem" }}>
              年龄: {pet.age} 岁
            </p>
            {pet.description && (
              <p style={{ marginTop: "20px", color: "#666", lineHeight: "1.8" }}>
                {pet.description}
              </p>
            )}
            <div className="detail-actions">
              <Link href={`/edit/${pet.id}`} className="btn btn-primary">
                编辑
              </Link>
              <button onClick={deletePet} className="btn btn-danger">
                删除
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
