import {Link,useLocation,useNavigate} from "react-router-dom";
import {useEffect,useState} from "react";
import api from "../../api";
import {FaThLarge,FaUser,FaFileAlt,FaSearch,FaRobot,FaSignOutAlt} from "react-icons/fa";
export default function UserSidebar(){
  const navigate=useNavigate();
  const location=useLocation();
  const[notifCount,setNotifCount]=useState(0);
  const token=sessionStorage.getItem("token");
  const handleLogout=()=>{
    sessionStorage.clear();
    navigate("/login");
  };
  useEffect(()=>{
    const fetchCount=async()=>{
      try{
        const res=await api.get("/api/chat/user-list/",{headers:{Authorization:`Bearer ${token}`}});
        const count=res.data.filter(a=>a.has_unread).length;
        setNotifCount(count);
      }catch(err){}
    };
    fetchCount();
    const interval=setInterval(fetchCount,3000);
    return()=>clearInterval(interval);
  },[]);
  const linkClass=(path)=>`flex items-center gap-4 p-3.5 rounded-xl transition font-bold text-xs uppercase tracking-wider whitespace-nowrap ${location.pathname===path?"bg-[#2E8B87] text-white shadow-sm":"text-slate-500 hover:bg-white hover:text-[#2E8B87]"}`;
  return(
    <div className="w-full h-full p-6 flex flex-col justify-between">
      <ul className="space-y-2">
        <li><Link to="/user" className={linkClass("/user")}><FaThLarge size={16}/><span>Dashboard</span></Link></li>
        <li><Link to="/user/profile" className={linkClass("/user/profile")}><FaUser size={16}/><span>Profile</span></Link></li>
        <li><Link to="/user/applications" className={`${linkClass("/user/applications")} justify-between`}><div className="flex items-center gap-4"><FaFileAlt size={16}/><span>Applications</span></div>{notifCount>0&&<span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{notifCount}</span>}</Link></li>
        <li><Link to="/user/jobs" className={linkClass("/user/jobs")}><FaSearch size={16}/><span>Browse Jobs</span></Link></li>
        <li><Link to="/user/resume-ai" className={linkClass("/user/resume-ai")}><FaRobot size={16}/><span>Resume AI</span></Link></li>
      </ul>
      <button onClick={handleLogout} className="w-full p-4 rounded-xl text-slate-500 border border-slate-200 hover:bg-red-500 hover:text-white hover:border-red-500 active:bg-red-600 transition-all font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-3">
        <FaSignOutAlt size={14}/>
        <span>LOGOUT SYSTEM</span>
      </button>
    </div>
  );
}
