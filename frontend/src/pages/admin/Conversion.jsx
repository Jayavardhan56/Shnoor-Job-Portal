import {useEffect,useState} from "react";
import api from "../../api";
import AdminLayout from "../../layouts/AdminLayout";

export default function Conversion(){
  const[stats,setStats]=useState({total_apps:0,total_shortlisted:0,total_rejected:0,total_hires:0});
  const token=sessionStorage.getItem("token");
  useEffect(()=>{
    const fetch=async()=>{
      try{
        const res=await api.get("/api/analytics/stats/",{headers:{Authorization:`Bearer ${token}`}});
        setStats(res.data);
      }catch(err){
        console.log(err);
      }
    };
    fetch();
  },[]);

  const hireRate=stats.total_apps?((stats.total_hires/stats.total_apps)*100).toFixed(1):0;
  const shortRate=stats.total_apps?((stats.total_shortlisted/stats.total_apps)*100).toFixed(1):0;

  return(
    <AdminLayout>
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Conversion Funnel</h1>
        <p className="text-slate-500 mt-1 text-sm uppercase tracking-widest">Efficiency through the pipeline</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-10">
        <div className="xl:col-span-8 bg-white border border-slate-100 rounded-2xl p-5 sm:p-8 lg:p-12 shadow-sm overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-8 lg:mb-12 font-['Plus_Jakarta_Sans']">Hiring Pipeline Flow</h2>
          <div className="space-y-10 lg:space-y-16">
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-4">
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">{stats.total_apps}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] mt-2">Total Applications</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400">100% POOL</span>
              </div>
              <div className="w-full h-5 bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-slate-200 rounded-full" style={{width:"100%"}}></div>
              </div>
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-4">
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-teal-600">{stats.total_shortlisted}</p>
                  <p className="text-[10px] font-bold text-teal-400 uppercase tracking-[2px] mt-2">Shortlisted Candidates</p>
                </div>
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">{shortRate}% RATE</span>
              </div>
              <div className="w-full h-5 bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{width:`${shortRate}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-4">
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-teal-500">{stats.total_hires}</p>
                  <p className="text-[10px] font-bold text-teal-400 uppercase tracking-[2px] mt-2">Final Successful Hires</p>
                </div>
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">{hireRate}% CONVERSION</span>
              </div>
              <div className="w-full h-5 bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{width:`${hireRate}%`}}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="xl:col-span-4 space-y-6 lg:space-y-8">
          <div className="bg-teal-500 rounded-2xl p-6 sm:p-8 lg:p-10 border border-teal-100 flex flex-col justify-center items-center text-center text-white">
            <h3 className="text-4xl sm:text-5xl font-bold mb-4 text-white">{hireRate}%</h3>
            <p className="text-teal-100 text-[10px] font-bold uppercase tracking-[3px]">Conversion Success</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 lg:p-10 shadow-sm">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[2px] mb-6">Drop-off Insights</h3>
            <div className="space-y-6">
              <div className="flex justify-between">
                <span className="text-sm font-bold text-slate-700">Rejections</span>
                <span className="text-sm font-bold text-red-500">{stats.total_rejected}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">System-wide candidate drop-off rate is approximately {stats.total_apps?((stats.total_rejected/stats.total_apps)*100).toFixed(1):0}%.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
