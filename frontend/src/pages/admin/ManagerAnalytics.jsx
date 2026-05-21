import {useEffect,useState} from "react";
import api from "../../api";
import AdminLayout from "../../layouts/AdminLayout";

export default function ManagerAnalytics(){
  const[trends,setTrends]=useState([]);
  const token=sessionStorage.getItem("token");
  useEffect(()=>{
    const fetch=async()=>{
      try{
        const res=await api.get("/api/analytics/stats/",{headers:{Authorization:`Bearer ${token}`}});
        setTrends(res.data.trends);
      }catch(err){}
    };
    fetch();
  },[]);

  return(
    <AdminLayout>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Recruiter Performance</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Growth and hiring metrics by manager</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {trends.map((m,i)=>(
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans'] break-all">{m.created_by__username}</h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Hiring Manager</p>
              </div>
              <div className="text-right">
                <p className="text-xl sm:text-2xl font-bold text-teal-500">{m.hires}</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Hires</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                  <span>Applications to Hires</span>
                  <span className="text-slate-800">{m.apps?((m.hires/m.apps)*100).toFixed(0):0}%</span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{width:`${m.apps?(m.hires/m.apps)*100:0}%`}}></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-6 sm:gap-10 pt-4">
                <div>
                  <p className="text-base sm:text-lg font-bold text-slate-800">{m.apps}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Applications</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800">{(m.apps/10).toFixed(1)}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Avg/Job</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
