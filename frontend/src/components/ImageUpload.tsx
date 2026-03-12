"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setTimeout(() => setUploading(false), 1000);
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview("");
    onChange("");
  };

  return (
    <div>
      {preview ? (
        <div
          style={{
            position: "relative",
            borderRadius: "12px",
            overflow: "hidden",
            border: "2px solid #e0e0e0",
          }}
        >
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
              display: "block",
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "rgba(0,0,0,0.6)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? "#667eea" : "#e0e0e0"}`,
            borderRadius: "12px",
            padding: "40px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: isDragActive ? "#f0f4ff" : "#fafafa",
            transition: "all 0.3s ease",
          }}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div style={{ color: "#667eea" }}>上传中...</div>
          ) : (
            <div>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📷</div>
              <p style={{ color: "#666", marginBottom: "8px" }}>
                {isDragActive ? "松开鼠标上传" : "拖拽图片到这里，或点击上传"}
              </p>
              <p style={{ color: "#999", fontSize: "12px" }}>
                支持 PNG、JPG、GIF、WebP 格式
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
