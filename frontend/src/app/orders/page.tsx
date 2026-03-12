"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface OrderItem {
  id: number;
  pet_id: number;
  pet_name: string;
  pet_image: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  receiver_name: string;
  phone: string;
  address: string;
  items: OrderItem[];
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

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: "待发货",
    shipped: "已发货",
    delivered: "已完成",
    cancelled: "已取消",
  };
  return map[status] || status;
};

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    pending: "#ff9800",
    shipped: "#2196f3",
    delivered: "#4caf50",
    cancelled: "#9e9e9e",
  };
  return map[status] || "#666";
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/orders?user_id=1`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container">
          <PawBackground />
          <header className="header">
            <div className="container"><h1>📋 我的订单</h1></div>
          </header>
          <div className="loading-container">
            <div className="loading-pets"><span>📋</span></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div>
        <PawBackground />
        <header className="header">
          <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>📋 我的订单</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link href="/cart" style={{ color: "white", marginRight: "16px" }}>🛒 购物车</Link>
              <span style={{ fontSize: "0.9rem" }}>欢迎, {user?.username}</span>
              <button onClick={logout} className="btn btn-secondary" style={{ padding: "8px 16px" }}>退出</button>
            </div>
          </div>
        </header>

        <main className="container">
          <Link href="/" className="back-link">← 返回首页</Link>

          {orders.length === 0 ? (
            <div className="empty-state">
              <h2>暂无订单</h2>
              <p>快去选购商品吧！</p>
              <Link href="/" className="btn btn-primary" style={{ marginTop: "20px" }}>
                去购物
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {orders.map((order) => (
                <div key={order.id} style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#f5f5f5" }}>
                    <div>
                      <span style={{ fontWeight: "bold", marginRight: "16px" }}>订单号: {order.id}</span>
                      <span style={{ color: "#666", fontSize: "0.9rem" }}>{formatDate(order.created_at)}</span>
                    </div>
                    <span style={{ 
                      background: getStatusColor(order.status), 
                      color: "white", 
                      padding: "4px 12px", 
                      borderRadius: "20px",
                      fontSize: "0.85rem" 
                    }}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div style={{ padding: "20px" }}>
                    {order.items?.map((item) => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                        <img
                          src={item.pet_image || "https://via.placeholder.com/80x80?text=Item"}
                          alt={item.pet_name}
                          style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                        />
                        <div style={{ flex: 1, marginLeft: "16px" }}>
                          <h4 style={{ marginBottom: "4px" }}>{item.pet_name}</h4>
                          <p style={{ color: "#666", fontSize: "0.9rem" }}>x{item.quantity}</p>
                        </div>
                        <p style={{ color: "#667eea", fontWeight: "bold" }}>¥{item.price}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: "1px solid #eee" }}>
                    <div>
                      <p style={{ color: "#666", fontSize: "0.9rem" }}>收货人: {order.receiver_name}</p>
                      <p style={{ color: "#666", fontSize: "0.9rem" }}>电话: {order.phone}</p>
                      <p style={{ color: "#666", fontSize: "0.9rem" }}>地址: {order.address}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ color: "#666", marginBottom: "4px" }}>实付金额</p>
                      <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>¥{order.total_amount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
