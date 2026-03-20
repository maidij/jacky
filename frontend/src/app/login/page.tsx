"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, Form, Input, Button, Message, Space } from "@arco-design/web-react";
import { IconUser, IconLock } from "@arco-design/web-react/icon";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const success = await login(values.username, values.password);
      if (success) {
        Message.success("登录成功！");
        router.push("/");
      } else {
        Message.error("用户名或密码错误");
      }
    } catch {
      Message.error("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #165DFF 0%, #4080ff 100%)",
      padding: "20px",
    }}>
      <Card
        style={{ width: 420 }}
        cover={
          <div style={{
            background: "linear-gradient(135deg, #165DFF 0%, #4080ff 100%)",
            padding: "40px 20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "10px" }}>🐾</div>
            <h2 style={{ color: "white", margin: 0 }}>宠物管理系统</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "8px" }}>欢迎回来</p>
          </div>
        }
      >
        <Form
          onSubmit={handleSubmit}
          layout="vertical"
          requiredSymbol={false}
        >
          <Form.Item label="用户名" rules={[{ required: true, message: "请输入用户名" }]}>
            <Input
              prefix={<IconUser />}
              placeholder="请输入用户名"
              size="large"
            />
          </Form.Item>
          
          <Form.Item label="密码" rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password
              prefix={<IconLock />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>
          
          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              long
              loading={loading}
              size="large"
            >
              {loading ? "登录中..." : "登录"}
            </Button>
          </Form.Item>
        </Form>
        
        <Space direction="vertical" align="center" style={{ width: "100%", marginTop: 16 }}>
          <span style={{ color: "#666" }}>还没有账号？</span>
          <Link href="/register" style={{ textDecoration: "none" }}>
            <Button type="text" style={{ color: "#165DFF" }}>
              立即注册 →
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
}
