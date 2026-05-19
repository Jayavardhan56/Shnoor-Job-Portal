import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaThLarge, FaBriefcase, FaSitemap, FaUsers, FaStar, FaBuilding, FaSignOutAlt } from "react-icons/fa";
export default function ManagerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };
  const linkClass = (path) => `flex items-center gap-4 p-3.5 rounded-xl transition font-bold text-xs uppercase tracking-wider whitespace-nowrap ${location.pathname === path ? "bg-[#2E8B87] text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-[#2E8B87]"}`;
  return (
    <div className="w-full h-full p-6 flex flex-col justify-between">
      <ul className="space-y-2">
        <li><Link to="/manager" className={linkClass("/manager")}><FaThLarge size={16} /><span>Dashboard</span></Link></li>
        <li><Link to="/manager/post-job" className={linkClass("/manager/post-job")}><FaBriefcase size={16} /><span>Post Job</span></Link></li>
        <li><Link to="/manager/jobs" className={linkClass("/manager/jobs")}><FaSitemap size={16} /><span>Job Pipeline</span></Link></li>
        <li><Link to="/manager/applicants" className={linkClass("/manager/applicants")}><FaUsers size={16} /><span>All Applicants</span></Link></li>
        <li><Link to="/manager/ratings" className={linkClass("/manager/ratings")}><FaStar size={16} /><span>User Ratings</span></Link></li>
        <li><Link to="/manager/company" className={linkClass("/manager/company")}><FaBuilding size={16} /><span>Company Profile</span></Link></li>
      </ul>

      <button onClick={handleLogout} className="w-full p-4 rounded-xl text-slate-500 border border-slate-200 hover:bg-red-500 hover:text-white hover:border-red-500 active:bg-red-600 transition-all font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-3">
        <FaSignOutAlt size={14} />
        <span>LOGOUT SYSTEM</span>
      </button>
    </div>
  );
}
