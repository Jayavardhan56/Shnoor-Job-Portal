import { useEffect, useState } from "react";
import UserLayout from "../../layouts/UserLayout";
import api from "../../api";
import { FaBell, FaCheckCircle, FaInfoCircle, FaRegClock } from "react-icons/fa";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/api/notifications/", { headers: { Authorization: `Bearer ${token}` } });
        setNotifications(res.data);
      } catch (err) {}
    };
    fetchNotifications();
  }, []);

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-slate-100 pb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">Notifications</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Stay updated with your applications</p>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <FaBell size={24} />
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No new notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-start gap-5 hover:border-slate-200 transition-all">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                  {n.type === 'success' ? <FaCheckCircle className="text-teal-600" /> : <FaInfoCircle />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <FaRegClock size={10} />
                    <span>{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </UserLayout>
  );
}
