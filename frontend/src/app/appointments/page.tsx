"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Message } from "@arco-design/web-react";

interface Appointment {
  id: number;
  pet_id: number;
  pet_name: string;
  service_type: string;
  appointment_date: string;
  duration: number;
  price: number;
  address: string;
  contact_phone: string;
  remark: string;
  status: string;
  created_at: string;
}

interface Pet {
  id: number;
  name: string;
  species: string;
  image_url: string;
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

const serviceTypes = [
  { id: "walk", label: "🚶 遛狗服务", icon: "🚶", desc: "专业遛狗师带您的宠物散步", price: "¥2/分钟" },
  { id: "grooming", label: "✨ 美容护理", icon: "✨", desc: "洗澡、剪毛、指甲修剪", price: "¥100+¥1.5/分钟" },
  { id: "medical", label: "🏥 医疗保健", icon: "🏥", desc: "体检、疫苗接种、疾病诊治", price: "¥200+¥3/分钟" },
  { id: "training", label: "🎓 行为训练", icon: "🎓", desc: "基础指令训练、行为纠正", price: "¥150+¥2.5/分钟" },
];

const getServiceInfo = (type: string) => serviceTypes.find(s => s.id === type) || serviceTypes[0];

const getStatusInfo = (status: string) => {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: "待确认", color: "#FF9800" },
    confirmed: { label: "已确认", color: "#4CAF50" },
    completed: { label: "已完成", color: "#2196F3" },
    cancelled: { label: "已取消", color: "#9E9E9E" },
  };
  return map[status] || { label: status, color: "#666" };
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newAppointment, setNewAppointment] = useState({
    pet_id: 0,
    service_type: "walk",
    appointment_date: "",
    duration: 30,
    address: "",
    contact_phone: "",
    remark: ""
  });

  useEffect(() => {
    fetchAppointments();
    fetchPets();
  }, [filterStatus]);

  const fetchAppointments = async () => {
    try {
      let url = "http://10.224.205.37:8000/api/appointments";
      if (filterStatus !== "all") {
        url += `?status=${filterStatus}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPets = async () => {
    try {
      const res = await fetch("http://10.224.205.37:8000/api/pets?category=pet");
      if (res.ok) {
        const data = await res.json();
        setPets(data.items || []);
        if (data.items?.length > 0) {
          setNewAppointment(prev => ({ ...prev, pet_id: data.items[0].id }));
        }
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
    }
  };

  const submitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.pet_id) {
      Message.warning("请选择宠物");
      return;
    }
    if (!newAppointment.appointment_date) {
      Message.warning("请选择预约时间");
      return;
    }

    try {
      const res = await fetch("http://10.224.205.37:8000/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAppointment,
          appointment_date: new Date(newAppointment.appointment_date).toISOString()
        })
      });

      if (res.ok) {
        Message.success("预约成功！");
        setShowForm(false);
        setNewAppointment({
          pet_id: pets[0]?.id || 0,
          service_type: "walk",
          appointment_date: "",
          duration: 30,
          address: "",
          contact_phone: "",
          remark: ""
        });
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  const cancelAppointment = async (id: number) => {
    if (!confirm("确定要取消这个预约吗?")) return;
    try {
      const res = await fetch(`http://10.224.205.37:8000/api/appointments/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        Message.info("预约已取消");
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const calculatePrice = () => {
    const base = newAppointment.service_type === "walk" ? 0 :
                 newAppointment.service_type === "grooming" ? 100 :
                 newAppointment.service_type === "medical" ? 200 : 150;
    const perMin = newAppointment.service_type === "walk" ? 2 :
                   newAppointment.service_type === "grooming" ? 1.5 :
                   newAppointment.service_type === "medical" ? 3 : 2.5;
    return (base + newAppointment.duration * perMin).toFixed(2);
  };

  if (loading) {
    return (
      <div className="container">
        <PawBackground />
        <header className="header">
          <div className="container">
            <h1>📅 服务预约</h1>
          </div>
        </header>
        <div className="loading-container">
          <div className="loading-pets">
            <span>🚶</span>
            <span>✨</span>
            <span>🏥</span>
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
          <h1>📅 服务预约</h1>
        </div>
      </header>

      <main className="container">
        <Link href="/" className="back-link">← 返回首页</Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  background: filterStatus === status ? "#4CAF50" : "#f5f5f5",
                  color: filterStatus === status ? "white" : "#666",
                  fontSize: "0.9rem"
                }}
              >
                {status === "all" ? "全部" : getStatusInfo(status).label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
            style={{ background: "#4CAF50" }}
          >
            {showForm ? "取消" : "+ 新建预约"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submitAppointment} style={{ 
            background: "white", 
            padding: "25px", 
            borderRadius: "12px", 
            marginBottom: "25px"
          }}>
            <h3 style={{ marginBottom: "20px" }}>新建预约</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label>选择宠物 *</label>
                <select
                  value={newAppointment.pet_id}
                  onChange={(e) => setNewAppointment({ ...newAppointment, pet_id: parseInt(e.target.value) })}
                  required
                >
                  <option value={0}>请选择宠物</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>服务类型 *</label>
                <select
                  value={newAppointment.service_type}
                  onChange={(e) => setNewAppointment({ ...newAppointment, service_type: e.target.value })}
                  required
                >
                  {serviceTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>预约时间 *</label>
                <input
                  type="datetime-local"
                  value={newAppointment.appointment_date}
                  onChange={(e) => setNewAppointment({ ...newAppointment, appointment_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>服务时长 (分钟)</label>
                <input
                  type="number"
                  value={newAppointment.duration}
                  onChange={(e) => setNewAppointment({ ...newAppointment, duration: parseInt(e.target.value) || 30 })}
                  min="15"
                  max="240"
                />
                <small style={{ color: "#666" }}>预计费用: ¥{calculatePrice()}</small>
              </div>

              <div className="form-group">
                <label>联系电话</label>
                <input
                  type="tel"
                  value={newAppointment.contact_phone}
                  onChange={(e) => setNewAppointment({ ...newAppointment, contact_phone: e.target.value })}
                  placeholder="请输入联系电话"
                />
              </div>

              <div className="form-group">
                <label>服务地址</label>
                <input
                  type="text"
                  value={newAppointment.address}
                  onChange={(e) => setNewAppointment({ ...newAppointment, address: e.target.value })}
                  placeholder="请输入服务地址"
                />
              </div>
            </div>

            <div className="form-group">
              <label>备注</label>
              <textarea
                value={newAppointment.remark}
                onChange={(e) => setNewAppointment({ ...newAppointment, remark: e.target.value })}
                placeholder="其他要求或注意事项..."
                rows={2}
              />
            </div>

            <div style={{ 
              background: "#f0f7ff", 
              padding: "15px", 
              borderRadius: "8px", 
              marginBottom: "15px" 
            }}>
              <p style={{ marginBottom: "5px" }}><strong>服务说明:</strong></p>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>
                {getServiceInfo(newAppointment.service_type).desc}
              </p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ background: "#4CAF50" }}>
              确认预约
            </button>
          </form>
        )}

        {appointments.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px"
          }}>
            <p style={{ fontSize: "3rem", marginBottom: "15px" }}>📅</p>
            <p style={{ color: "#666", fontSize: "1.1rem" }}>
              暂无预约记录，点击上方按钮预约服务
            </p>
          </div>
        ) : (
          <div>
            {appointments.map((appt) => {
              const serviceInfo = getServiceInfo(appt.service_type);
              const statusInfo = getStatusInfo(appt.status);
              return (
                <div 
                  key={appt.id}
                  style={{ 
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    marginBottom: "15px",
                    borderLeft: `4px solid ${statusInfo.color}`
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "1.5rem" }}>{serviceInfo.icon}</span>
                        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{serviceInfo.label}</span>
                        <span style={{ 
                          background: statusInfo.color, 
                          color: "white", 
                          padding: "4px 10px", 
                          borderRadius: "15px",
                          fontSize: "0.8rem"
                        }}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p style={{ color: "#333", marginBottom: "8px" }}>
                        🐾 宠物: {appt.pet_name}
                      </p>
                      <p style={{ color: "#666", marginBottom: "8px" }}>
                        📅 时间: {new Date(appt.appointment_date).toLocaleString()}
                      </p>
                      <p style={{ color: "#666", marginBottom: "8px" }}>
                        ⏱️ 时长: {appt.duration} 分钟
                      </p>
                      {appt.address && (
                        <p style={{ color: "#666", marginBottom: "8px" }}>
                          📍 地址: {appt.address}
                        </p>
                      )}
                      {appt.remark && (
                        <p style={{ color: "#666", marginBottom: "8px" }}>
                          📝 备注: {appt.remark}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4CAF50", marginBottom: "10px" }}>
                        ¥{appt.price.toFixed(2)}
                      </p>
                      {appt.status === "pending" && (
                        <button 
                          onClick={() => cancelAppointment(appt.id)}
                          style={{
                            background: "#f44336",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            cursor: "pointer"
                          }}
                        >
                          取消预约
                        </button>
                      )}
                    </div>
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
