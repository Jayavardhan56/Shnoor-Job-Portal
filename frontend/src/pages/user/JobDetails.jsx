import {useState,useEffect} from "react";
import {useParams,useNavigate,Link} from "react-router-dom";
import api from "../../api";
import UserLayout from "../../layouts/UserLayout";
import {FaClock,FaCheckCircle,FaArrowLeft,FaFilePdf,FaBriefcase,FaMapMarkerAlt,FaRupeeSign} from "react-icons/fa";
export default function JobDetails(){
  const {id}=useParams();
  const navigate=useNavigate();
  const[job,setJob]=useState(null);
  const[questions,setQuestions]=useState([]);
  const[resumes,setResumes]=useState([]);
  const[loading,setLoading]=useState(true);
  const[applied,setApplied]=useState(false);
  const[showModal,setShowModal]=useState(false);
  const[currentStep,setCurrentStep]=useState(1);
  const[selectedResumeId,setSelectedResumeId]=useState(null);
  const[answers,setAnswers]=useState({});
  const[submitting,setSubmitting]=useState(false);
  const token=sessionStorage.getItem("token");
  useEffect(()=>{
    const fetchData=async()=>{
      try{
        const jobRes=await api.get(`/api/jobs/detail/${id}/`,{headers:{Authorization:`Bearer ${token}`}});
        setJob(jobRes.data);
        const qRes=await api.get(`/api/jobs/questions/${id}/`,{headers:{Authorization:`Bearer ${token}`}});
        setQuestions(qRes.data);
        const rRes=await api.get("/api/profile/resumes/",{headers:{Authorization:`Bearer ${token}`}});
        setResumes(rRes.data);
        const appRes=await api.get("/api/applications/user/",{headers:{Authorization:`Bearer ${token}`}});
        const isApplied=appRes.data.some(app=>Number(app.job_id)===Number(id));
        setApplied(isApplied);
        setLoading(false);
      }catch(err){setLoading(false);}
    };
    fetchData();
  },[id,token]);
  const handleApply=async()=>{
    if(!selectedResumeId){alert("Please select a resume");return;}
    if(submitting) return;
    const validQ=questions.filter(q=>q.question&&q.question.trim()!=="");
    const formattedAnswers=validQ.map(q=>({question:q.question,answer:answers[q.id]||"Not provided"}));
    setSubmitting(true);
    try{
      await api.post("/api/applications/apply/",{job_id:id,resume_id:selectedResumeId,screening_answers:formattedAnswers},{headers:{Authorization:`Bearer ${token}`}});
      alert("Application Submitted Successfully!");
      setApplied(true); setShowModal(false);
    }catch(err){alert(err.response?.data?.error||"Apply failed");}
    finally{setSubmitting(false);}
  };
  const validQuestions=questions.filter(q=>q.question&&q.question.trim()!=="");
  if(loading){return(<UserLayout><div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div></div></UserLayout>);}
  if(!job){return(<UserLayout><div className="text-center py-32"><p className="text-slate-500">Job not found.</p></div></UserLayout>);}
  return(
    <UserLayout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <button onClick={()=>navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-teal-600 font-bold text-sm mb-6 transition-colors"><FaArrowLeft/><span>Back to Jobs</span></button>
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm mb-6">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1 font-['Plus_Jakarta_Sans']">{job.title}</h1>
                <p className="text-sm font-medium text-slate-600">
                  {job.company ? (
                    <Link to={`/company/${job.created_by_id}`} className="hover:text-teal-600 transition-colors font-bold underline decoration-slate-200 hover:decoration-teal-400">
                      {job.company}
                    </Link>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 font-medium">
                <div className="flex items-center gap-2"><FaBriefcase className="text-slate-400"/><span>{job.experience_level||"Not specified"}</span></div>
                <div className="flex items-center gap-2"><FaRupeeSign className="text-slate-400"/><span>{job.salary} Annually</span></div>
                <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-slate-400"/><span>{job.location||"Remote"}</span></div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">{job.work_mode}</span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">{job.job_type}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-6">
              <div className="flex gap-3">
                {applied?(
                  <button disabled className="px-6 py-2.5 bg-primary text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2"><FaCheckCircle/>Applied</button>
                ):(
                  <button onClick={()=>setShowModal(true)} className="px-6 py-2.5 bg-primary text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-secondary transition-colors shadow-lg">Apply</button>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">Posted {new Date(job.created_at).toLocaleDateString()}</p>
              {job.deadline && <p className="text-xs text-red-500 font-bold mt-1">Deadline: {new Date(job.deadline).toLocaleDateString()}</p>}
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
          <div className="bg-slate-50 p-6 rounded-xl">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Job highlights</h2>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 font-medium">
              <li>Open for {job.experience_level||"any experience level"} candidates</li>
              <li>Work mode is {job.work_mode} in {job.location||"remote location"}</li>
              <li>Required skills: {job.skills}</li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Job description</h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{job.description}</p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Key Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills?job.skills.split(',').map((s,i)=>(<span key={i} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">{s.trim()}</span>)):null}
            </div>
          </div>
        </div>
        {showModal&&(
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
              {validQuestions.length>0&&(
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider ${currentStep===1?'bg-teal-600 text-white':'bg-slate-100 text-slate-500'}`}>1. Resume</div>
                  <div className="w-10 h-[2px] bg-slate-200"></div>
                  <div className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider ${currentStep===2?'bg-teal-600 text-white':'bg-slate-100 text-slate-500'}`}>2. Questions</div>
                </div>
              )}
              <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight font-['Plus_Jakarta_Sans']">{currentStep===1?'Select Resume':'Screening Questions'}</h2>
              {currentStep===1&&(
                <div className="space-y-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Choose a Resume</label>
                    {resumes.filter(r => r.type?.toLowerCase() === "resume").length === 0 ? (
                      <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center">
                        <p className="text-slate-400 text-sm mb-3">No resumes found in your profile.</p>
                        <button onClick={()=>navigate('/user/profile')} className="text-teal-600 font-bold text-xs uppercase hover:underline">Go to Profile to Upload</button>
                      </div>
                    ) : (
                      <div className="relative">
                        <select 
                          value={selectedResumeId||""} 
                          onChange={(e)=>setSelectedResumeId(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-700 outline-none focus:border-teal-500 appearance-none cursor-pointer shadow-sm"
                        >
                          <option value="">Select your resume...</option>
                          {resumes.filter(r => r.type?.toLowerCase() === "resume").map(r=>(
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedResumeId && (
                    <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl flex items-center gap-3">
                      <div className="p-2 bg-teal-600 text-white rounded-lg"><FaFilePdf size={14}/></div>
                      <div>
                        <p className="text-[10px] font-bold text-teal-600 uppercase">Selected Resume</p>
                        <p className="text-sm font-bold text-teal-900">{resumes.find(r => String(r.id) === String(selectedResumeId))?.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {currentStep===2&&(
                <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-2">
                  {validQuestions.map((q,index)=>(
                    <div key={q.id}>
                      <p className="text-sm font-bold text-slate-700 mb-2">{index+1}. {q.question}</p>
                      {q.question_type==="mcq"&&(
                        <select value={answers[q.id]||""} onChange={(e)=>{setAnswers({...answers,[q.id]:e.target.value})}} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-teal-500 text-sm font-medium">
                          <option value="">Select Option</option>
                          {q.options.map((opt,optIndex)=>(<option key={optIndex} value={opt}>{opt}</option>))}
                        </select>
                      )}
                      {q.question_type==="textarea"&&(
                        <textarea rows="3" value={answers[q.id]||""} onChange={(e)=>{setAnswers({...answers,[q.id]:e.target.value})}} placeholder="Enter your answer" className="w-full border border-slate-200 rounded-xl p-3 outline-none resize-none focus:border-teal-500 text-sm font-medium"/>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={()=>{if(currentStep===1){setShowModal(false);}else{setCurrentStep(1);}}} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest">Cancel</button>
                {currentStep===1?(
                  <button onClick={()=>{if(!selectedResumeId){return alert('Please select a Resume');}if(validQuestions.length>0){setCurrentStep(2);}else{handleApply();}}} disabled={submitting} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-teal-100 disabled:opacity-50">{validQuestions.length>0?'Next Step':submitting?'Submitting...':'Submit'}</button>
                ):(
                  <button onClick={handleApply} disabled={submitting} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-teal-100 disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit Application'}</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
