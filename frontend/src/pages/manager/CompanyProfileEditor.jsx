import {useState,useEffect} from "react";
import api, { API_URL } from "../../api";
import ManagerLayout from "../../layouts/ManagerLayout";
import {FaBuilding,FaGlobe,FaMapMarkerAlt,FaPlus,FaTrashAlt,FaImage} from "react-icons/fa";
export default function CompanyProfileEditor(){
  const[form,setForm]=useState({
    name: "",
    website: "",
    location: "",
    industry: "",
    size: "",
    description: "",
    culture: ""
  });
  const[benefits,setBenefits]=useState([]);
  const[newBenefit,setNewBenefit]=useState("");
  const[media,setMedia]=useState([]);
  const[newMedia,setNewMedia]=useState("");
  const[logoFile,setLogoFile]=useState(null);
  const[previewLogo,setPreviewLogo]=useState("");
  const[loading,setLoading]=useState(false);
  const token=sessionStorage.getItem("token");
  useEffect(()=>{
    const fetchCompany=async()=>{
      try{
        const res=await api.get("/api/company/profile/",{headers:{Authorization:`Bearer ${token}`}});
        const data=res.data;
        setForm({
          name: data.name||"",
          website: data.website||"",
          location: data.location||"",
          industry: data.industry||"",
          size: data.size||"",
          description: data.description||"",
          culture: data.culture||""
        });
        setBenefits(data.benefits||[]);
        setMedia(data.media||[]);
        if(data.logo){
          setPreviewLogo(`${API_URL}${data.logo}`);
        }
      }catch(err){
        console.log(err);
      }
    };
    fetchCompany();
  },[]);
  const handleLogoChange=(e)=>{
    const file=e.target.files[0];
    if(file){
      setLogoFile(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };
  const handleAddBenefit=()=>{
    const val=newBenefit.trim();
    if(val&&!benefits.includes(val)){
      setBenefits([...benefits,val]);
    }
    setNewBenefit("");
  };
  const handleAddMedia=()=>{
    const val=newMedia.trim();
    if(val&&!media.includes(val)){
      setMedia([...media,val]);
    }
    setNewMedia("");
  };
  const handleSave=async(e)=>{
    e.preventDefault();
    setLoading(true);
    try{
      const fd=new FormData();
      fd.append("name",form.name);
      fd.append("website",form.website);
      fd.append("location",form.location);
      fd.append("industry",form.industry);
      fd.append("size",form.size);
      fd.append("description",form.description);
      fd.append("culture",form.culture);
      fd.append("benefits",JSON.stringify(benefits));
      fd.append("media",JSON.stringify(media));
      if(logoFile){
        fd.append("logo",logoFile);
      }
      const res=await api.put("/api/company/profile/",fd,{
        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type":"multipart/form-data"
        }
      });
      alert("Company Profile updated successfully!");
      if(res.data.logo){
        setPreviewLogo(`${API_URL}${res.data.logo}`);
      }
    }catch(err){
      alert("Failed to update profile.");
    }finally{
      setLoading(false);
    }
  };
  return(
    <ManagerLayout>
      <div className="max-w-5xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">Company Identity Settings</h1>
          <p className="text-slate-500 font-bold text-xs mt-2 uppercase tracking-widest">Construct and customize your team's employer brand</p>
        </div>
        <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Corporate Identity Logo</p>
              <div className="relative group w-32 h-32 mb-6">
                <div className="w-full h-full bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center font-black overflow-hidden shadow-sm">
                  {previewLogo?(
                    <img src={previewLogo} alt="Logo" className="w-full h-full object-cover"/>
                  ):(
                    <FaBuilding className="text-slate-300 text-4xl"/>
                  )}
                </div>
                <label className="absolute inset-0 bg-slate-900/60 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300">
                  <FaImage size={20} className="mb-2"/>
                  <span className="text-[10px] font-black uppercase tracking-wider">Upload PNG</span>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden"/>
                </label>
              </div>
              <h3 className="font-bold text-slate-800 text-base font-['Plus_Jakarta_Sans']">{form.name||"Your Organization"}</h3>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{form.industry||"Industry Type"}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Company Essentials</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600 text-xs font-bold">
                  <FaGlobe className="text-teal-500 w-4"/>
                  <span>{form.website||"No website listed"}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-xs font-bold">
                  <FaMapMarkerAlt className="text-teal-500 w-4"/>
                  <span>{form.location||"No location listed"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Brand Overview Profile</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Company Legal Name</label>
                  <input 
                    type="text"
                    required
                    value={form.name}
                    onChange={(e)=>setForm({...form,name:e.target.value})}
                    placeholder="e.g. Acme Tech Solutions"
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#2E8B87] transition font-bold text-slate-700 text-sm shadow-sm"/>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Official Website URL</label>
                  <input 
                    type="text"
                    value={form.website}
                    onChange={(e)=>setForm({...form,website:e.target.value})}
                    placeholder="e.g. https://acme.com"
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#2E8B87] transition font-bold text-slate-700 text-sm shadow-sm"/>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Headquarters Location</label>
                  <input 
                    type="text"
                    value={form.location}
                    onChange={(e)=>setForm({...form,location:e.target.value})}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#2E8B87] transition font-bold text-slate-700 text-sm shadow-sm"/>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Industry Classification</label>
                  <input 
                    type="text"
                    value={form.industry}
                    onChange={(e)=>setForm({...form,industry:e.target.value})}
                    placeholder="e.g. Software & SaaS"
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#2E8B87] transition font-bold text-slate-700 text-sm shadow-sm"/>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Staff Headcount Size</label>
                  <input 
                    type="text"
                    value={form.size}
                    onChange={(e)=>setForm({...form,size:e.target.value})}
                    placeholder="e.g. 100-250 Employees"
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#2E8B87] transition font-bold text-slate-700 text-sm shadow-sm"/>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">About the Organization</label>
                <textarea 
                  value={form.description}
                  onChange={(e)=>setForm({...form,description:e.target.value})}
                  placeholder="Outline your company's core mission, operations, and values..."
                  className="w-full min-h-[140px] p-5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2E8B87] text-sm text-slate-700 placeholder:text-slate-400 font-medium leading-relaxed resize-none shadow-sm font-sans"/>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Corporate Culture & Environment</label>
                <textarea 
                  value={form.culture}
                  onChange={(e)=>setForm({...form,culture:e.target.value})}
                  placeholder="Tell candidates about standard working methodologies, values, work-life balance, etc..."
                  className="w-full min-h-[140px] p-5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2E8B87] text-sm text-slate-700 placeholder:text-slate-400 font-medium leading-relaxed resize-none shadow-sm font-sans"
                />
              </div>
            </div>

            <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Team Benefits & Corporate Perks</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {benefits.map((b,idx)=>(
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-[#2E8B87] border border-teal-100 rounded-lg text-xs font-bold">
                    {b}
                    <button type="button" onClick={()=>setBenefits(benefits.filter((_,i)=>i!==idx))} className="text-[#2E8B87] hover:text-red-500 font-bold transition">×</button>
                  </span>
                ))}
                {benefits.length===0&&<p className="text-slate-400 text-xs italic font-bold">No benefits populated yet.</p>}
              </div>
              <div className="flex gap-3">
                <input 
                  type="text"
                  placeholder="e.g. Free Medical Insurance"
                  value={newBenefit}
                  onChange={(e)=>setNewBenefit(e.target.value)}
                  onKeyDown={(e)=>{
                    if(e.key==='Enter'){
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                  className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#2E8B87] transition font-bold text-slate-700 text-sm shadow-sm"
                />
                <button 
                  type="button" 
                  onClick={handleAddBenefit}
                  className="px-6 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-xs uppercase"
                >
                  <FaPlus/>
                </button>
              </div>
            </div>

            <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Cultural Media & Gallery Links</h3>
              <div className="space-y-4 mb-4">
                {media.map((m,idx)=>(
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-slate-600 text-xs font-bold truncate max-w-lg">{m}</span>
                    <button type="button" onClick={()=>setMedia(media.filter((_,i)=>i!==idx))} className="text-slate-400 hover:text-red-500 transition-colors">
                      <FaTrashAlt size={13}/>
                    </button>
                  </div>
                ))}
                {media.length===0&&<p className="text-slate-400 text-xs italic font-bold">No gallery assets loaded yet.</p>}
              </div>
              <div className="flex gap-3">
                <input 
                  type="text"
                  placeholder="Insert image asset URL..."
                  value={newMedia}
                  onChange={(e)=>setNewMedia(e.target.value)}
                  onKeyDown={(e)=>{
                    if(e.key==='Enter'){
                      e.preventDefault();
                      handleAddMedia();
                    }
                  }}
                  className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#2E8B87] transition font-bold text-slate-700 text-sm shadow-sm"/>
                <button 
                  type="button" 
                  onClick={handleAddMedia}
                  className="px-6 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-xs uppercase">
                  <FaPlus/>
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-[#2E8B87] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#236b68] transition shadow-md disabled:opacity-50">
                {loading?"Applying Changes...":"Commit Profile Updates"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ManagerLayout>
  );
}
