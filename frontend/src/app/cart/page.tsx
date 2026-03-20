"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Card,
  Button,
  InputNumber,
  Empty,
  Modal,
  Form,
  Input,
  Message,
  Space,
  Divider,
  Badge,
} from "@arco-design/web-react";
import {
  IconDelete,
  IconCheck,
} from "@arco-design/web-react/icon";

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
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
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
      Message.success("已移除");
      fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await fetch(`http://10.224.205.37:8000/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity })
      });
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.pet.price * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async (values: any) => {
    setConfirmLoading(true);
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/orders?user_id=1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        Message.success("订单创建成功！");
        setVisible(false);
        fetchCart();
        router.push("/orders");
      } else {
        const data = await res.json();
        Message.error(data.detail || "创建失败");
      }
    } catch (error) {
      Message.error("创建失败，请重试");
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div>
        <PawBackground />
        <header className="header">
          <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
              🛒 购物车
              <Badge count={totalQuantity} style={{ backgroundColor: "#F53F3F" }} />
            </h1>
            <Space>
              <Link href="/orders">
                <Button type="text" icon={<IconCheck />} style={{ color: "white" }}>
                  我的订单
                </Button>
              </Link>
              <span style={{ color: "rgba(255,255,255,0.8)" }}>欢迎, {user?.username}</span>
              <Button type="secondary" size="small" onClick={logout}>
                退出
              </Button>
            </Space>
          </div>
        </header>

        <main className="container">
          <Link href="/" className="back-link">← 返回首页</Link>

          {cartItems.length === 0 ? (
            <Card>
              <Empty description="购物车是空的" />
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <Link href="/">
                  <Button type="primary">去购物</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              <Card title={`商品列表 (${cartItems.length})`}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ padding: "16px 0" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <img
                        src={item.pet.image_url || `https://picsum.photos/100/100?random=${item.pet_id}`}
                        alt={item.pet.name}
                        style={{ width: "100px", height: "100px", borderRadius: "8px", objectFit: "cover" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: "8px" }}>
                          {item.pet.name}
                        </div>
                        <div style={{ color: "#666", fontSize: "0.9rem" }}>
                          分类: {item.pet.category}
                        </div>
                      </div>
                      <div style={{ fontSize: "1.2rem", color: "#F53F3F", fontWeight: 600, minWidth: "80px", textAlign: "right" }}>
                        ¥{item.pet.price.toFixed(2)}
                      </div>
                      <InputNumber
                        min={1}
                        max={99}
                        value={item.quantity}
                        onChange={(value) => updateQuantity(item.id, value || 1)}
                        size="small"
                        style={{ width: "80px" }}
                      />
                      <Space>
                        <div style={{ fontSize: "1.1rem", fontWeight: 600, minWidth: "80px", textAlign: "right" }}>
                          ¥{(item.pet.price * item.quantity).toFixed(2)}
                        </div>
                        <Button
                          type="text"
                          status="danger"
                          icon={<IconDelete />}
                          onClick={() => removeFromCart(item.id)}
                        />
                      </Space>
                    </div>
                    <Divider />
                  </div>
                ))}
              </Card>

              <Card title="订单摘要">
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>商品数量</span>
                    <span style={{ fontWeight: 600 }}>{totalQuantity} 件</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>商品金额</span>
                    <span style={{ fontWeight: 600 }}>¥{totalAmount.toFixed(2)}</span>
                  </div>
                  <Divider style={{ margin: "12px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "1.2rem" }}>应付总额</span>
                    <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#F53F3F" }}>
                      ¥{totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    type="primary"
                    long
                    size="large"
                    onClick={() => setVisible(true)}
                    style={{ marginTop: "16px" }}
                  >
                    结算 ({totalQuantity})
                  </Button>
                </Space>
              </Card>
            </div>
          )}
        </main>

        <Modal
          title="确认订单"
          visible={visible}
          onCancel={() => setVisible(false)}
          confirmLoading={confirmLoading}
          onOk={() => {
            const form = document.getElementById("checkout-form") as HTMLFormElement;
            form?.requestSubmit();
          }}
        >
          <Form
            id="checkout-form"
            layout="vertical"
            onSubmit={handleCheckout}
          >
            <Form.Item label="收货人" field="receiver_name" rules={[{ required: true, message: "请输入收货人" }]}>
              <Input placeholder="请输入收货人姓名" />
            </Form.Item>
            <Form.Item label="联系电话" field="phone" rules={[{ required: true, message: "请输入联系电话" }]}>
              <Input placeholder="请输入联系电话" />
            </Form.Item>
            <Form.Item label="收货地址" field="address" rules={[{ required: true, message: "请输入收货地址" }]}>
              <Input.TextArea placeholder="请输入详细收货地址" rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
