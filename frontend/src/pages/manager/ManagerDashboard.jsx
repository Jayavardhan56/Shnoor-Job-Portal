import {useEffect,useState} from "react";
import api from "../../api";
import ManagerLayout from "../../layouts/ManagerLayout";
import {FaCommentAlt} from "react-icons/fa";

export default function ManagerDashboard(){
  const[stats,setStats]=useState({totalJobs:0,applicants:0});
  const[notifCount,setNotifCount]=useState(0);
  const[jobs,setJobs]=useState([]);
  const token=sessionStorage.getItem("token");
  useEffect(()=>{
    const fetchData=async()=>{
      try{
        const jRes=await api.get("/api/jobs/my/",{headers:{Authorization:`Bearer ${token}`}});
        const aRes=await api.get("/api/applications/manager-all/",{headers:{Authorization:`Bearer ${token}`}});
        setJobs(jRes.data.slice(0,4));
        setStats({totalJobs:jRes.data.length,applicants:aRes.data.length});
        const nRes=await api.get("/api/chat/manager-list/",{headers:{Authorization:`Bearer ${token}`}});
        setNotifCount(nRes.data.filter(a=>a.has_unread).length);
      }catch(err){}
    };
    fetchData();
  },[]);
  return(
    <ManagerLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">Recruiter Overview</h1>
          <p className="text-slate-500 mt-2 text-base font-bold uppercase tracking-widest">SHNOOR Recruitment Pipeline Analytics</p>
        </div>
        <button onClick={()=>window.location.href='/manager/messages'} className="px-6 py-4 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-secondary flex items-center gap-3">
          <FaCommentAlt size={14}/>
          Messages
          {notifCount>0&&(
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{notifCount}</span>
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-teal-50 p-10 rounded-2xl border border-teal-100 shadow-sm relative overflow-hidden">
          <p className="text-teal-600 text-sm font-bold uppercase tracking-widest mb-6 relative z-10">Active Listings</p>
          <h2 className="text-4xl font-bold text-slate-900 relative z-10 font-['Plus_Jakarta_Sans']">{stats.totalJobs}</h2>
          <p className="text-slate-500 text-xs mt-4 font-bold uppercase tracking-wider relative z-10">Live Job Infrastructure</p>
        </div>
        <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-6">Global Applicants</p>
          <h2 className="text-4xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">{stats.applicants}</h2>
          <p className="text-slate-400 text-xs mt-4 font-bold uppercase tracking-wider">Total Pipeline Submissions</p>
        </div>
        <div className="bg-teal-50 p-10 rounded-2xl border border-teal-100 shadow-sm flex flex-col justify-center">
          <p className="text-teal-600 text-sm font-bold uppercase tracking-widest mb-4">Partner Status</p>
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight font-['Plus_Jakarta_Sans']">Verified Hiring Authority</h2>
        </div>
      </div>
      <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">Active Pipeline Nodes</h2>
          <button onClick={()=>window.location.href='/manager/jobs'} className="px-8 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-slate-100 transition shadow-sm border border-slate-200">Manage Pipeline</button>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {jobs.length===0?(
            <div className="col-span-2 py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-base font-medium italic">No active job nodes detected in the recruitment pipeline.</p>
            </div>
          ):(
            jobs.map((j)=>(
              <div key={j.id} className="p-8 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">{j.title}</h3>
                  <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-wider">{j.salary}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-teal-500 shadow-sm border border-slate-200">→</div>
              </div>
            ))
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}
