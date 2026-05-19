import {useEffect,useState} from "react";
import {useNavigate,Link} from "react-router-dom";
import api from "../../api";
import UserLayout from "../../layouts/UserLayout";
import {FaSearch,FaClock,FaCheckCircle,FaFilePdf,FaFilter,FaTimes} from "react-icons/fa";

export default function BrowseJobs(){
  const navigate=useNavigate();
  const[jobs,setJobs]=useState([]);
  const[applied,setApplied]=useState([]);
  const[loading,setLoading]=useState(true);
  const[query,setQuery]=useState("");
  const[sortBy,setSortBy]=useState("newest");
  const[selectedLocations,setSelectedLocations]=useState([]);
  const[selectedSkills,setSelectedSkills]=useState([]);
  const[selectedWorkModes,setSelectedWorkModes]=useState([]);
  const[selectedJobTypes,setSelectedJobTypes]=useState([]);
  const[selectedCompanies,setSelectedCompanies]=useState([]);
  const[selectedExperience,setSelectedExperience]=useState([]);
  const[filterApplied,setFilterApplied]=useState("all");
  const[showFilters,setShowFilters]=useState(false);
  const[resumes,setResumes]=useState([]);
  const[selectedResumeId,setSelectedResumeId]=useState(null);
  const[selectedJobId,setSelectedJobId]=useState(null);
  const[showModal,setShowModal]=useState(false);
  const[currentStep,setCurrentStep]=useState(1);
  const[answers,setAnswers]=useState({});
  const[jobQuestions,setJobQuestions]=useState([]);
  const token=sessionStorage.getItem("token");
  const fetchJobs=async()=>{
    try{
      if(!token)return;
      const res=await api.get("/api/jobs/all/",{headers:{Authorization:`Bearer ${token}`}});
      setJobs(res.data);
    }catch(err){}
  };
  const fetchApplied=async()=>{
    try{
      const res=await api.get("/api/applications/user/",{headers:{Authorization:`Bearer ${token}`}});
      setApplied(res.data.map(a=>a.job_id));
    }catch(err){}
  };
  const fetchResumes=async()=>{
    try{
      const res=await api.get(`/api/profile/resumes/?t=${Date.now()}`,{headers:{Authorization:`Bearer ${token}`}});
      const docs = res.data || [];
      const resumeList = docs.filter(r => r.type?.toLowerCase() === "resume");
      setResumes(resumeList);
      if(resumeList.length>0){setSelectedResumeId(resumeList[0].id);}
    }catch(err){}
  };
  const handleApplyClick=async(id)=>{
    setSelectedJobId(id);
    setShowModal(true);
    setCurrentStep(1);
    setAnswers({});
    try{
      const res=await api.get(`/api/jobs/questions/${id}/`);
      setJobQuestions(res.data);
    }catch(err){}
  };
  const finalizeApply=async()=>{
    if(!selectedResumeId){return alert("Please select or upload a resume in your profile first.");}
    for(let i=0;i<jobQuestions.length;i++){
      const q=jobQuestions[i];
      if(!answers[q.id]){return alert("Please answer all screening questions.");}
    }
    try{
      await api.post("/api/applications/apply/",{job_id:selectedJobId,resume_id:selectedResumeId,screening_answers:jobQuestions.map(q=>({question:q.question,answer:answers[q.id]}))},{headers:{Authorization:`Bearer ${token}`}});
      setApplied(p=>[...p,selectedJobId]);
      setShowModal(false);
    }catch(err){alert(err.response?.data?.error||"Apply failed");}
  };
  useEffect(()=>{
    const init=async()=>{
      await Promise.all([fetchJobs(),fetchApplied(),fetchResumes()]);
      setLoading(false);
    };
    init();
  },[]);
  const getCounts=(field)=>{
    const counts={};
    jobs.forEach(j=>{
      const val=j[field];
      if(val){
        if(field==="skills"){
          val.split(",").forEach(s=>{
            const trimS=s.trim();
            counts[trimS]=(counts[trimS]||0)+1;
          });
        }else{counts[val]=(counts[val]||0)+1;}
      }
    });
    return counts;
  };
  const handleFilterChange=(setter,selectedList,value)=>{
    if(selectedList.includes(value)){setter(selectedList.filter(v=>v!==value));}else{setter([...selectedList,value]);}
  };
  const staticRanges=[
    {label:"0-1 Years",min:0,max:1},
    {label:"1-2 Years",min:1,max:2},
    {label:"2-4 Years",min:2,max:4},
    {label:"4-5 Years",min:4,max:5},
    {label:"5+ Years",min:5,max:99}
  ];
  const parseNumbers=(str)=>{
    const matches=str.match(/\d+/g);
    return matches?matches.map(Number):[];
  };
  const filteredJobs=jobs.filter(j=>{
    const matchesQuery=!query||j.title.toLowerCase().includes(query.toLowerCase())||j.skills.toLowerCase().includes(query.toLowerCase());
    const matchesLocation=selectedLocations.length===0||selectedLocations.includes(j.location);
    const matchesSkill=selectedSkills.length===0||selectedSkills.some(s=>j.skills.includes(s));
    const matchesWorkMode=selectedWorkModes.length===0||selectedWorkModes.includes(j.work_mode);
    const matchesJobType=selectedJobTypes.length===0||selectedJobTypes.includes(j.job_type);
    const matchesCompany=selectedCompanies.length===0||selectedCompanies.includes(j.company);
    const numbers=parseNumbers(j.experience_level||"");
    let min=0,max=0;
    if(numbers.length===1){
      min=numbers[0];
      max=(j.experience_level&&j.experience_level.includes("+"))?99:min;
    }else if(numbers.length===2){
      min=numbers[0];
      max=numbers[1];
    }
    const matchesExperience=selectedExperience.length===0||selectedExperience.some(rangeLabel=>{
      const r=staticRanges.find(sr=>sr.label===rangeLabel);
      const overlapMin=Math.max(min,r.min);
      const overlapMax=Math.min(max,r.max);
      return overlapMin<=overlapMax;
    });
    const matchesApplied=filterApplied==="all"||(filterApplied==="applied"&&applied.some(id=>Number(id)===Number(j.id)))||(filterApplied==="not_applied"&&!applied.some(id=>Number(id)===Number(j.id)));
    return matchesQuery&&matchesLocation&&matchesSkill&&matchesWorkMode&&matchesJobType&&matchesCompany&&matchesExperience&&matchesApplied;
  }).sort((a,b)=>sortBy==="newest"?new Date(b.created_at)-new Date(a.created_at):new Date(a.created_at)-new Date(b.created_at));
  const locations=getCounts("location");
  const skills=getCounts("skills");
  const companies=getCounts("company");
  const workModes=getCounts("work_mode");
  const jobTypes=getCounts("job_type");
  const appStatusCounts={
    all:jobs.length,
    applied:jobs.filter(j=>applied.includes(j.id)).length,
    not_applied:jobs.filter(j=>!applied.includes(j.id)).length
  };
  const experiences={};
  staticRanges.forEach(r=>{experiences[r.label]=0;});
  jobs.forEach(j=>{
    const numbers=parseNumbers(j.experience_level||"");
    let min=0,max=0;
    if(numbers.length===1){
      min=numbers[0];
      max=(j.experience_level&&j.experience_level.includes("+"))?99:min;
    }else if(numbers.length===2){
      min=numbers[0];
      max=numbers[1];
    }
    staticRanges.forEach(r=>{
      const overlapMin=Math.max(min,r.min);
      const overlapMax=Math.min(max,r.max);
      if(overlapMin<=overlapMax){experiences[r.label]++;}
    });
  });
  return(
    <UserLayout>
      <div className="min-h-screen text-slate-900 font-['Inter']">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-['Plus_Jakarta_Sans'] text-slate-900">Explore Opportunities</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Find your next professional milestone</p>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:min-w-[400px]">
              <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400"/>
              <input className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 shadow-sm text-base font-medium transition" placeholder="Search position or skills..." value={query} onChange={e=>setQuery(e.target.value)}/>
            </div>
            <button onClick={()=>setShowFilters(!showFilters)} className="p-3.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm flex items-center justify-center text-slate-600">
              <FaFilter/>
            </button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className={`w-full lg:w-1/4 space-y-6 sticky top-4 self-start ${showFilters?'block':'hidden'}`}>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">All Filters</h2>
                <button onClick={()=>{setSelectedLocations([]);setSelectedSkills([]);setSelectedWorkModes([]);setSelectedJobTypes([]);setSelectedCompanies([]);setSelectedExperience([]);setFilterApplied("all");setSortBy("newest");setQuery("");}} className="text-xs font-bold text-teal-600 hover:text-teal-700">Clear All</button>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort By</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="sort" checked={sortBy==="newest"} onChange={()=>setSortBy("newest")} className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300"/>
                    <span className="text-sm font-medium text-slate-700">Latest Jobs</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="sort" checked={sortBy==="oldest"} onChange={()=>setSortBy("oldest")} className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300"/>
                    <span className="text-sm font-medium text-slate-700">Jobs Posted Earlier</span>
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Application Status</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="applied" checked={filterApplied==="all"} onChange={()=>setFilterApplied("all")} className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300"/>
                      <span className="text-sm font-medium text-slate-700">All Jobs</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">({appStatusCounts.all})</span>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="applied" checked={filterApplied==="applied"} onChange={()=>setFilterApplied("applied")} className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300"/>
                      <span className="text-sm font-medium text-slate-700">Applied</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">({appStatusCounts.applied})</span>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="applied" checked={filterApplied==="not_applied"} onChange={()=>setFilterApplied("not_applied")} className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300"/>
                      <span className="text-sm font-medium text-slate-700">Not Applied</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">({appStatusCounts.not_applied})</span>
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Work Mode</h3>
                <div className="space-y-2">
                  {["on-site","remote","hybrid"].map(mode=>(
                    <label key={mode} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedWorkModes.includes(mode)} onChange={()=>handleFilterChange(setSelectedWorkModes,selectedWorkModes,mode)} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300"/>
                        <span className="text-sm font-medium text-slate-700 capitalize">{mode}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">({workModes[mode]||0})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Type</h3>
                <div className="space-y-2">
                  {["full-time","internship"].map(type=>(
                    <label key={type} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedJobTypes.includes(type)} onChange={()=>handleFilterChange(setSelectedJobTypes,selectedJobTypes,type)} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300"/>
                        <span className="text-sm font-medium text-slate-700 capitalize">{type}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">({jobTypes[type]||0})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {Object.entries(locations).map(([loc,count])=>(
                    <label key={loc} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedLocations.includes(loc)} onChange={()=>handleFilterChange(setSelectedLocations,selectedLocations,loc)} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300"/>
                        <span className="text-sm font-medium text-slate-700">{loc}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">({count})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {Object.entries(companies).map(([comp,count])=>(
                    <label key={comp} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedCompanies.includes(comp)} onChange={()=>handleFilterChange(setSelectedCompanies,selectedCompanies,comp)} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300"/>
                        <span className="text-sm font-medium text-slate-700">{comp}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">({count})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Experience Level</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {Object.entries(experiences).map(([exp,count])=>(
                    <label key={exp} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedExperience.includes(exp)} onChange={()=>handleFilterChange(setSelectedExperience,selectedExperience,exp)} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300"/>
                        <span className="text-sm font-medium text-slate-700">{exp}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">({count})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={`w-full ${showFilters?'lg:w-3/4':'lg:w-full'}`}>
            {loading?(
              <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div></div>
            ):(
              <div className={`grid gap-6 ${showFilters ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
                {filteredJobs.map(j=>(
                  <div key={j.id} className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-teal-300 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-teal-600 font-bold text-lg border border-slate-100 group-hover:bg-primary group-hover:text-white transition-colors">{j.company?j.company[0].toUpperCase():"J"}</div>
                      <div className="flex flex-col items-end">
                        {applied.some(id=>Number(id)===Number(j.id))&&(<span className="text-teal-600 font-bold text-xs flex items-center gap-1 mb-1"><FaCheckCircle/>Applied</span>)}
                        <span className="text-teal-600 font-bold text-sm">{j.salary}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Annually</span>
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight group-hover:text-teal-600 transition-colors">{j.title}</h2>
                    <p className="text-xs text-slate-500 font-medium mb-4">Posted by <Link to={`/company/${j.created_by_id}`} className="font-bold text-slate-700 hover:text-teal-600 transition-colors underline decoration-slate-200">{j.company||"N/A"}</Link></p>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed font-medium">{j.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md uppercase tracking-wider">{j.work_mode}</span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md uppercase tracking-wider">{j.job_type}</span>
                      {j.experience_level&&(<span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md uppercase tracking-wider">{j.experience_level}</span>)}
                      {j.location&&(<span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md uppercase tracking-wider">{j.location}</span>)}
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider"><FaClock className="text-teal-500"/>Posted {new Date(j.created_at).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider ml-auto"><FaClock/>Deadline {new Date(j.deadline).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-1.5 mb-6">
                      {j.skills?j.skills.split(',').slice(0,3).map((s,i)=>(<span key={i} className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md uppercase tracking-wider">{s.trim()}</span>)):null}
                    </div>
                    <button onClick={()=>navigate(`/user/job/${j.id}`)} className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 bg-primary text-white hover:bg-secondary shadow-lg">View Details</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
