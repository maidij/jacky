"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("请输入标题");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://10.224.205.37:8000/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          image_urls: imageUrls.trim()
        })
      });

      if (res.ok) {
        alert("发布成功！");
        router.push("/community");
      } else {
        alert("发布失败，请重试");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("发布失败，请检查网络连接");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PawBackground />
      <header className="header">
        <div className="container">
          <h1>✏️ 发布帖子</h1>
        </div>
      </header>

      <main className="container">
        <Link href="/community" className="back-link">← 返回社区</Link>
        
        <form 
          onSubmit={handleSubmit}
          style={{ 
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            marginTop: "20px"
          }}
        >
          <div className="form-group">
            <label>标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给帖子起个标题吧..."
              required
              maxLength={100}
            />
            <small style={{ color: "#666" }}>{title.length}/100</small>
          </div>

          <div className="form-group">
            <label>内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享你的养宠心得、经验或者有趣的宠物故事..."
              rows={8}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                resize: "vertical",
                fontSize: "1rem",
                fontFamily: "inherit"
              }}
            />
          </div>

          <div className="form-group">
            <label>图片链接 (可选)</label>
            <input
              type="text"
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              placeholder="多张图片用逗号分隔，如: https://example.com/img1.jpg, https://example.com/img2.jpg"
            />
            <small style={{ color: "#666" }}>
              支持多张图片，用英文逗号分隔
            </small>
          </div>

          <div style={{ display: "flex", gap: "15px", marginTop: "25px" }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ background: "#4CAF50" }}
              disabled={submitting}
            >
              {submitting ? "发布中..." : "📝 发布帖子"}
            </button>
            <button 
              type="button"
              onClick={() => router.push("/community")}
              style={{
                background: "#f5f5f5",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              取消
            </button>
          </div>
        </form>

        <div style={{ 
          background: "#f0f7ff",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "20px",
          color: "#666"
        }}>
          <h4 style={{ marginBottom: "10px" }}>💡 发帖提示</h4>
          <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
            <li>分享你的养宠心得和有趣故事</li>
            <li>可以发布宠物照片或视频链接</li>
            <li>请保持内容健康、积极向上</li>
            <li>与其他铲屎官交流互动吧</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
