import {useEffect,useState} from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {FaArrowLeft,FaBriefcase,FaUsers,FaCheckCircle,FaUserTie,FaChartPie} from "react-icons/fa";
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,PieChart,Pie,Cell} from "recharts";

export default function ManageManagers(){
  const navigate=useNavigate();
  const[managers,setManagers]=useState([]);
  const[selectedManager,setSelectedManager]=useState(null);
  const[selectedJob,setSelectedJob]=useState(null);
  const[details,setDetails]=useState(null);
  const[loading,setLoading]=useState(false);
  const[mSearch,setMSearch]=useState("");
  const[jSearch,setJSearch]=useState("");
  const[selM,setSelM]=useState([]);
  const[selJ,setSelJ]=useState([]);
  const token=sessionStorage.getItem("token");

  const fetchManagers=async()=>{
    try{
      const res=await api.get("/api/managers/",{headers:{Authorization:`Bearer ${token}`}});
      setManagers(res.data);
    }catch(err){
      console.log(err);
    }
  };

  const fetchDetails=async(id)=>{
    setLoading(true);
    try{
      const res=await api.get(`/api/jobs/admin/manager/${id}/`,{headers:{Authorization:`Bearer ${token}`}});
      setDetails(res.data);
      setSelectedManager(id);
      setSelectedJob(null);
    }catch(err){
      console.log(err);
    }
    setLoading(false);
  };

  const approveManager=async(id)=>{
    try{
      await api.post(`/api/approve/${id}/`,{},{headers:{Authorization:`Bearer ${token}`}});
      fetchManagers();
    }catch(err){
      console.log(err);
    }
  };

  const deleteManager=async(id)=>{
    if(!window.confirm("Are you sure you want to remove this manager?"))return;
    try{
      await api.delete(`/api/admin/managers/${id}/`,{headers:{Authorization:`Bearer ${token}`}});
      fetchManagers();
      if(selectedManager===id)setSelectedManager(null);
    }catch(err){
      console.log(err);
    }
  };

  const deleteJob=async(id)=>{
    if(!window.confirm("Permanent Action: Delete this job listing?"))return;
    try{
      await api.delete(`/api/jobs/${id}/`,{headers:{Authorization:`Bearer ${token}`}});
      if(selectedManager)fetchDetails(selectedManager);
      setSelJ(prev=>prev.filter(jid=>jid!==id));
    }catch(err){
      console.log(err);
    }
  };

  const bulkDeleteManagers=async()=>{
    if(!window.confirm(`Delete ${selM.length} selected managers?`))return;
    try{
      await api.post("/api/admin/managers/bulk-delete/",{ids:selM},{headers:{Authorization:`Bearer ${token}`}});
      setSelM([]);
      fetchManagers();
    }catch(err){
      console.log(err);
    }
  };

  const bulkDeleteJobs=async()=>{
    if(!window.confirm(`Delete ${selJ.length} selected jobs?`))return;
    try{
      await api.post("/api/jobs/bulk-delete/",{ids:selJ},{headers:{Authorization:`Bearer ${token}`}});
      setSelJ([]);
      if(selectedManager)fetchDetails(selectedManager);
    }catch(err){
      console.log(err);
    }
  };

  const toggleM=(id)=>{
    setSelM(prev=>prev.includes(id)?prev.filter(i=>i!==id):[...prev,id]);
  };

  const toggleJ=(id)=>{
    setSelJ(prev=>prev.includes(id)?prev.filter(i=>i!==id):[...prev,id]);
  };

  useEffect(()=>{fetchManagers();},[]);

  const[activeStage,setActiveStage]=useState("Pending");

  if(selectedJob){
    const stages=[
      {label:"Pending",data:selectedJob.stats.pending,color:"text-amber-600",chartColor:"#f59e0b"},
      {label:"Interviewing",data:selectedJob.stats.interviewing,color:"text-blue-600",chartColor:"#3b82f6"},
      {label:"Shortlisted",data:selectedJob.stats.shortlisted,color:"text-teal-600",chartColor:"#14b8a6"},
      {label:"Hired",data:selectedJob.stats.hired,color:"text-green-600",chartColor:"#10b981"},
      {label:"Rejected",data:selectedJob.stats.rejected,color:"text-red-500",chartColor:"#ef4444"}
    ];

    const currentStageData=stages.find(s=>s.label===activeStage);
    const chartData=stages.map(s=>({name:s.label,value:s.data.count,color:s.chartColor})).filter(d=>d.value>0);

    return(
      <AdminLayout>
        <div className="max-w-[1400px] mx-auto font-plus bg-white min-h-screen p-10">
          <div className="mb-12 flex items-center gap-6 border-b border-slate-100 pb-8">
            <button onClick={()=>setSelectedJob(null)} className="text-teal-600 hover:text-teal-700 transition-colors"><FaArrowLeft size={24}/></button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{selectedJob.title}</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[2px] mt-1">Job Analytics Center</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="flex-1 w-full space-y-16">
              
              
              <div className="space-y-10">
                 <h2 className="text-base font-bold text-teal-600 uppercase tracking-[3px] border-b border-teal-50 pb-4">Job Overview</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-12">
                    <div className="col-span-full space-y-3">
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Description</p>
                       <p className="text-slate-900 font-bold leading-relaxed text-base">{selectedJob.description || "NO DESCRIPTION PROVIDED"}</p>
                    </div>
                    <div className="space-y-3">
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Mandatory Skills</p>
                       <p className="text-teal-600 font-bold text-base">{selectedJob.skills}</p>
                    </div>
                    <div className="space-y-3">
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Compensation</p>
                       <p className="text-slate-900 font-bold text-base">{selectedJob.salary}</p>
                    </div>
                    <div className="space-y-3">
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Submission Deadline</p>
                       <p className="text-red-500 font-bold text-base">{selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : "FIXED DEADLINE"}</p>
                    </div>
                    <div className="space-y-3">
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Location & Setup</p>
                       <p className="text-slate-900 font-bold text-base uppercase">{selectedJob.location || "OFFICE"} ({selectedJob.work_mode || "ON-SITE"})</p>
                    </div>
                    <div className="space-y-3">
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Role Parameters</p>
                       <p className="text-slate-900 font-bold text-base uppercase">{selectedJob.job_type || "REGULAR"} • {selectedJob.experience_level || "OPEN EXPERIENCE"}</p>
                    </div>
                 </div>
              </div>

              
              <div className="space-y-10 pt-10 border-t border-slate-50">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                       <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Student Applications</h3>
                       <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Select phase to view students</p>
                    </div>
                    <div className="relative">
                       <select value={activeStage} onChange={(e)=>setActiveStage(e.target.value)} className="appearance-none bg-white border-2 border-slate-100 hover:border-teal-200 px-10 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-slate-900 focus:outline-none focus:border-teal-500 min-w-[280px] cursor-pointer transition-all">
                          {stages.map((s,i)=><option key={i} value={s.label}>{s.label} ({s.data.count})</option>)}
                       </select>
                       <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-teal-600 text-lg">▾</div>
                    </div>
                 </div>

                 
                 <div className="pt-6">
                    {currentStageData.data.users.length===0 ? (
                       <div className="py-24 text-center border-2 border-dashed border-slate-50 rounded-[32px]">
                          <p className="text-slate-300 font-bold uppercase tracking-[3px] text-sm">No Candidates</p>
                          <p className="text-slate-400 font-bold italic mt-2 text-sm">No users found in the {activeStage} list.</p>
                       </div>
                    ) : (
                       <div className="divide-y divide-slate-100">
                          {currentStageData.data.users.map(u=>(
                             <div key={u.user__id} className="flex items-center justify-between py-8 group px-4 hover:bg-teal-50/20 transition-all rounded-2xl">
                                <div className="flex items-center gap-7">
                                   <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-lg transition-all group-hover:bg-white group-hover:text-teal-600 group-hover:border group-hover:border-teal-100">
                                      {u.user__username.charAt(0).toUpperCase()}
                                   </div>
                                   <div>
                                      <p className="text-2xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{u.user__username}</p>
                                      <p className="text-base font-bold text-slate-400 mt-1">{u.user__email}</p>
                                   </div>
                                </div>
                                <button onClick={()=>navigate(`/admin/user-profile/${u.user__id}`)} className="text-sm font-bold text-teal-600 uppercase tracking-[2px] border-b-2 border-transparent hover:border-teal-600 pb-2 transition-all">User Profile</button>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              </div>
            </div>

            
            <div className="w-full lg:w-[400px] sticky top-12 space-y-12">
               <div className="text-center p-12 bg-slate-50/40 rounded-[56px] border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[3px] mb-10">Application Stats</h3>
                  <div className="h-[300px] w-full relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <p className="text-5xl font-bold text-slate-900">{selectedJob.stats.total}</p>
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Applications</p>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={chartData.length > 0 ? chartData : [{name:"Empty",value:1,color:"#f1f5f9"}]} innerRadius={85} outerRadius={125} paddingAngle={10} dataKey="value" stroke="none">
                             {chartData.length > 0 ? chartData.map((entry,index)=><Cell key={`cell-${index}`} fill={entry.color}/>) : <Cell fill="#f1f5f9"/>}
                          </Pie>
                          <Tooltip contentStyle={{borderRadius:'28px',border:'none',boxShadow:'0 25px 30px -5px rgba(0,0,0,0.1)',fontSize:'14px',fontWeight:'700',padding:'20px'}}/>
                       </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-5 mt-10 text-left px-6">
                     {stages.map((s,i)=>(
                        <div key={i} className="flex items-center justify-between text-sm font-bold uppercase tracking-widest text-slate-500">
                           <div className="flex items-center gap-4">
                              <div className="w-4 h-4 rounded-full" style={{backgroundColor:s.chartColor}}></div>
                              <span>{s.label}</span>
                           </div>
                           <span className="text-slate-900 font-bold">{s.data.count}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if(selectedManager && details){
    const filteredJobs = details.jobs.filter(job => 
      job.title.toLowerCase().includes(jSearch.toLowerCase()) ||
      (job.skills && job.skills.toLowerCase().includes(jSearch.toLowerCase()))
    );

    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto font-plus bg-white min-h-screen p-10">
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-6">
              <button onClick={()=>setSelectedManager(null)} className="text-teal-600 hover:text-teal-700 transition-colors"><FaArrowLeft size={24}/></button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{details.manager.username}'s Postings</h1>
                <p className="text-teal-600 text-xs font-bold uppercase tracking-[2px] mt-1">{details.manager.organization || "Independent Recruiter"}</p>
              </div>
            </div>
            <div className="flex flex-col md:items-end gap-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search position or skills..." 
                  value={jSearch} 
                  onChange={(e)=>setJSearch(e.target.value)}
                  className="bg-white border border-slate-200 px-12 py-3.5 rounded-[20px] text-sm font-bold w-full md:w-[400px] focus:outline-none focus:border-teal-500 shadow-sm placeholder:text-slate-400 placeholder:font-bold transition-all"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
              </div>
              {selJ.length > 0 && (
                <button onClick={bulkDeleteJobs} className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-red-100 transition-all">
                  Delete Selected ({selJ.length})
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredJobs.length===0 && <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No jobs found matching "{jSearch}".</div>}
            {filteredJobs.map(job=>(
              <div key={job.id} className={`flex items-center justify-between py-10 group px-6 hover:bg-slate-50/30 transition-all ${selJ.includes(job.id) ? 'bg-teal-50/30' : ''}`}>
                <div className="flex items-center gap-8">
                  <input 
                    type="checkbox" 
                    checked={selJ.includes(job.id)} 
                    onChange={()=>toggleJ(job.id)}
                    className="w-5 h-5 accent-teal-600 cursor-pointer"
                  />
                  <div className="text-teal-600 opacity-40 group-hover:opacity-100 transition-all"><FaBriefcase size={24}/></div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{job.title}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1.5">ID: #JOB-{job.id} • Posted on {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-16">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900">{job.stats.total}</p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Applications</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <button onClick={()=>setSelectedJob(job)} className="text-sm font-bold text-teal-600 uppercase tracking-widest border-b-2 border-transparent hover:border-teal-600 pb-2 transition-all">Analytics</button>
                    <button onClick={()=>deleteJob(job.id)} className="text-sm font-bold text-red-500 uppercase tracking-widest border-b-2 border-transparent hover:border-red-500 pb-2 transition-all">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const filteredManagers = managers.filter(m => 
    m.username.toLowerCase().includes(mSearch.toLowerCase()) || 
    (m.organization_name && m.organization_name.toLowerCase().includes(mSearch.toLowerCase()))
  );

  return(
    <AdminLayout>
      <div className="max-w-7xl mx-auto font-plus bg-white min-h-screen p-12">
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-8 gap-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recruiter Directory</h1>
            <p className="text-slate-500 text-sm mt-2 font-bold">System-wide monitoring of hiring manager productivity</p>
          </div>
          <div className="flex flex-col md:items-end gap-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search position or skills..." 
                value={mSearch} 
                onChange={(e)=>setMSearch(e.target.value)}
                className="bg-white border border-slate-200 px-12 py-3.5 rounded-[20px] text-sm font-bold w-full md:w-[440px] focus:outline-none focus:border-teal-500 shadow-sm placeholder:text-slate-400 placeholder:font-bold transition-all"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {selM.length > 0 && (
                <button onClick={bulkDeleteManagers} className="bg-red-50 text-red-600 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-all">
                  Delete Selected ({selM.length})
                </button>
              )}
              <div className="text-teal-600 font-bold text-xs uppercase tracking-[3px] border-l-2 border-teal-500 pl-6">
                {filteredManagers.length} Matches
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-[80px_1fr_1fr_1fr] px-6 py-4 text-sm font-bold text-slate-400 uppercase tracking-[2px]">
            <div className="flex justify-center">
              <input 
                type="checkbox" 
                onChange={(e)=>{
                  if(e.target.checked) setSelM(filteredManagers.map(m=>m.id));
                  else setSelM([]);
                }}
                checked={selM.length === filteredManagers.length && filteredManagers.length > 0}
                className="w-4 h-4 accent-teal-600"
              />
            </div>
            <div>Full Profile</div>
            <div className="text-center">Account Status</div>
            <div className="text-right">Management</div>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredManagers.length===0 && <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No managers found matching "{mSearch}".</div>}
            {filteredManagers.map(m=>(
              <div key={m.id} className={`grid grid-cols-[80px_1fr_1fr_1fr] items-center py-10 px-6 hover:bg-slate-50/50 transition-all group ${selM.includes(m.id) ? 'bg-teal-50/30' : ''}`}>
                <div className="flex justify-center">
                  <input 
                    type="checkbox" 
                    checked={selM.includes(m.id)} 
                    onChange={()=>toggleM(m.id)}
                    className="w-5 h-5 accent-teal-600 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-6 cursor-pointer" onClick={()=>fetchDetails(m.id)}>
                  <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-lg border border-slate-100 group-hover:bg-white group-hover:text-teal-600 group-hover:border-teal-100 transition-all">
                    {m.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-900 group-hover:text-teal-600 transition-colors">{m.username}</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">{m.organization_name || m.email}</p>
                  </div>
                </div>
                <div className="text-center">
                  <span className={`text-sm font-bold uppercase tracking-widest ${m.is_approved?"text-teal-600":"text-amber-600"}`}>
                    {m.is_approved?"Verified Profile":"Pending Approval"}
                  </span>
                </div>
                <div className="text-right space-x-8">
                  {!m.is_approved && (
                    <button onClick={()=>approveManager(m.id)} className="text-sm font-bold text-teal-600 uppercase tracking-widest hover:underline">Approve</button>
                  )}
                  <button onClick={()=>fetchDetails(m.id)} className="text-sm font-bold text-slate-900 uppercase tracking-widest hover:text-teal-600 transition-colors">Details</button>
                  <button onClick={()=>deleteManager(m.id)} className="text-sm font-bold text-red-500 uppercase tracking-widest hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
