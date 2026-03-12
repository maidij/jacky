"use client";

import { Suspense, useState, useEffect, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";

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

function AddPetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "pet";
  
  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    category: categoryFromUrl,
    age: "",
    description: "",
    image_url: "",
  });
  
  useEffect(() => {
    setFormData(prev => ({ ...prev, category: categoryFromUrl }));
  }, [categoryFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
        }),
      });
      router.push("/");
    } catch (error) {
      console.error("Error creating pet:", error);
    }
  };

  const getTitle = (category: string) => {
    const map: Record<string, string> = {
      pet: "宠物",
      food: "粮食",
      medical: "医疗",
      toy: "玩具",
      other: "物品",
    };
    return map[category] || "宠物";
  };

  return (
    <div>
      <PawBackground />
      <header className="header">
        <div className="container">
          <h1>🐾 添加{getTitle(categoryFromUrl)}</h1>
        </div>
      </header>

      <main className="container">
        <Link href="/" className="back-link">← 返回列表</Link>
        
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder={`请输入${getTitle(categoryFromUrl)}名称`}
            />
          </div>

          <div className="form-group">
            <label>种类 *</label>
            <select
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              required
            >
              <option value="dog">🐕 狗</option>
              <option value="cat">🐱 猫</option>
              <option value="bird">🐦 鸟</option>
              <option value="rabbit">🐰 兔</option>
              <option value="other">🐾 其他</option>
            </select>
          </div>

          <div className="form-group">
            <label>分类 *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="pet">🐾 宠物</option>
              <option value="food">🍖 粮食</option>
              <option value="medical">💊 医疗</option>
              <option value="toy">🧸 玩具</option>
              <option value="other">📦 其他</option>
            </select>
          </div>

          {categoryFromUrl === "pet" && (
          <div className="form-group">
            <label>年龄 *</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
              min="0"
              max="50"
              placeholder="请输入年龄"
            />
          </div>
          )}

          <div className="form-group">
            <label>图片上传</label>
            <ImageUpload
              value={formData.image_url}
              onChange={(value) => setFormData({ ...formData, image_url: value })}
            />
          </div>

          <div className="form-group">
            <label>描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder={`请描述${getTitle(categoryFromUrl)}的特点...`}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              保存
            </button>
            <Link href="/" className="btn btn-secondary">
              取消
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div style={{ fontSize: "1.5rem", color: "#667eea" }}>加载中...</div>
    </div>
  );
}

export default function AddPet() {
  return (
    <Suspense fallback={<Loading />}>
      <AddPetContent />
    </Suspense>
  );
}
