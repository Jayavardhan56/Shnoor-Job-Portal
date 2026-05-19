import {useState,useEffect} from "react";
import api from "../../api";
import ManagerLayout from "../../layouts/ManagerLayout";
import {FaRegFolder,FaRegCalendarAlt,FaArrowRight,FaPlus,FaTrashAlt,FaChevronDown} from "react-icons/fa";

export default function PostJob(){
  const[form,setForm]=useState({ 
    title: "", 
    description: "", 
    salary: "", 
    skills: "",
    location: "",
    work_mode: "on-site",
    experience_level: "",
    job_type: "full-time",
    scheduled_publish_at: ""
  });
  const token=sessionStorage.getItem("token");
  const[deadlineDays,setDeadlineDays]=useState(30);
  const[minAtsScore,setMinAtsScore]=useState(50);
  const[questions,setQuestions]=useState([]);
  const[drafts,setDrafts]=useState([]);
  const[scheduledJobs,setScheduledJobs]=useState([]);
  const[step,setStep]=useState(1);
  const[activeTab,setActiveTab]=useState("none");
  const[editingDraftId,setEditingDraftId]=useState(null);
  const[scheduleDate,setScheduleDate]=useState("");
  const[scheduleTime,setScheduleTime]=useState("");
  const[submitting,setSubmitting]=useState(false);
  
  const getMinDate=()=>{
    const now=new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  };

  const getCurrentTime=()=>{
    const now=new Date();
    return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  };

  const handleTimeChange=(e)=>{
    const time=e.target.value;
    if(scheduleDate===getMinDate()){
      const now=new Date();
      const[h,m]=time.split(":").map(Number);
      if(h<now.getHours() || (h===now.getHours() && m<now.getMinutes())){
        alert("Please select a future time!");
        setScheduleTime("");
        return;
      }
    }
    setScheduleTime(time);
  };
  
  const fetchDrafts=async()=>{
    try{
      const res=await api.get("/api/jobs/drafts/",{headers:{Authorization:`Bearer ${token}`}});
      setDrafts(res.data);
    }catch(err){}
  };

  const fetchScheduledJobs=async()=>{
    try{
      const res=await api.get("/api/jobs/scheduled/",{headers:{Authorization:`Bearer ${token}`}});
      setScheduledJobs(res.data);
    }catch(err){}
  };
  
  useEffect(()=>{fetchDrafts();fetchScheduledJobs();},[]);

  const handleDeleteDraft=async(id)=>{
    if(!window.confirm("Are you sure you want to delete this?"))return;
    try{
      await api.delete(`/api/jobs/${id}/`,{headers:{Authorization:`Bearer ${token}`}});
      fetchDrafts();
      fetchScheduledJobs();
    }catch(err){alert("Delete failed.");}
  };

  const loadDraft=(draft)=>{
    setEditingDraftId(draft.id);
    setForm({
      title: draft.title,
      description: draft.description,
      salary: draft.salary,
      skills: draft.skills,
      location: draft.location,
      work_mode: draft.work_mode,
      experience_level: draft.experience_level,
      job_type: draft.job_type,
      scheduled_publish_at: draft.scheduled_publish_at || ""
    });
    setQuestions(draft.questions || []);
    setActiveTab("none");
  };

  const handleSubmit=async(isDraft=false)=>{
    if(!form.title||!form.description||!form.salary||!form.skills){return alert("Please fill all required fields");}
    const scheduled_publish_at=scheduleDate&&scheduleTime?`${scheduleDate}T${scheduleTime}`:"";
    if(scheduled_publish_at){
      const sched=new Date(scheduled_publish_at);
      if(sched<=new Date()){return alert("Scheduled date and time must be in the future!");}
    }
    setSubmitting(true);
    try{
      await api.post("/api/jobs/create/",{...form,scheduled_publish_at:scheduled_publish_at?new Date(scheduled_publish_at).toISOString():"",is_draft:isDraft,deadline_days:deadlineDays,min_ats_score:minAtsScore,questions:questions},{headers:{Authorization:`Bearer ${token}`}});
      if(editingDraftId){
        await api.delete(`/api/jobs/${editingDraftId}/`,{headers:{Authorization:`Bearer ${token}`}});
        setEditingDraftId(null);
      }
      alert(isDraft?"Draft Saved Successfully!":scheduled_publish_at&&new Date(scheduled_publish_at)>new Date()?"Job Scheduled Successfully!":"Job Published Successfully!");
      setForm({title:"",description:"",salary:"",skills:"",location:"",work_mode:"on-site",experience_level:"",job_type:"full-time",scheduled_publish_at:""});
      setScheduleDate("");
      setScheduleTime("");
      setQuestions([]);
      setStep(1);
      fetchDrafts();
      fetchScheduledJobs();
    }catch(err){alert("Posting failed. Please check your connection.");}
    finally{setSubmitting(false);}
  };

  return(
    <ManagerLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">Post a New Role</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Define your hiring requirements and start sourcing elite talent.</p>
          </div>
          
          <div className="flex gap-3">
            <button onClick={()=>setActiveTab(activeTab==="drafts"?"none":"drafts")} className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab==="drafts"?"bg-[#2E8B87] text-white shadow-md":"bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
              <FaRegFolder size={14}/>
              <span>DRAFTS ({drafts.length})</span>
            </button>
            <button onClick={()=>setActiveTab(activeTab==="scheduled"?"none":"scheduled")} className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab==="scheduled"?"bg-[#2E8B87] text-white shadow-md":"bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
              <FaRegCalendarAlt size={14}/>
              <span>SCHEDULED ({scheduledJobs.length})</span>
            </button>
          </div>
        </div>

        {activeTab==="drafts"&&(
          <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Saved Drafts</h2>
            {drafts.length===0?(
              <p className="text-sm text-slate-500 font-medium">No draft jobs saved yet.</p>
            ):(
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drafts.map(d=>(
                  <div key={d.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-900 cursor-pointer transition-all flex justify-between items-center" onClick={()=>loadDraft(d)}>
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{d.title}</p>
                      <p className="text-xs text-slate-500">{d.location || "No Location"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900 uppercase">Edit</span>
                      <button onClick={(e)=>{e.stopPropagation();handleDeleteDraft(d.id);}} className="text-slate-400 hover:text-red-500 transition-colors">
                        <FaTrashAlt size={14}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab==="scheduled"&&(
          <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Scheduled Jobs</h2>
            {scheduledJobs.length===0?(
              <p className="text-sm text-slate-500 font-medium">No scheduled jobs yet.</p>
            ):(
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheduledJobs.map(d=>(
                  <div key={d.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-900 cursor-pointer transition-all flex justify-between items-center" onClick={()=>loadDraft(d)}>
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{d.title}</p>
                      <p className="text-xs text-slate-500">Starts: {new Date(d.scheduled_publish_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900 uppercase">Edit</span>
                      <button onClick={(e)=>{e.stopPropagation();handleDeleteDraft(d.id);}} className="text-slate-400 hover:text-red-500 transition-colors">
                        <FaTrashAlt size={14}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-center gap-10 px-10 pt-8 pb-6 border-b border-slate-100">
            <div className={`flex items-center gap-3 ${step===1?"text-[#2E8B87]":"text-slate-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step===1?"bg-[#2E8B87] text-white":"bg-slate-100 text-slate-400"}`}>1</div>
              <span className="font-bold text-sm uppercase tracking-wider">Job Details</span>
            </div>
            <div className="w-20 border-t border-slate-200"></div>
            <div className={`flex items-center gap-3 ${step===2?"text-[#2E8B87]":"text-slate-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step===2?"bg-[#2E8B87] text-white":"bg-slate-100 text-slate-400"}`}>2</div>
              <span className="font-bold text-sm uppercase tracking-wider">Screening Logic</span>
            </div>
          </div>

          {step===1&&(
            <div className="p-10 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Job Title*</label>
                  <input className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition font-medium text-slate-700 text-base" placeholder="e.g. Senior Backend Engineer" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Salary Package*</label>
                  <input className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition font-medium text-slate-700 text-base" placeholder="e.g. ₹15L - ₹20L per annum" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Location</label>
                  <input className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition font-medium text-slate-700 text-base" placeholder="e.g. Remote, Mumbai, etc." value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Experience Level</label>
                  <input className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition font-medium text-slate-700 text-base" placeholder="e.g. Entry, 2+ Years, etc." value={form.experience_level} onChange={e => setForm({ ...form, experience_level: e.target.value })} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Work Mode</label>
                  <div className="relative">
                    <select className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition font-bold text-slate-700 text-base cursor-pointer appearance-none" value={form.work_mode} onChange={e => setForm({ ...form, work_mode: e.target.value })}>
                      <option value="on-site">On-site</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                      <FaChevronDown size={12} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Job Type</label>
                  <div className="relative">
                    <select className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition font-bold text-slate-700 text-base cursor-pointer appearance-none" value={form.job_type} onChange={e => setForm({ ...form, job_type: e.target.value })}>
                      <option value="full-time">Full-time</option>
                      <option value="internship">Internship</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                      <FaChevronDown size={12} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Core Skills (Tags)*</label>
                <input className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition font-medium text-slate-700 text-base" placeholder="e.g. React, Python, Docker (comma separated)" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Detailed Description*</label>
                <textarea className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition min-h-[150px] font-medium text-slate-700 text-base leading-relaxed" placeholder="Outline the responsibilities, perks, and expectations..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Deadline (Days)</label>
                  <input type="number" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition text-base font-bold text-slate-700" value={deadlineDays} onChange={e => setDeadlineDays(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Schedule Publish (Optional)</label>
                  <div className="flex gap-3">
                    <input type="date" min={getMinDate()} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition text-base font-bold text-slate-700" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                    <input type="time" min={scheduleDate===getMinDate()?getCurrentTime():""} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition text-base font-bold text-slate-700" value={scheduleTime} onChange={handleTimeChange} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Min ATS Match (%)</label>
                <input type="number" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition text-base font-bold text-slate-700" value={minAtsScore} onChange={e => setMinAtsScore(e.target.value)} />
              </div>

              <div className="pt-4 flex justify-end">
                <button onClick={()=>setStep(2)} className="px-8 py-4 bg-[#2E8B87] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-2">
                  <span>Continue to Questions</span>
                  <FaArrowRight size={12}/>
                </button>
              </div>
            </div>
          )}

          {step===2&&(
            <div className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">Screening Logic</h2>
                  <p className="text-sm text-slate-500 font-medium">Define automated questions to filter candidate suitability.</p>
                </div>
                <button onClick={()=>setQuestions([...questions,{question:"",question_type:"mcq",options:["",""],expected_answer:""}])} className="px-6 py-3 bg-[#2E8B87] text-white rounded-xl text-xs font-bold tracking-wider shadow-md uppercase flex items-center gap-2">
                  <FaPlus size={12}/>
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-6">
                {questions.map((q,index)=>(
                  <div key={index} className="border border-slate-200 rounded-xl p-6 bg-slate-50 relative">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {index+1}</h3>
                      <button onClick={()=>{const updated=[...questions];updated.splice(index,1);setQuestions(updated);}} className="text-red-500 text-xs font-bold uppercase tracking-wider hover:text-red-700 flex items-center gap-1">
                        <FaTrashAlt size={12}/>
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Question Content</label>
                        <input className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition text-base font-medium" value={q.question} onChange={(e)=>{const updated=[...questions];updated[index].question=e.target.value;setQuestions(updated);}} placeholder="e.g. Do you have experience with AWS?" />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Input Type</label>
                          <div className="relative">
                            <select value={q.question_type} onChange={(e)=>{const updated=[...questions];updated[index].question_type=e.target.value;if(e.target.value==="textarea"){updated[index].options=[];}else{updated[index].options=["",""];}setQuestions(updated);}} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-base cursor-pointer appearance-none">
                              <option value="mcq">Multiple Choice</option>
                              <option value="textarea">Text Answer</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                              <FaChevronDown size={12} />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Expected Answer</label>
                          {q.question_type==="mcq"?(
                            <div className="relative">
                              <select value={q.expected_answer} onChange={(e)=>{const updated=[...questions];updated[index].expected_answer=e.target.value;setQuestions(updated);}} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-teal-600 text-base cursor-pointer appearance-none">
                                <option value="">Select Correct Option</option>
                                {q.options.map((opt,i)=>(<option key={i} value={opt}>{opt||`Option ${i+1}`}</option>))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-teal-600">
                                <FaChevronDown size={12} />
                              </div>
                            </div>
                          ):(
                            <input className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition font-bold text-teal-600 text-base" placeholder="Keywords to match..." value={q.expected_answer} onChange={(e)=>{const updated=[...questions];updated[index].expected_answer=e.target.value;setQuestions(updated);}} />
                          )}
                        </div>
                      </div>

                      {q.question_type==="mcq"&&(
                        <div className="space-y-3 pt-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Define Options</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt,optIndex)=>(
                              <div key={optIndex} className="flex gap-2">
                                <input className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm font-medium" placeholder={`Option ${optIndex+1}`} value={opt} onChange={(e)=>{const updated=[...questions];updated[index].options[optIndex]=e.target.value;setQuestions(updated);}} />
                                <button onClick={()=>{const updated=[...questions];updated[index].options.splice(optIndex,1);setQuestions(updated);}} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl font-bold flex items-center justify-center hover:bg-red-100">×</button>
                              </div>
                            ))}
                          </div>
                          <button onClick={()=>{const updated=[...questions];updated[index].options.push("");setQuestions(updated);}} className="text-teal-600 text-xs font-bold uppercase tracking-wider hover:text-teal-700 mt-1 inline-block">+ Add Option</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 flex justify-between items-center border-t border-slate-100">
                <button onClick={()=>setStep(1)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition">Back to Details</button>
                <div className="flex gap-3">
                  <button onClick={()=>handleSubmit(true)} disabled={submitting} className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition disabled:opacity-50">{submitting ? "Saving..." : "Save as Draft"}</button>
                  <button onClick={()=>handleSubmit(false)} disabled={submitting} className="px-8 py-3 bg-[#2E8B87] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md disabled:opacity-50">{submitting ? "Publishing..." : "Publish Role"}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ManagerLayout>
  );}
