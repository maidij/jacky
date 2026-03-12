"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface CartItem {
  id: number;
  pet_id: number;
  quantity: number;
  pet: {
    id: number;
    name: string;
    image_url: string;
    price: number;
    category: string;
  };
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

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    receiver_name: "",
    phone: "",
    address: "",
  });
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/cart?user_id=1`);
      const data = await res.json();
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      await fetch(`http://10.224.205.37:8000/api/cart/${itemId}`, { method: "DELETE" });
      fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.pet.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/orders?user_id=1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutForm),
      });
      if (res.ok) {
        alert("订单创建成功！");
        setShowCheckout(false);
        fetchCart();
      }
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container">
          <PawBackground />
          <header className="header">
            <div className="container"><h1>🛒 购物车</h1></div>
          </header>
          <div className="loading-container">
            <div className="loading-pets"><span>🛒</span></div>
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
            <h1>🛒 购物车</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link href="/orders" style={{ color: "white", marginRight: "16px" }}>📋 我的订单</Link>
              <span style={{ fontSize: "0.9rem" }}>欢迎, {user?.username}</span>
              <button onClick={logout} className="btn btn-secondary" style={{ padding: "8px 16px" }}>退出</button>
            </div>
          </div>
        </header>

        <main className="container">
          <Link href="/" className="back-link">← 返回首页</Link>

          {cartItems.length === 0 ? (
            <div className="empty-state">
              <h2>购物车是空的</h2>
              <p>快去添加一些商品吧！</p>
              <Link href="/" className="btn btn-primary" style={{ marginTop: "20px" }}>
                去购物
              </Link>
            </div>
          ) : (
            <>
              <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee" }}>
                    <img
                      src={item.pet.image_url || "https://via.placeholder.com/100x100?text=Pet"}
                      alt={item.pet.name}
                      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                    />
                    <div style={{ flex: 1, marginLeft: "20px" }}>
                      <h3 style={{ marginBottom: "8px" }}>{item.pet.name}</h3>
                      <p style={{ color: "#666", marginBottom: "8px" }}>分类: {item.pet.category}</p>
                      <p style={{ color: "#667eea", fontSize: "1.2rem", fontWeight: "bold" }}>¥{item.pet.price}</p>
                    </div>
                    <div style={{ textAlign: "center", marginRight: "20px" }}>
                      <p style={{ color: "#666", marginBottom: "8px" }}>数量</p>
                      <p style={{ fontSize: "1.2rem" }}>{item.quantity}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: "#ff6b6b",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        cursor: "pointer",
                      }}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                <div>
                  <p style={{ color: "#666" }}>共 {cartItems.length} 件商品</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>
                    总计: ¥{totalAmount.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="btn btn-primary"
                  style={{ padding: "16px 40px", fontSize: "1.1rem" }}
                >
                  结算
                </button>
              </div>
            </>
          )}

          {showCheckout && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}>
              <div style={{ background: "white", padding: "30px", borderRadius: "16px", width: "100%", maxWidth: "500px" }}>
                <h2 style={{ marginBottom: "20px" }}>确认订单</h2>
                <form onSubmit={handleCheckout}>
                  <div className="form-group">
                    <label>收货人</label>
                    <input
                      type="text"
                      value={checkoutForm.receiver_name}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, receiver_name: e.target.value })}
                      required
                      placeholder="请输入收货人姓名"
                    />
                  </div>
                  <div className="form-group">
                    <label>联系电话</label>
                    <input
                      type="tel"
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                      required
                      placeholder="请输入联系电话"
                    />
                  </div>
                  <div className="form-group">
                    <label>收货地址</label>
                    <textarea
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      required
                      placeholder="请输入收货地址"
                      rows={3}
                    />
                  </div>
                  <div style={{ marginBottom: "20px", padding: "15px", background: "#f5f5f5", borderRadius: "8px" }}>
                    <p style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>商品数量:</span>
                      <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} 件</span>
                    </p>
                    <p style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "bold" }}>
                      <span>总计:</span>
                      <span style={{ color: "#667eea" }}>¥{totalAmount.toFixed(2)}</span>
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      确认下单
                    </button>
                    <button type="button" onClick={() => setShowCheckout(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                      取消
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
