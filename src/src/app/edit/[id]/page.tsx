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

export default function EditPet({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<Pet>({
    id: 0,
    name: "",
    species: "dog",
    category: "food",
    age: 0,
    description: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPet();
  }, [params.id]);

  const fetchPet = async () => {
    try {
      const res = await fetch(`/api/pets/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching pet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/pets/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      router.push(`/pet/${params.id}`);
    } catch (error) {
      console.error("Error updating pet:", error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <PawBackground />
        <header className="header">
          <div className="container">
            <h1>🐾 编辑宠物</h1>
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
          <h1>🐾 编辑宠物</h1>
        </div>
      </header>

      <main className="container">
        <Link href={`/pet/${params.id}`} className="back-link">← 返回详情</Link>
        
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>宠物名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
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
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
              required
              min="0"
              max="50"
            />
          </div>

          <div className="form-group">
            <label>图片 URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              保存修改
            </button>
            <Link href={`/pet/${params.id}`} className="btn btn-secondary">
              取消
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
