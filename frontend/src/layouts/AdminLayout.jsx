import {useEffect,useState} from "react";
import {useNavigate,useLocation} from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import DashboardNavbar from "../components/DashboardNavbar";
export default function AdminLayout({children}){
  const navigate=useNavigate();
  const location=useLocation();
  const[isSidebarOpen,setIsSidebarOpen]=useState(typeof window !== "undefined" ? window.innerWidth > 1024 : true);
  useEffect(()=>{if(!sessionStorage.getItem("token"))navigate("/login");},[navigate]);
  useEffect(()=>{
    if(typeof window !== "undefined" && window.innerWidth <= 1024){
      setIsSidebarOpen(false);
    }
  },[location.pathname]);
  return(
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar onToggleSidebar={()=>setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen}/>
      <div className="flex pt-[73px] relative">
        <div className={`fixed top-[73px] left-0 z-40 h-[calc(100vh-73px)] w-64 overflow-y-auto bg-white border-r border-slate-100 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <AdminSidebar /> </div>
        {isSidebarOpen && (<div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>)}
        <div className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ${isSidebarOpen ? "lg:ml-64 ml-0" : "ml-0"} p-4 sm:p-6 lg:p-10`}>
          {children}
        </div>
      </div>
    </div>
  );
}
