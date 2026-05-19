import {FaSun,FaMoon,FaChevronLeft,FaChevronRight} from "react-icons/fa";
import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import logo from "../assets/logo.png";
export default function DashboardNavbar({onToggleSidebar,isSidebarOpen}){
  const[theme,setTheme]=useState(localStorage.getItem("theme")||"light");
  const username=sessionStorage.getItem("username")||"User";
  const role=sessionStorage.getItem("role")||"User";
  const toggleTheme=()=>{
    const next=theme==="light"?"dark":"light";
    setTheme(next);
    localStorage.setItem("theme",next);
    document.documentElement.setAttribute("data-theme",next);
  };
  useEffect(()=>{
    document.documentElement.setAttribute("data-theme",theme);
  },[theme]);
  return(
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 h-[73px] flex items-center">
      <div className="flex items-center justify-between w-64 px-4 h-full shrink-0">
        <Link to={role.toLowerCase()==="admin"?"/admin":role.toLowerCase()==="manager"?"/manager":"/user"} className="flex items-center gap-2">
          <div className="p-1 rounded-lg border border-slate-200 shrink-0" style={{backgroundColor:'#ffffff'}}>
            <img src={logo} alt="Shnoor" className="h-8 w-auto object-contain"/>
          </div>
          <span className="text-xl font-extrabold text-slate-800 tracking-tighter whitespace-nowrap">Shnoor <span className="text-slate-400 font-medium text-sm ml-0.5">Job Portal</span></span>
        </Link>
        <button onClick={onToggleSidebar} className="text-slate-400 hover:text-slate-900 transition-colors p-1 cursor-pointer shrink-0">
          {isSidebarOpen?<FaChevronLeft size={16}/>:<FaChevronRight size={16}/>}
        </button>
      </div>
      <div className="flex-1 px-8 flex justify-end items-center h-full">
        <div className="flex items-center gap-6">
          <button onClick={toggleTheme} className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500 hover:text-slate-900 transition">
            {theme==="light"?<FaSun size={16}/>:<FaMoon size={16}/>}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 font-bold border border-slate-100">
              {username[0].toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-slate-900">{username}</p>
              <p className="text-xs font-medium text-slate-500 capitalize">{role} Account</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
