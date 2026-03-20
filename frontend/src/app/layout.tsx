import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import ArcoProvider from "@/components/providers/ArcoProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "宠物管理系统",
  description: "管理您的宠物信息",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <ArcoProvider>
            {children}
          </ArcoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
