"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, Form, Input, Button, Message, Space } from "@arco-design/web-react";
import { IconUser, IconLock } from "@arco-design/web-react/icon";

export default function Register() {
  const router = useRouter();
  const { register, login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      Message.error("两次输入的密码不一致");
      return;
    }
    if (values.password.length < 6) {
      Message.error("密码长度至少6位");
      return;
    }

    setLoading(true);
    try {
      const success = await register(values.username, values.password);
      if (success) {
        await login(values.username, values.password);
        Message.success("注册成功！");
        router.push("/");
      } else {
        Message.error("用户名已存在");
      }
    } catch {
      Message.error("注册失败，请重试");
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
      background: "linear-gradient(135deg, #00B42A 0%, #23C343 100%)",
      padding: "20px",
    }}>
      <Card
        style={{ width: 420 }}
        cover={
          <div style={{
            background: "linear-gradient(135deg, #00B42A 0%, #23C343 100%)",
            padding: "40px 20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "10px" }}>🐾</div>
            <h2 style={{ color: "white", margin: 0 }}>宠物管理系统</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "8px" }}>创建新账号</p>
          </div>
        }
      >
        <Form
          onSubmit={handleSubmit}
          layout="vertical"
          requiredSymbol={false}
        >
          <Form.Item
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input
              prefix={<IconUser />}
              placeholder="请输入用户名"
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            label="密码"
            rules={[
              { required: true, message: "请输入密码" },
              { minLength: 6, message: "密码长度至少6位" }
            ]}
          >
            <Input.Password
              prefix={<IconLock />}
              placeholder="请输入密码（至少6位）"
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            label="确认密码"
            rules={[{ required: true, message: "请确认密码" }]}
          >
            <Input.Password
              prefix={<IconLock />}
              placeholder="请再次输入密码"
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
              style={{ background: "#00B42A" }}
            >
              {loading ? "注册中..." : "注册"}
            </Button>
          </Form.Item>
        </Form>
        
        <Space direction="vertical" align="center" style={{ width: "100%", marginTop: 16 }}>
          <span style={{ color: "#666" }}>已有账号？</span>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button type="text" style={{ color: "#00B42A" }}>
              ← 返回登录
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
}
