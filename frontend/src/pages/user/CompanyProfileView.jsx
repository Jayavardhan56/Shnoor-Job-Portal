import {useState,useEffect} from "react";
import {useParams,Link,useNavigate} from "react-router-dom";
import api, { API_URL } from "../../api";
import {FaBuilding,FaGlobe,FaMapMarkerAlt,FaBriefcase,FaUsers,FaArrowLeft} from "react-icons/fa";

export default function CompanyProfileView(){
  const{manager_id}=useParams();
  const navigate=useNavigate();
  const[company,setCompany]=useState(null);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(false);

  useEffect(()=>{
    const fetchCompanyPublic=async()=>{
      try{
        const res=await api.get(`/api/company/public/${manager_id}/`);
        setCompany(res.data);
      }catch(err){
        setError(true);
      }finally{
        setLoading(false);
      }
    };
    fetchCompanyPublic();
  },[manager_id]);

  if(loading){
    return(
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#2E8B87] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading corporate records...</p>
        </div>
      </div>
    );
  }

  if(error||!company){
    return(
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <FaBuilding className="text-slate-200 text-6xl mx-auto"/>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight font-['Plus_Jakarta_Sans']">Company Records Missing</h2>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">The requested employer profile is currently uncalibrated or unavailable.</p>
          <button onClick={()=>navigate(-1)} className="inline-block px-6 py-3 bg-[#2E8B87] hover:bg-[#236b68] text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-sm">Go Back</button>
        </div>
      </div>
    );
  }

  const formatUrl=(url)=>{
    if(!url)return "";
    if(url.startsWith("http://")||url.startsWith("https://"))return url;
    return `https://${url}`;
  };

  return(
    <div className="min-h-screen bg-white pb-24 text-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        <button 
          onClick={()=>navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-[#2E8B87] font-bold text-xs uppercase tracking-wider mb-10 transition-colors"
        >
          <FaArrowLeft size={10} />
          <span>Back</span>
        </button>

        <div className="flex flex-col md:flex-row items-start gap-8 pb-10 border-b border-slate-100 mb-12">
          <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
            {company.logo?(
              <img src={`${API_URL}${company.logo}`} alt="Logo" className="w-full h-full object-cover"/>
            ):(
              <FaBuilding className="text-slate-300 text-3xl"/>
            )}
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">{company.name}</h1>
            <p className="text-xs text-[#2E8B87] font-black uppercase tracking-widest">{company.industry||"Technology Enterprise"}</p>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-slate-500 text-xs font-bold">
              {company.website && (
                <a href={formatUrl(company.website)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#2E8B87] transition-colors">
                  <FaGlobe className="text-slate-400"/>
                  <span>{company.website}</span>
                </a>
              )}

              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-slate-400"/>
                <span>{company.location||"Remote"}</span>
              </span>
              <span className="flex items-center gap-2">
                <FaUsers className="text-slate-400"/>
                <span>{company.size||"Not specified"}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-['Plus_Jakarta_Sans']">About the Enterprise</h2>
              <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">{company.description||"This enterprise has not configured their organizational profile yet."}</p>
            </div>

            {company.culture && (
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-['Plus_Jakarta_Sans']">Corporate Culture</h2>
                <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">{company.culture}</p>
              </div>
            )}

            {company.media&&company.media.length>0&&(
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-['Plus_Jakarta_Sans']">Office & Culture Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {company.media.map((imgUrl,idx)=>(
                    <div key={idx} className="aspect-video rounded-xl bg-slate-50 border border-slate-200/60 overflow-hidden shadow-sm hover:scale-[1.01] transition-transform duration-300">
                      <img src={imgUrl} alt={`Culture ${idx+1}`} className="w-full h-full object-cover" onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"}}/>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-12">
            {company.benefits&&company.benefits.length>0&&(
              <div className="space-y-4">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-['Plus_Jakarta_Sans']">Employer Benefits</h2>
                <div className="flex flex-wrap gap-2">
                  {company.benefits.map((b,idx)=>(
                    <span key={idx} className="px-3 py-1.5 bg-teal-50/50 border border-teal-100/60 text-[#2E8B87] rounded-lg text-xs font-bold">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6 pt-6 border-t border-slate-100 lg:border-t-0 lg:pt-0">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-['Plus_Jakarta_Sans']">Open Opportunities ({company.open_jobs?.length||0})</h2>
              
              <div className="space-y-4">
                {company.open_jobs&&company.open_jobs.length>0?(
                  company.open_jobs.map(job=>(
                    <div key={job.id} className="p-5 border border-slate-100 rounded-xl hover:border-[#2E8B87] transition-all flex flex-col gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">{job.title}</h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-500 text-[10px] font-bold uppercase">
                          <span>{job.work_mode}</span>
                          <span>·</span>
                          <span>{job.location||"Remote"}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <span className="text-xs font-bold text-slate-900">{job.salary}</span>
                        <Link to={`/user/job/${job.id}`} className="text-xs font-black text-[#2E8B87] hover:underline uppercase tracking-wider">Details &rarr;</Link>
                      </div>
                    </div>
                  ))
                ):(
                  <div className="py-10 text-center text-slate-400">
                    <FaBriefcase className="text-slate-200 text-3xl mx-auto mb-3"/>
                    <p className="text-xs font-bold uppercase tracking-wider italic">No open roles posted</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
