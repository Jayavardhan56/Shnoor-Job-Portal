import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import DashboardNavbar from "../components/DashboardNavbar";
export default function AdminLayout({children}){
  const navigate=useNavigate();
  const[isSidebarOpen,setIsSidebarOpen]=useState(true);
  useEffect(()=>{if(!sessionStorage.getItem("token"))navigate("/login");},[navigate]);
  return(
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar onToggleSidebar={()=>setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen}/>
      <div className="flex pt-[73px]">
        <div className={`${isSidebarOpen?"w-64":"w-0"} overflow-hidden transition-all duration-300 border-r border-slate-100 bg-white fixed h-[calc(100vh-73px)] top-[73px] z-40`}>
          <AdminSidebar/>
        </div>
        <div className={`flex-1 ${isSidebarOpen?"ml-64":"ml-0"} transition-all duration-300 p-10`}>
          {children}
        </div>
      </div>
    </div>
  );
}
