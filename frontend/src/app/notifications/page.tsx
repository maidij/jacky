"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Message } from "@arco-design/web-react";

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  is_read: number;
  related_id: number | null;
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

const getNotificationIcon = (type: string) => {
  const map: Record<string, { icon: string; color: string }> = {
    order: { icon: "📦", color: "#4CAF50" },
    appointment: { icon: "📅", color: "#2196F3" },
    review: { icon: "⭐", color: "#FF9800" },
    system: { icon: "🔔", color: "#9C27B0" },
    info: { icon: "💡", color: "#607D8B" },
  };
  return map[type] || map.info;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchNotifications();
  }, [filterType]);

  const fetchNotifications = async () => {
    try {
      let url = "http://10.224.205.37:8000/api/notifications";
      if (filterType === "unread") {
        url += "?unread_only=true";
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/notifications/${id}/read`, {
        method: "PUT"
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, is_read: 1 } : n
        ));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("http://10.224.205.37:8000/api/notifications/read-all", {
        method: "PUT"
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const createTestNotification = async () => {
    try {
      const types = ["order", "appointment", "review", "system"];
      const titles = [
        "您的订单已发货",
        "预约服务已确认",
        "您收到新的评价",
        "系统公告"
      ];
      const contents = [
        "您的订单 #12345 已发货，预计3天内送达",
        "您的遛狗服务预约已确认，服务人员将在约定时间到达",
        "用户「张三」给您的宠物「豆豆」发表了5星评价",
        "平台将于本周六进行系统维护，届时服务暂时不可用"
      ];
      const randomIndex = Math.floor(Math.random() * types.length);
      
      const res = await fetch("http://10.224.205.37:8000/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titles[randomIndex],
          content: contents[randomIndex],
          type: types[randomIndex],
          related_id: Math.floor(Math.random() * 100) + 1
        })
      });
      
      if (res.ok) {
        fetchNotifications();
        Message.success("测试通知已创建！");
      }
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const unreadCount = notifications.filter(n => n.is_read === 0).length;

  if (loading) {
    return (
      <div className="container">
        <PawBackground />
        <header className="header">
          <div className="container">
            <h1>🔔 消息通知</h1>
          </div>
        </header>
        <div className="loading-container">
          <div className="loading-pets">
            <span>🔔</span>
            <span>📬</span>
            <span>💬</span>
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
          <h1>🔔 消息通知</h1>
        </div>
      </header>

      <main className="container">
        <Link href="/" className="back-link">← 返回首页</Link>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              { id: "all", label: "全部" },
              { id: "unread", label: "未读" },
              { id: "order", label: "订单" },
              { id: "appointment", label: "预约" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  background: filterType === filter.id ? "#4CAF50" : "#f5f5f5",
                  color: filterType === filter.id ? "white" : "#666",
                  fontSize: "0.9rem",
                  position: "relative"
                }}
              >
                {filter.label}
                {filter.id === "unread" && unreadCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "#f44336",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "0.7rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                cursor: unreadCount === 0 ? "not-allowed" : "pointer",
                background: unreadCount === 0 ? "#f5f5f5" : "white",
                color: unreadCount === 0 ? "#ccc" : "#666"
              }}
            >
              全部标为已读
            </button>
            <button 
              onClick={createTestNotification}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                background: "#2196F3",
                color: "white"
              }}
            >
              测试通知
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px"
          }}>
            <p style={{ fontSize: "3rem", marginBottom: "15px" }}>📭</p>
            <p style={{ color: "#666", fontSize: "1.1rem" }}>
              {filterType === "unread" ? "没有未读通知" : "暂无通知消息"}
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notif) => {
              const { icon, color } = getNotificationIcon(notif.type);
              return (
                <div 
                  key={notif.id}
                  onClick={() => notif.is_read === 0 && markAsRead(notif.id)}
                  style={{ 
                    background: notif.is_read === 0 ? "#fff8e1" : "white",
                    padding: "20px",
                    borderRadius: "12px",
                    marginBottom: "12px",
                    cursor: notif.is_read === 0 ? "pointer" : "default",
                    borderLeft: `4px solid ${color}`,
                    transition: "background 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: "12px", flex: 1 }}>
                      <span style={{ fontSize: "1.5rem" }}>{icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                          <h4 style={{ margin: 0 }}>{notif.title}</h4>
                          {notif.is_read === 0 && (
                            <span style={{
                              background: "#f44336",
                              color: "white",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              fontSize: "0.7rem"
                            }}>
                              NEW
                            </span>
                          )}
                        </div>
                        {notif.content && (
                          <p style={{ color: "#666", marginBottom: "8px", lineHeight: "1.5" }}>
                            {notif.content}
                          </p>
                        )}
                        <p style={{ fontSize: "0.85rem", color: "#999" }}>
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {notif.is_read === 0 && (
                      <div style={{
                        width: "10px",
                        height: "10px",
                        background: "#f44336",
                        borderRadius: "50%",
                        marginLeft: "10px"
                      }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
