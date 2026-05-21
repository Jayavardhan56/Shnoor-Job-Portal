import {FaSun,FaMoon,FaChevronLeft,FaChevronRight,FaBars,FaTimes} from "react-icons/fa";
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
      <div className="flex items-center justify-between w-full lg:w-64 px-4 h-full shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="lg:hidden text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100">
            {isSidebarOpen?<FaTimes size={18}/>:<FaBars size={18}/>}
          </button>
          <Link to={role.toLowerCase()==="admin"?"/admin":role.toLowerCase()==="manager"?"/manager":"/user"} className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded-lg border border-slate-200 shrink-0 bg-white">
              <img src={logo} alt="Shnoor" className="h-8 w-auto object-contain"/>
            </div>
            <span className="hidden sm:block text-xl font-extrabold text-slate-800 tracking-tighter whitespace-nowrap">
              Shnoor <span className="text-slate-400 font-medium text-sm ml-0.5">Job Portal</span>
            </span>
          </Link>
        </div>
        <button onClick={onToggleSidebar} className="hidden lg:flex text-slate-400 hover:text-slate-900 transition-colors p-1 cursor-pointer shrink-0">
          {isSidebarOpen?<FaChevronLeft size={16}/>:<FaChevronRight size={16}/>}
        </button>
      </div>
      <div className="flex-1 px-4 sm:px-6 lg:px-8 flex justify-end items-center h-full">
        <div className="flex items-center gap-3 sm:gap-6">
          <button onClick={toggleTheme} className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500 hover:text-slate-900 transition shrink-0">
            {theme==="light"?<FaSun size={16}/>:<FaMoon size={16}/>}
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 font-bold border border-slate-100 shrink-0">
              {username[0].toUpperCase()}
            </div>
            <div className="hidden md:block text-left min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{username}</p>
              <p className="text-xs font-medium text-slate-500 capitalize truncate">{role} Account</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}