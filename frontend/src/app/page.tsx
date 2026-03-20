"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Card,
  Button,
  Input,
  Select,
  Skeleton,
  Empty,
  Badge,
  Space,
  Tag,
  Message,
  Modal,
} from "@arco-design/web-react";
import {
  IconSearch,
  IconPlus,
  IconHistory,
  IconMessage,
  IconHeart,
  IconCalendar,
  IconNotification,
  IconDashboard,
  IconApps,
} from "@arco-design/web-react/icon";

interface Pet {
  id: number;
  name: string;
  species: string;
  category: string;
  age: number;
  description: string;
  image_url: string;
  price: number;
  stock: number;
  created_at: string;
}

interface PetsResponse {
  items: Pet[];
  total: number;
  page: number;
  pageSize: number;
}

const categories = [
  { id: "pet", label: "🐾 宠物", color: "#165DFF" },
  { id: "food", label: "🍖 粮食", color: "#00B42A" },
  { id: "medical", label: "💊 医疗", color: "#F53F3F" },
  { id: "toy", label: "🧸 玩具", color: "#FF7D00" },
  { id: "other", label: "📦 其他", color: "#7C3AED" },
];

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

export default function Home() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("pet");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchPets();
  }, [activeCategory, currentPage, searchQuery]);

  const fetchPets = async () => {
    try {
      let url = `/api/pets?category=${activeCategory}&skip=${(currentPage - 1) * 6}&limit=6`;
      if (searchQuery) {
        url = `/api/pets/search?q=${encodeURIComponent(searchQuery)}&skip=${(currentPage - 1) * 6}&limit=6`;
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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const deletePet = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这只宠物吗？",
      onOk: async () => {
        try {
          await fetch(`/api/pets/${id}`, { method: "DELETE" });
          Message.success("删除成功");
          fetchPets();
        } catch (error) {
          console.error("Error deleting pet:", error);
          Message.error("删除失败");
        }
      },
    });
  };

  const navItems = [
    { icon: <IconApps />, text: "购物车", href: "/cart", color: "#165DFF" },
    { icon: <IconHistory />, text: "订单", href: "/orders", color: "#00B42A" },
    { icon: <IconMessage />, text: "社区", href: "/community", color: "#FF7D00" },
    { icon: <IconHeart />, text: "收藏", href: "/favorites", color: "#F53F3F" },
    { icon: <IconCalendar />, text: "预约", href: "/appointments", color: "#722ED1" },
    { icon: <IconNotification />, text: "通知", href: "/notifications", color: "#EB5041" },
    { icon: <IconDashboard />, text: "统计", href: "/admin/dashboard", color: "#0FC6C2" },
  ];

  if (loading) {
    return (
      <div className="container">
        <PawBackground />
        <header className="header">
          <div className="container">
            <h1>🐾 宠物管理系统</h1>
          </div>
        </header>
        <main className="container" style={{ marginTop: "40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Skeleton />
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div>
        <PawBackground />
        <header className="header">
          <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 600, margin: 0 }}>
              🐾 宠物管理系统
            </h1>
            <Space>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} style={{ color: "white" }}>
                  <Button type="text" icon={item.icon} style={{ color: "white" }}>
                    {item.text}
                  </Button>
                </Link>
              ))}
              <Badge count={1} style={{ backgroundColor: "#F53F3F" }}>
                <span style={{ color: "white", fontSize: "0.9rem" }}>欢迎, {user?.username}</span>
              </Badge>
              <Button type="secondary" onClick={logout} size="small">
                退出
              </Button>
            </Space>
          </div>
        </header>

        <main className="container" style={{ marginTop: "30px" }}>
          <Card>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ flex: 1 }}>
                <Input.Search
                  placeholder="搜索宠物/商品..."
                  value={searchQuery}
                  onSearch={handleSearch}
                  onChange={(value) => setSearchQuery(value)}
                  prefix={<IconSearch />}
                  allowClear
                  size="large"
                />
              </div>
              <Link href={`/add?category=${activeCategory}`}>
                <Button type="primary" icon={<IconPlus />}>
                  添加{categories.find(c => c.id === activeCategory)?.label.replace(/[🐾🍖💊🧸📦\s]/g, "")}
                </Button>
              </Link>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
              {categories.map((cat) => (
                <Tag
                  key={cat.id}
                  color={activeCategory === cat.id ? cat.color : "gray"}
                  style={{ cursor: "pointer", padding: "6px 16px", fontSize: "0.95rem" }}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.label}
                </Tag>
              ))}
            </div>

            {pets.length === 0 ? (
              <Empty description="暂无数据" style={{ padding: "60px 0" }} />
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                  {pets.map((pet) => (
                    <Link href={`/pet/${pet.id}`} key={pet.id} style={{ textDecoration: "none" }}>
                      <Card
                        hoverable
                        className="pet-card"
                        cover={
                          <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                            <img
                              alt={pet.name}
                              src={pet.image_url || "https://picsum.photos/400/300?random=" + pet.id}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            {pet.stock <= 0 && (
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
                                <Tag color="red" size="large">已售罄</Tag>
                              </div>
                            )}
                          </div>
                        }
                      >
                        <Space direction="vertical" size="small" style={{ width: "100%" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>{pet.name}</span>
                            <Tag>{getSpeciesLabel(pet.species)}</Tag>
                          </div>
                          
                          {pet.category === "pet" && (
                            <span style={{ color: "#666", fontSize: "0.9rem" }}>
                              年龄: {pet.age} 岁
                            </span>
                          )}
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="price">¥{pet.price.toFixed(2)}</span>
                            <Space>
                              <Button
                                type="primary"
                                size="small"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  fetch(`http://10.224.205.37:8000/api/cart`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ pet_id: pet.id, quantity: 1 })
                                  }).then(() => Message.success("已添加到购物车"));
                                }}
                                disabled={pet.stock <= 0}
                              >
                                加入购物车
                              </Button>
                              <Button
                                type="text"
                                status="danger"
                                size="small"
                                onClick={(e) => deletePet(pet.id, e as unknown as React.MouseEvent)}
                              >
                                删除
                              </Button>
                            </Space>
                          </div>
                        </Space>
                      </Card>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
                    <Space>
                      <Button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                      >
                        上一页
                      </Button>
                      <span style={{ padding: "0 16px", lineHeight: "32px" }}>
                        第 {currentPage} / {totalPages} 页，共 {total} 条
                      </span>
                      <Button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                      >
                        下一页
                      </Button>
                    </Space>
                  </div>
                )}
              </>
            )}
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
