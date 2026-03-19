"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OverviewStats {
  total_users: number;
  total_orders: number;
  total_pets: number;
  total_revenue: number;
  pending_orders: number;
}

interface SalesByCategory {
  category: string;
  count: number;
  amount: number;
}

interface TrendData {
  date: string;
  count: number;
  amount: number;
}

interface PetsStats {
  by_species: { species: string; count: number }[];
  by_category: { category: string; count: number }[];
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

const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) => (
  <div style={{
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    textAlign: "center"
  }}>
    <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "10px" }}>{icon}</span>
    <p style={{ fontSize: "2rem", fontWeight: "bold", color, marginBottom: "5px" }}>{value}</p>
    <p style={{ color: "#666", fontSize: "0.9rem" }}>{label}</p>
  </div>
);

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

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [sales, setSales] = useState<{ by_category: SalesByCategory[] } | null>(null);
  const [trend, setTrend] = useState<{ trend: TrendData[] } | null>(null);
  const [petsStats, setPetsStats] = useState<PetsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);

  useEffect(() => {
    fetchData();
  }, [selectedDays]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, salesRes, trendRes, petsRes] = await Promise.all([
        fetch("http://10.224.205.37:8000/api/stats/overview"),
        fetch("http://10.224.205.37:8000/api/stats/sales"),
        fetch(`http://10.224.205.37:8000/api/stats/orders/trend?days=${selectedDays}`),
        fetch("http://10.224.205.37:8000/api/stats/pets")
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (salesRes.ok) setSales(await salesRes.json());
      if (trendRes.ok) setTrend(await trendRes.json());
      if (petsRes.ok) setPetsStats(await petsRes.json());
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxAmount = trend?.trend?.length 
    ? Math.max(...trend.trend.map(t => t.amount))
    : 0;

  if (loading) {
    return (
      <div className="container">
        <PawBackground />
        <header className="header">
          <div className="container">
            <h1>📊 数据统计</h1>
          </div>
        </header>
        <div className="loading-container">
          <div className="loading-pets">
            <span>📊</span>
            <span>📈</span>
            <span>📉</span>
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
          <h1>📊 数据统计看板</h1>
        </div>
      </header>

      <main className="container">
        <Link href="/" className="back-link">← 返回首页</Link>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "20px" }}>
          <StatCard icon="👥" label="用户总数" value={overview?.total_users || 0} color="#4CAF50" />
          <StatCard icon="🐾" label="宠物/商品总数" value={overview?.total_pets || 0} color="#2196F3" />
          <StatCard icon="📦" label="订单总数" value={overview?.total_orders || 0} color="#FF9800" />
          <StatCard icon="💰" label="总收入" value={`¥${(overview?.total_revenue || 0).toLocaleString()}`} color="#f44336" />
          <StatCard icon="⏳" label="待处理订单" value={overview?.pending_orders || 0} color="#9C27B0" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "30px" }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
            <h3 style={{ marginBottom: "20px" }}>📈 销售分类统计</h3>
            {sales?.by_category?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {sales.by_category.map((item) => (
                  <div key={item.category}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span>{getCategoryLabel(item.category)}</span>
                      <span style={{ fontWeight: "bold" }}>¥{item.amount.toLocaleString()}</span>
                    </div>
                    <div style={{ 
                      background: "#f5f5f5", 
                      height: "8px", 
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        background: "linear-gradient(90deg, #4CAF50, #8BC34A)",
                        height: "100%",
                        width: `${Math.max(5, (item.amount / (sales.by_category[0]?.amount || 1)) * 100)}%`,
                        transition: "width 0.3s"
                      }} />
                    </div>
                    <small style={{ color: "#999" }}>{item.count} 笔交易</small>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#666", textAlign: "center" }}>暂无销售数据</p>
            )}
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
            <h3 style={{ marginBottom: "20px" }}>🐾 宠物分类统计</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              {petsStats?.by_category?.map((item) => (
                <div key={item.category} style={{
                  background: "#f5f5f5",
                  padding: "15px",
                  borderRadius: "8px",
                  textAlign: "center"
                }}>
                  <p style={{ fontSize: "1.5rem", marginBottom: "5px" }}>
                    {item.category === "pet" ? "🐾" : item.category === "food" ? "🍖" : item.category === "medical" ? "💊" : item.category === "toy" ? "🧸" : "📦"}
                  </p>
                  <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{item.count}</p>
                  <p style={{ color: "#666", fontSize: "0.85rem" }}>
                    {getCategoryLabel(item.category)}
                  </p>
                </div>
              ))}
            </div>
            {petsStats?.by_species?.length ? (
              <div style={{ marginTop: "20px" }}>
                <h4 style={{ marginBottom: "10px" }}>按物种分布</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {petsStats.by_species.map((item) => (
                    <span key={item.species} style={{
                      background: "#e8f5e9",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "0.9rem"
                    }}>
                      {getSpeciesLabel(item.species)}: {item.count}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "12px", marginTop: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3>📊 订单趋势</h3>
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(parseInt(e.target.value))}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "1rem"
              }}
            >
              <option value={7}>最近 7 天</option>
              <option value={14}>最近 14 天</option>
              <option value={30}>最近 30 天</option>
            </select>
          </div>
          
          {trend?.trend?.length ? (
            <div style={{ 
              display: "flex", 
              alignItems: "flex-end", 
              gap: "10px",
              height: "200px",
              padding: "10px 0"
            }}>
              {trend.trend.map((item, idx) => (
                <div key={idx} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{
                    background: "linear-gradient(180deg, #4CAF50, #81C784)",
                    borderRadius: "4px 4px 0 0",
                    height: `${Math.max(5, (item.amount / (maxAmount || 1)) * 150)}px`,
                    transition: "height 0.3s",
                    marginBottom: "5px"
                  }} />
                  <p style={{ fontSize: "0.75rem", color: "#666" }}>
                    {new Date(item.date).toLocaleDateString().slice(5)}
                  </p>
                  <p style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#4CAF50" }}>
                    ¥{item.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666", textAlign: "center", padding: "50px" }}>暂无趋势数据</p>
          )}
        </div>
      </main>
    </div>
  );
}
