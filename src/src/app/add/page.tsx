"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function AddPet() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    category: "food",
    age: "",
    description: "",
    image_url: "",
  });

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

  return (
    <div>
      <PawBackground />
      <header className="header">
        <div className="container">
          <h1>🐾 添加新宠物</h1>
        </div>
      </header>

      <main className="container">
        <Link href="/" className="back-link">← 返回列表</Link>
        
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>宠物名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="请输入宠物名称"
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
              <option value="food">🍖 粮食</option>
              <option value="medical">💊 医疗</option>
              <option value="toy">🧸 玩具</option>
              <option value="other">📦 其他</option>
            </select>
          </div>

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

          <div className="form-group">
            <label>图片 URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/pet.jpg"
            />
          </div>

          <div className="form-group">
            <label>描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="请描述宠物的特点..."
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
