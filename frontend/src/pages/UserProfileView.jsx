// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api, { API_URL } from "../api";
// import { FaUser, FaGraduationCap, FaBriefcase, FaCheckCircle, FaProjectDiagram, FaEnvelope, FaMapMarkerAlt, FaArrowLeft, FaPhone, FaLinkedin, FaGithub, FaGlobe, FaAward } from "react-icons/fa";

// export default function UserProfileView() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const token = sessionStorage.getItem("token");

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const res = await api.get(`/api/user-profile/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
//         setProfile(res.data);
//       } catch (err) { alert("Failed to load profile"); }
//       finally { setLoading(false); }
//     };
//     fetchProfile();
//   }, [id, token]);

//   if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent"></div></div>;
//   if (!profile) return <div className="text-center py-20 font-bold text-slate-500">Profile not found</div>;

//   const labelC = "text-[11px] font-semibold text-slate-500 mb-1 block uppercase tracking-wider";
  
//   const sectionHeader = (title, icon) => (
//     <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-8">
//       <span className="text-teal-600 text-base">{icon}</span>
//       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
//     </div>
//   );

//   const infoRow = (label, value) => (
//     <div className="py-2">
//       <p className={labelC}>{label}</p>
//       <p className="text-sm font-bold text-slate-900">{value || "Not provided"}</p>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-white py-10 px-8">
//       <div className="max-w-6xl mx-auto">
//         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold text-[10px] uppercase tracking-widest transition-all mb-12"><FaArrowLeft /> Back</button>
        
//         <div className="flex flex-col md:flex-row gap-12 border-b border-slate-50 pb-12 mb-12 items-center md:items-start">
//           <div className="w-32 h-32 rounded-2xl bg-slate-50 border border-slate-100 p-1 shrink-0 overflow-hidden">
//             <img src={profile.photo ? `${API_URL}${profile.photo}` : "https://via.placeholder.com/150"} className="w-full h-full object-cover rounded-xl" alt="Profile" />
//           </div>
//           <div className="flex-1 text-center md:text-left">
//             <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
//             <p className="text-teal-600 font-bold text-base mt-1 uppercase tracking-wider">{profile.headline || "Professional Candidate"}</p>
//             <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
//               <span className="flex items-center gap-2"><FaEnvelope className="text-teal-500" size={12}/> {profile.email}</span>
//               {profile.phone && <span className="flex items-center gap-2"><FaPhone className="text-teal-500" size={12}/> {profile.phone}</span>}
//               {profile.personal_info?.city && <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-teal-500" size={12}/> {profile.personal_info.city}, {profile.personal_info.country}</span>}
//             </div>
//             <div className="flex justify-center md:justify-start gap-3 mt-6">
//               {profile.social_links?.linkedin && <a href={profile.social_links.linkedin} target="_blank" rel="noreferrer" className="w-9 h-9 border border-slate-100 rounded-lg flex items-center justify-center text-slate-300 hover:text-[#0A66C2] hover:border-[#0A66C2] transition-all"><FaLinkedin size={16} /></a>}
//               {profile.social_links?.github && <a href={profile.social_links.github} target="_blank" rel="noreferrer" className="w-9 h-9 border border-slate-100 rounded-lg flex items-center justify-center text-slate-300 hover:text-[#181717] hover:border-[#181717] transition-all"><FaGithub size={16} /></a>}
//               {profile.social_links?.portfolio && <a href={profile.social_links.portfolio} target="_blank" rel="noreferrer" className="w-9 h-9 border border-slate-100 rounded-lg flex items-center justify-center text-slate-300 hover:text-teal-600 hover:border-teal-600 transition-all"><FaGlobe size={16} /></a>}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16">
//           <div className="space-y-12">
//             <div>
//               {sectionHeader("Professional Summary", <FaUser />)}
//               <p className="text-slate-600 text-sm leading-relaxed font-medium">{profile.summary || "No professional summary provided."}</p>
//             </div>

//             <div>
//               {sectionHeader("Experience", <FaBriefcase />)}
//               <div className="space-y-10">
//                 {profile.experiences?.length > 0 ? profile.experiences.map((exp, i) => (
//                   <div key={i} className="relative pl-10 border-l-2 border-slate-50">
//                     <div className="absolute w-3 h-3 bg-teal-500 rounded-full -left-[7px] top-1 ring-4 ring-white"></div>
//                     <div className="flex justify-between items-start mb-3">
//                       <div>
//                         <h4 className="text-lg font-black text-slate-900">{exp.role}</h4>
//                         <p className="text-teal-600 font-bold text-sm mt-0.5 uppercase tracking-wider">{exp.company}</p>
//                       </div>
//                       <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-md">{exp.start} — {exp.is_current ? "Present" : exp.end}</span>
//                     </div>
//                     <p className="text-slate-500 text-sm font-medium leading-relaxed">{exp.desc}</p>
//                   </div>
//                 )) : <p className="text-slate-400 text-sm font-bold italic">No professional experience listed</p>}
//               </div>
//             </div>

//             <div>
//               {sectionHeader("Academic Background", <FaGraduationCap />)}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//                 {profile.education?.length > 0 ? profile.education.filter(e => e.institution).map((edu, i) => (
//                   <div key={i}>
//                     <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1">{edu.category}</p>
//                     <h4 className="text-base font-black text-slate-900">{edu.institution}</h4>
//                     <p className="text-sm font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{edu.board}</p>
//                     <div className="flex gap-3 mt-3">
//                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-md">Year: {edu.year}</span>
//                       <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-2.5 py-1 rounded-md">Score: {edu.score}</span>
//                     </div>
//                   </div>
//                 )) : <p className="text-slate-400 text-sm font-bold italic">No education provided</p>}
//               </div>
//             </div>

//             <div>
//               {sectionHeader("Featured Projects", <FaProjectDiagram />)}
//               <div className="space-y-10">
//                 {profile.projects?.length > 0 ? profile.projects.map((p, i) => (
//                   <div key={i} className="border-b border-slate-50 pb-10 last:border-0">
//                     <div className="flex justify-between items-center mb-3">
//                       <h4 className="text-xl font-black text-slate-900 hover:text-teal-600 transition-all">{p.title}</h4>
//                       {p.url && <a href={p.url} className="text-teal-500 text-[10px] font-black uppercase tracking-widest hover:underline" target="_blank" rel="noreferrer">View Live</a>}
//                     </div>
//                     <p className="text-slate-500 text-sm font-medium leading-relaxed">{p.desc}</p>
//                   </div>
//                 )) : <p className="text-slate-400 text-sm font-bold italic text-center py-6">No projects found</p>}
//               </div>
//             </div>
//           </div>

//           <div className="space-y-12">
//             <div className="space-y-8 border-l border-slate-50 pl-10">
//               <div>
//                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-6">Details</h3>
//                 <div className="space-y-6">
//                   {infoRow("Identifier", `#USR-${id}`)}
//                   {infoRow("Level", profile.experiences?.length > 0 ? "Experienced" : "Fresher")}
//                   {infoRow("Gender", profile.personal_info?.gender)}
//                   {infoRow("Nationality", profile.personal_info?.nationality)}
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-6">Tech Stack</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {profile.skills?.technical?.map((s, i) => (
//                     <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-800 rounded-lg text-[10px] font-bold border border-slate-100">{s.name}</span>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-6">Soft Skills</h3>
//                 <div className="space-y-3">
//                   {profile.skills?.soft?.map((s, i) => (
//                     <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600">
//                       <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
//                       {s.name}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {profile.certifications?.length > 0 && (
//                 <div>
//                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-6">Awards</h3>
//                   <div className="space-y-6">
//                     {profile.certifications.map((cert, i) => (
//                       <div key={i} className="flex gap-3 items-start">
//                         <FaAward className="text-amber-500 shrink-0" size={16} />
//                         <div>
//                           <p className="text-xs font-bold text-slate-900">{cert.title}</p>
//                           <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">{cert.issuer}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import{useEffect,useState}from"react";
import{useParams,useNavigate}from"react-router-dom";
import api,{API_URL}from"../api";

import{
FaUser,
FaGraduationCap,
FaBriefcase,
FaProjectDiagram,
FaEnvelope,
FaMapMarkerAlt,
FaArrowLeft,
FaPhone,
FaLinkedin,
FaGithub,
FaGlobe,
FaCheckCircle,
FaCalendarAlt,
FaIdBadge
}from"react-icons/fa";

export default function UserProfileView(){

const{id}=useParams();
const navigate=useNavigate();

const[profile,setProfile]=useState(null);
const[loading,setLoading]=useState(true);

const token=sessionStorage.getItem("token");

useEffect(()=>{

    const fetchProfile=async()=>{

        try{

            const res=await api.get(`/api/user-profile/${id}/`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            });

            setProfile(res.data);

        }catch(err){

            alert("Failed to load profile");

        }finally{

            setLoading(false);

        }
    };

    fetchProfile();

},[id,token]);

if(loading){

    return(
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-[3px] border-teal-500 border-t-transparent animate-spin"></div>
        </div>
    );
}

if(!profile){

    return(
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-semibold text-lg">
            Profile not found
        </div>
    );
}

const sectionHeader=(title,icon)=>(
    <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
        <span className="text-teal-600 text-[14px]">{icon}</span>

        <h2 className="text-[17px] font-bold text-slate-800">
            {title}
        </h2>
    </div>
);

const infoItem=(label,value)=>(
    <div>
        <p className="text-[10px] uppercase tracking-[1px] text-slate-400 font-semibold mb-1">
            {label}
        </p>

        <p className="text-[15px] font-semibold text-slate-800">
            {value || "Not Provided"}
        </p>
    </div>
);

return(

<div className="min-h-screen bg-slate-50 px-6 md:px-10 py-6">

    <div className="max-w-[1600px] mx-auto">

        <button
            onClick={()=>navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-teal-600 text-sm font-semibold mb-7 transition-all"
        >
            <FaArrowLeft/>
            Back
        </button>

        <div className="pb-8 border-b border-slate-200">

            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8">

                <div className="flex gap-7">

                    <div className="w-32 h-32 rounded-[22px] overflow-hidden border border-slate-200 bg-slate-100 shrink-0">

                        <img
                            src={
                                profile.photo
                                ?`${API_URL}${profile.photo}`
                                :"https://via.placeholder.com/200"
                            }
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />

                    </div>

                    <div>

                        <h1 className="text-[56px] leading-[58px] font-extrabold text-slate-900">
                            {profile.name}
                        </h1>

                        <p className="text-[28px] text-teal-600 font-semibold mt-2">
                            {profile.headline || "Professional Candidate"}
                        </p>

                        <div className="flex flex-wrap gap-6 mt-6 text-[15px] text-slate-600 font-medium">

                            <div className="flex items-center gap-2">
                                <FaEnvelope className="text-teal-500"/>
                                {profile.email}
                            </div>

                            {profile.phone&&(

                                <div className="flex items-center gap-2">
                                    <FaPhone className="text-teal-500"/>
                                    {profile.phone}
                                </div>

                            )}

                            {profile.personal_info?.city&&(

                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-teal-500"/>
                                    {profile.personal_info.city},{" "}
                                    {profile.personal_info.country}
                                </div>

                            )}

                        </div>

                        <div className="flex items-center gap-3 mt-6">

                            {profile.social_links?.linkedin&&(

                                <a
                                    href={profile.social_links.linkedin}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-500 transition-all"
                                >
                                    <FaLinkedin size={16}/>
                                </a>

                            )}

                            {profile.social_links?.github&&(

                                <a
                                    href={profile.social_links.github}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-500 transition-all"
                                >
                                    <FaGithub size={16}/>
                                </a>

                            )}

                            {profile.social_links?.portfolio&&(

                                <a
                                    href={profile.social_links.portfolio}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-500 transition-all"
                                >
                                    <FaGlobe size={16}/>
                                </a>

                            )}

                        </div>

                    </div>

                </div>

                <div className="xl:text-right">

                    <div className="flex items-center gap-2 xl:justify-end text-teal-600 mb-2">
                        <FaIdBadge size={14}/>
                        <span className="text-[11px] uppercase tracking-[1px] font-semibold">
                            User Identifier
                        </span>
                    </div>

                    <p className="text-[18px] font-bold text-slate-900">
                        #USR-{id}
                    </p>

                </div>

            </div>

        </div>

        <div className="py-10 space-y-14">

            <div>

                {sectionHeader("Professional Summary",<FaUser/>)}

                <p className="text-[15px] leading-8 text-slate-600 font-medium max-w-6xl">
                    {profile.summary || "No professional summary provided."}
                </p>

            </div>

            <div>

                {sectionHeader("Basic Information",<FaUser/>)}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-16 gap-y-10">

                    {infoItem("Full Name",profile.name)}

                    {infoItem("Gender",profile.personal_info?.gender)}

                    {infoItem("Date Of Birth",profile.personal_info?.dob)}

                    {infoItem("Nationality",profile.personal_info?.nationality)}

                    {infoItem("Email Address",profile.email)}

                    {infoItem("Phone Number",profile.phone)}

                    {infoItem("City",profile.personal_info?.city)}

                    {infoItem("Country",profile.personal_info?.country)}

                </div>

            </div>

            <div>

                {sectionHeader("Academic Background",<FaGraduationCap/>)}

                <div className="space-y-8">

                    {profile.education?.length>0
                    ?profile.education
                    .filter(e=>e.institution)
                    .map((edu,i)=>(

                        <div
                            key={i}
                            className="grid grid-cols-1 xl:grid-cols-[320px_1fr_180px] gap-10 border-b border-slate-200 pb-8"
                        >

                            <div>

                                <p className="text-[10px] uppercase tracking-[1px] text-teal-600 font-semibold mb-2">
                                    {edu.category}
                                </p>

                                <h3 className="text-[22px] leading-8 font-bold text-slate-900">
                                    {edu.institution}
                                </h3>

                                <p className="text-[15px] text-slate-500 font-medium mt-1">
                                    {edu.board}
                                </p>

                            </div>

                            <div className="flex items-center">

                                <p className="text-[15px] leading-8 text-slate-600 font-medium">
                                    Academic qualification completed successfully with consistent performance and strong educational background.
                                </p>

                            </div>

                            <div className="xl:text-right space-y-2">

                                <div>
                                    <p className="text-[10px] uppercase tracking-[1px] text-slate-400 font-semibold mb-1">
                                        Year
                                    </p>

                                    <p className="text-[15px] font-semibold text-slate-800">
                                        {edu.year}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase tracking-[1px] text-slate-400 font-semibold mb-1">
                                        Score
                                    </p>

                                    <p className="text-[15px] font-semibold text-teal-600">
                                        {edu.score}
                                    </p>
                                </div>

                            </div>

                        </div>

                    ))
                    :(
                        <p className="text-sm text-slate-400 font-medium">
                            No education provided
                        </p>
                    )}

                </div>

            </div>

            <div>

                {sectionHeader("Professional Experience",<FaBriefcase/>)}

                <div className="space-y-8">

                    {profile.experiences?.length>0
                    ?profile.experiences.map((exp,i)=>(

                        <div
                            key={i}
                            className="grid grid-cols-1 xl:grid-cols-[320px_1fr_220px] gap-10 border-b border-slate-200 pb-8"
                        >

                            <div>

                                <h3 className="text-[22px] font-bold text-slate-900">
                                    {exp.role}
                                </h3>

                                <p className="text-teal-600 text-[15px] font-semibold mt-1">
                                    {exp.company}
                                </p>

                            </div>

                            <div>

                                <p className="text-[15px] leading-8 text-slate-600 font-medium">
                                    {exp.desc}
                                </p>

                            </div>

                            <div className="xl:text-right">

                                <div className="inline-flex items-center gap-2">

                                    <FaCalendarAlt className="text-slate-400 text-[12px]"/>

                                    <span className="text-[13px] font-semibold text-slate-600">
                                        {exp.start} - {exp.is_current ? "Present" : exp.end}
                                    </span>

                                </div>

                            </div>

                        </div>

                    ))
                    :(
                        <p className="text-sm text-slate-400 font-medium">
                            No professional experience listed
                        </p>
                    )}

                </div>

            </div>

            <div>

                {sectionHeader("Skills & Expertise",<FaCheckCircle/>)}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">

                    <div>

                        <h3 className="text-[16px] font-bold text-slate-800 mb-5">
                            Technical Skills
                        </h3>

                        <div className="flex flex-wrap gap-3">

                            {profile.skills?.technical?.length>0
                            ?profile.skills.technical.map((skill,i)=>(

                                <span
                                    key={i}
                                    className="text-[13px] font-semibold text-teal-700 border border-teal-100 bg-teal-50 px-3 py-1.5 rounded-xl"
                                >
                                    {skill.name}
                                </span>

                            ))
                            :(
                                <p className="text-sm text-slate-400">
                                    No technical skills
                                </p>
                            )}

                        </div>

                    </div>

                    <div>

                        <h3 className="text-[16px] font-bold text-slate-800 mb-5">
                            Soft Skills
                        </h3>

                        <div className="space-y-4">

                            {profile.skills?.soft?.length>0
                            ?profile.skills.soft.map((skill,i)=>(

                                <div
                                    key={i}
                                    className="flex items-center gap-3 text-[15px] font-medium text-slate-700"
                                >

                                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>

                                    {skill.name}

                                </div>

                            ))
                            :(
                                <p className="text-sm text-slate-400">
                                    No soft skills
                                </p>
                            )}

                        </div>

                    </div>

                </div>

            </div>

            <div>

                {sectionHeader("Projects",<FaProjectDiagram/>)}

                <div className="space-y-8">

                    {profile.projects?.length>0
                    ?profile.projects.map((project,i)=>(

                        <div
                            key={i}
                            className="grid grid-cols-1 xl:grid-cols-[320px_1fr_180px] gap-10 border-b border-slate-200 pb-8"
                        >

                            <div>

                                <h3 className="text-[20px] font-bold text-slate-900">
                                    {project.title}
                                </h3>

                            </div>

                            <div>

                                <p className="text-[15px] leading-8 text-slate-600 font-medium">
                                    {project.desc}
                                </p>

                            </div>

                            <div className="xl:text-right">

                                {project.url&&(

                                    <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-teal-600 text-[14px] font-semibold hover:underline"
                                    >
                                        View Project
                                    </a>

                                )}

                            </div>

                        </div>

                    ))
                    :(
                        <p className="text-sm text-slate-400 font-medium">
                            No projects found
                        </p>
                    )}

                </div>

            </div>

        </div>

    </div>

</div>

);

}