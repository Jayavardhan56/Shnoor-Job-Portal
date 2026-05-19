import {Link,useLocation,useNavigate} from "react-router-dom";
import {useEffect,useState} from "react";
import {FaThLarge,FaUserTie,FaUsers,FaCode,FaChartLine,FaExchangeAlt,FaSignOutAlt} from "react-icons/fa";
import Support from "../../pages/admin/Support";
export default function AdminSidebar(){
  const navigate=useNavigate();
  const location=useLocation();
  const handleLogout=()=>{
    sessionStorage.clear();
    navigate("/login");
  };
  const linkClass=(path)=>`flex items-center gap-4 p-3.5 rounded-xl transition font-bold text-xs uppercase tracking-wider whitespace-nowrap ${location.pathname===path?"bg-[#2E8B87] text-white shadow-sm":"text-slate-500 hover:bg-white hover:text-[#2E8B87]"}`;
  return(
    <div className="w-full h-full p-6 flex flex-col justify-between">
      <ul className="space-y-2">
        <li><Link to="/admin" className={linkClass("/admin")}><FaThLarge size={16}/><span>Dashboard</span></Link></li>
        <li><Link to="/admin/managers" className={linkClass("/admin/managers")}><FaUserTie size={16}/><span>Recruiters</span></Link></li>
        <li><Link to="/admin/users" className={linkClass("/admin/users")}><FaUsers size={16}/><span>Users</span></Link></li>
        <div className="pt-6 pb-2 px-3 text-xs font-bold text-slate-400 tracking-[2px] uppercase">Intelligence</div>
        <li><Link to="/admin/skills" className={linkClass("/admin/skills")}><FaCode size={16}/><span>Skills</span></Link></li>
        <li><Link to="/admin/analytics" className={linkClass("/admin/analytics")}><FaChartLine size={16}/><span>Growth</span></Link></li>
        <li><Link to="/admin/conversion" className={linkClass("/admin/conversion")}><FaExchangeAlt size={16}/><span>Conversion</span></Link></li>
        <li><Link to="/admin/Support" className={linkClass("/admin/Support")}><FaExchangeAlt size={16}/><span>Support</span></Link></li>
      </ul>
      <button onClick={handleLogout} className="w-full p-4 rounded-xl text-slate-500 border border-slate-200 hover:bg-red-500 hover:text-white hover:border-red-500 active:bg-red-600 transition-all font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-3">
        <FaSignOutAlt size={14}/>
        <span>LOGOUT SYSTEM</span>
      </button>
    </div>
  );
}
