"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Message } from "@arco-design/web-react";

interface HealthRecord {
  id: number;
  pet_id: number;
  pet_name: string;
  record_type: string;
  record_date: string;
  description: string;
  next_date: string | null;
  hospital: string;
  cost: number;
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

const getRecordTypeLabel = (type: string) => {
  const map: Record<string, { label: string; icon: string; color: string }> = {
    vaccine: { label: "疫苗接种", icon: "💉", color: "#4CAF50" },
    checkup: { label: "体检", icon: "🩺", color: "#2196F3" },
    deworming: { label: "驱虫", icon: "🦠", color: "#FF9800" },
    illness: { label: "疾病治疗", icon: "💊", color: "#f44336" },
    grooming: { label: "美容护理", icon: "✨", color: "#9C27B0" },
    other: { label: "其他", icon: "📋", color: "#607D8B" },
  };
  return map[type] || { label: type, icon: "📋", color: "#607D8B" };
};

export default function HealthRecordsPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.pet_id as string;
  
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [upcomingRecords, setUpcomingRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  
  const [newRecord, setNewRecord] = useState({
    record_type: "vaccine",
    record_date: new Date().toISOString().slice(0, 16),
    description: "",
    next_date: "",
    hospital: "",
    cost: 0
  });

  useEffect(() => {
    fetchRecords();
    fetchUpcoming();
  }, [petId]);

  const fetchRecords = async () => {
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/health-records/${petId}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/health-records/${petId}/upcoming`);
      if (res.ok) {
        const data = await res.json();
        setUpcomingRecords(data);
      }
    } catch (error) {
      console.error("Error fetching upcoming:", error);
    }
  };

  const submitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        pet_id: parseInt(petId),
        record_type: newRecord.record_type,
        record_date: new Date(newRecord.record_date).toISOString(),
        description: newRecord.description,
        next_date: newRecord.next_date ? new Date(newRecord.next_date).toISOString() : null,
        hospital: newRecord.hospital,
        cost: newRecord.cost
      };
      
      const res = await fetch("http://10.224.205.37:8000/api/health-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        Message.success("记录添加成功！");
        setShowForm(false);
        setNewRecord({
          record_type: "vaccine",
          record_date: new Date().toISOString().slice(0, 16),
          description: "",
          next_date: "",
          hospital: "",
          cost: 0
        });
        fetchRecords();
        fetchUpcoming();
      }
    } catch (error) {
      console.error("Error submitting record:", error);
    }
  };

  const deleteRecord = async (id: number) => {
    if (!confirm("确定要删除这条记录吗?")) return;
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/health-records/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        Message.success("删除成功！");
        fetchRecords();
        fetchUpcoming();
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const filteredRecords = filterType === "all" 
    ? records 
    : records.filter(r => r.record_type === filterType);

  if (loading) {
    return (
      <div className="container">
        <PawBackground />
        <header className="header">
          <div className="container">
            <h1>🐾 健康档案</h1>
          </div>
        </header>
        <div className="loading-container">
          <div className="loading-pets">
            <span>💉</span>
            <span>🩺</span>
            <span>💊</span>
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
          <h1>🐾 健康档案</h1>
        </div>
      </header>

      <main className="container">
        <Link href={`/pet/${petId}`} className="back-link">← 返回宠物详情</Link>
        
        {upcomingRecords.length > 0 && (
          <div style={{ 
            background: "linear-gradient(135deg, #FF9800 0%, #FF5722 100%)",
            color: "white",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "30px"
          }}>
            <h3 style={{ marginBottom: "15px" }}>📅 即将到期的提醒</h3>
            {upcomingRecords.map((record) => {
              const typeInfo = getRecordTypeLabel(record.record_type);
              return (
                <div key={record.id} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "10px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  marginBottom: "8px"
                }}>
                  <span>
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                  <span style={{ fontWeight: "bold" }}>
                    {new Date(record.next_date!).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ 
                padding: "8px 16px", 
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "1rem"
              }}
            >
              <option value="all">全部记录</option>
              <option value="vaccine">💉 疫苗接种</option>
              <option value="checkup">🩺 体检</option>
              <option value="deworming">🦠 驱虫</option>
              <option value="illness">💊 疾病治疗</option>
              <option value="grooming">✨ 美容护理</option>
              <option value="other">📋 其他</option>
            </select>
            <span style={{ color: "#666" }}>共 {filteredRecords.length} 条记录</span>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn btn-primary"
            style={{ background: "#4CAF50" }}
          >
            {showForm ? "取消添加" : "+ 添加记录"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submitRecord} style={{ 
            background: "white", 
            padding: "25px", 
            borderRadius: "12px", 
            marginBottom: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label>记录类型</label>
                <select
                  value={newRecord.record_type}
                  onChange={(e) => setNewRecord({ ...newRecord, record_type: e.target.value })}
                  required
                >
                  <option value="vaccine">💉 疫苗接种</option>
                  <option value="checkup">🩺 体检</option>
                  <option value="deworming">🦠 驱虫</option>
                  <option value="illness">💊 疾病治疗</option>
                  <option value="grooming">✨ 美容护理</option>
                  <option value="other">📋 其他</option>
                </select>
              </div>
              <div className="form-group">
                <label>就诊日期</label>
                <input
                  type="datetime-local"
                  value={newRecord.record_date}
                  onChange={(e) => setNewRecord({ ...newRecord, record_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>下次提醒日期 (选填)</label>
                <input
                  type="date"
                  value={newRecord.next_date}
                  onChange={(e) => setNewRecord({ ...newRecord, next_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>医院/诊所 (选填)</label>
                <input
                  type="text"
                  value={newRecord.hospital}
                  onChange={(e) => setNewRecord({ ...newRecord, hospital: e.target.value })}
                  placeholder="请输入医院名称"
                />
              </div>
              <div className="form-group">
                <label>费用 (元)</label>
                <input
                  type="number"
                  value={newRecord.cost}
                  onChange={(e) => setNewRecord({ ...newRecord, cost: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: "15px" }}>
              <label>详细描述</label>
              <textarea
                value={newRecord.description}
                onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                placeholder="记录详细的健康信息..."
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ background: "#4CAF50", marginTop: "15px" }}>
              保存记录
            </button>
          </form>
        )}

        {filteredRecords.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px"
          }}>
            <p style={{ fontSize: "3rem", marginBottom: "15px" }}>📋</p>
            <p style={{ color: "#666", fontSize: "1.1rem" }}>
              暂无健康记录，点击上方"添加记录"开始记录
            </p>
          </div>
        ) : (
          <div>
            {filteredRecords.map((record) => {
              const typeInfo = getRecordTypeLabel(record.record_type);
              return (
                <div 
                  key={record.id} 
                  style={{ 
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    marginBottom: "15px",
                    borderLeft: `4px solid ${typeInfo.color}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "1.5rem" }}>{typeInfo.icon}</span>
                        <span style={{ 
                          background: typeInfo.color, 
                          color: "white", 
                          padding: "4px 12px", 
                          borderRadius: "20px",
                          fontSize: "0.85rem"
                        }}>
                          {typeInfo.label}
                        </span>
                        <span style={{ color: "#666", fontSize: "0.9rem" }}>
                          {new Date(record.record_date).toLocaleDateString()}
                        </span>
                      </div>
                      {record.description && (
                        <p style={{ color: "#333", marginBottom: "10px", lineHeight: "1.6" }}>
                          {record.description}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: "20px", fontSize: "0.9rem", color: "#666" }}>
                        {record.hospital && (
                          <span>🏥 {record.hospital}</span>
                        )}
                        {record.cost > 0 && (
                          <span>💰 ¥{record.cost.toFixed(2)}</span>
                        )}
                      </div>
                      {record.next_date && (
                        <p style={{ 
                          marginTop: "10px", 
                          color: "#FF9800",
                          fontSize: "0.9rem"
                        }}>
                          📅 下次提醒: {new Date(record.next_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => deleteRecord(record.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f44336",
                        cursor: "pointer",
                        fontSize: "1.2rem"
                      }}
                    >
                      🗑️
                    </button>
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
