import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import api, { API_URL } from "../../api";
import { FaUser, FaGraduationCap, FaBriefcase, FaCheckCircle, FaProjectDiagram, FaFileAlt, FaCog, FaChartBar, FaEnvelope, FaCamera, FaPlus, FaTrash, FaExternalLinkAlt, FaMapMarkerAlt, FaExclamationCircle, FaSave, FaTimes, FaEdit, FaCalendarAlt } from "react-icons/fa";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [otherDocs, setOtherDocs] = useState([]);
  const [activeTab, setActiveTab] = useState("Personal Details");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({});

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profile/");
      const d = res.data || {};
      setProfile(d);
      const skillsData = {
        technical: Array.isArray(d.skills?.technical) ? d.skills.technical : [],
        soft: Array.isArray(d.skills?.soft) ? d.skills.soft : []
      };
      const cats = ["10th / SSC", "Diploma / Inter", "Graduation", "Post Graduation"];
      const edu = cats.map(c => (d.education || []).find(e => e.category === c) || { category: c, institution: "", board: "", year: "", score: "", is_current: false });
      setEditForm({
        ...d,
        education: edu,
        experiences: d.experiences || [],
        projects: d.projects || [],
        skills: skillsData,
        social_links: d.social_links || {},
        personal_info: d.personal_info || {},
        password_requests: d.password_requests || []
      });
      const res2 = await api.get(`/api/profile/resumes/?t=${Date.now()}`);
      const allDocs = res2.data || [];
      setResumes(allDocs.filter(r => r.type?.toLowerCase() === "resume"));
      setCoverLetters(allDocs.filter(r => r.type?.toLowerCase() === "cover_letter"));
      setOtherDocs(allDocs.filter(r => r.type?.toLowerCase() === "other"));
    } catch (err) { }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(editForm).forEach(k => {
        if (k === 'photo') {
          if (editForm[k] instanceof File) fd.append('photo', editForm[k]);
          return;
        }
        if (typeof editForm[k] === 'object') fd.append(k, JSON.stringify(editForm[k]));
        else fd.append(k, editForm[k] || "");
      });
      await api.post("/api/profile/update/", fd);
      setIsEditing(false);
      fetchProfile();
      alert("Changes saved successfully");
    } catch (err) { alert("Save failed. Please try again."); } finally { setLoading(false); }
  };

  const handleTabChange = (newTab) => {
    if (isEditing) {
      const confirmed = window.confirm("You have unsaved changes in this section. Do you want to discard them and switch tabs?");
      if (!confirmed) return;
      setIsEditing(false);
      setEditForm({ ...profile });
    }
    setActiveTab(newTab);
  };

  const tabs = [
    { name: "Personal Details", icon: <FaUser /> },
    { name: "Education", icon: <FaGraduationCap /> },
    { name: "Experience", icon: <FaBriefcase /> },
    { name: "Skills", icon: <FaCheckCircle /> },
    { name: "Projects", icon: <FaProjectDiagram /> },
    { name: "Documents", icon: <FaFileAlt /> },
    { name: "Settings", icon: <FaCog /> }
  ];

  const inputC = "w-full px-4 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 outline-none focus:border-teal-500 transition-all";
  const labelC = "text-xs font-semibold text-slate-500 mb-1 block uppercase tracking-wider";
  const infoRow = (label, value) => (
    <div className="py-2">
      <p className={labelC}>{label}</p>
      <p className={`text-sm font-medium ${value ? 'text-slate-900' : 'text-slate-400'}`}>{value || "Not provided"}</p>
    </div>
  );

  const sectionHeader = (title) => (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-4 mb-8">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <button onClick={() => { setIsEditing(false); setEditForm({ ...profile }); }} className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded transition-all"><FaTimes /> Discard</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-[#14B8A6] text-white rounded hover:bg-[#0D9488] transition-all shadow-sm"><FaSave /> {loading ? "Saving..." : "Save Changes"}</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-teal-600 hover:bg-teal-50 rounded transition-all border border-teal-100"><FaEdit /> Edit Section</button>
        )}
      </div>
    </div>
  );

  const emptyState = (text) => (
    <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
      <FaExclamationCircle size={32} className="opacity-20" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );

  if (!profile) return null;

  return (
    <UserLayout>
      <div className="w-full min-h-[calc(100vh-73px)] bg-white flex flex-col font-sans">
        <div className="px-4 md:px-8 py-4 md:py-6 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
            <p className="text-sm text-slate-500">Manage your professional information and documents</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1">
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-white p-4 flex flex-col shrink-0">
            <div className="px-4 py-3 mb-4 md:mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Profile Strength</span>
                <span className="text-xs font-bold text-teal-600">{profile.ats_score || 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${profile.ats_score || 0}%` }}></div>
              </div>
            </div>
            <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1 md:gap-0 md:space-y-1 scrollbar-none">
              {tabs.map(t => (
                <button
                  key={t.name}
                  onClick={() => handleTabChange(t.name)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded transition-all whitespace-nowrap shrink-0 ${activeTab === t.name ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"} w-auto md:w-full`}
                >
                  <span className={activeTab === t.name ? "text-teal-600" : "text-slate-400"}>{t.icon}</span>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-4 md:p-10 max-w-5xl">
            {activeTab === "Personal Details" && (
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-8 pb-10 border-b border-slate-200">
                  <div className="w-24 h-24 rounded border border-slate-200 p-1 relative group shrink-0">
                    <img src={isEditing && editForm.previewUrl ? editForm.previewUrl : (profile.photo ? `${API_URL}${profile.photo}` : "https://via.placeholder.com/150")} className="w-full h-full object-cover rounded" />
                    {isEditing && (
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded">
                        <FaCamera className="text-white text-xl" />
                        <input type="file" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) { setEditForm({ ...editForm, photo: f, previewUrl: URL.createObjectURL(f) }); } }} />
                      </label>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-start gap-4">
                      <div className="flex-1 w-full mr-0 sm:mr-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{profile.first_name || "New User"}</h2>
                        {isEditing ? (
                          <input className={`${inputC} mt-2 text-teal-600 font-semibold border-teal-100`} placeholder="Professional Headline" value={editForm.headline || ""} onChange={e => setEditForm({ ...editForm, headline: e.target.value })} />
                        ) : (
                          <p className={`font-semibold mt-1 ${profile.headline ? 'text-teal-600' : 'text-slate-400'}`}>{profile.headline || "No headline provided"}</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {isEditing ? (
                          <>
                            <button onClick={() => { setIsEditing(false); setEditForm({ ...profile }); }} className="p-2 text-slate-400 hover:text-slate-600 transition-all"><FaTimes size={18} /></button>
                            <button onClick={handleSave} className="p-2 text-teal-600 hover:text-teal-700 transition-all"><FaSave size={18} /></button>
                          </>
                        ) : (
                          <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-teal-600 transition-all"><FaEdit size={18} /></button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 mt-3 text-sm text-slate-500 font-medium">
                      <span>@{profile.name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1.5"><FaEnvelope className="text-slate-400" /> {profile.email}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
                  <div className="col-span-1 md:col-span-2"><h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Basic Information</h3></div>
                  {isEditing ? (
                    <>
                      <div className="col-span-1"><label className={labelC}>Full Name</label><input className={inputC} value={editForm.first_name || ""} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} /></div>
                      <div className="col-span-1"><label className={labelC}>Gender</label><select className={inputC} value={editForm.personal_info?.gender || ""} onChange={e => setEditForm({ ...editForm, personal_info: { ...editForm.personal_info, gender: e.target.value } })}><option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option></select></div>
                      <div className="col-span-1"><label className={labelC}>Birthday</label><input type="date" className={inputC} value={editForm.personal_info?.dob || ""} onChange={e => setEditForm({ ...editForm, personal_info: { ...editForm.personal_info, dob: e.target.value } })} /></div>
                      <div className="col-span-1"><label className={labelC}>Nationality</label><input className={inputC} value={editForm.personal_info?.nationality || ""} onChange={e => setEditForm({ ...editForm, personal_info: { ...editForm.personal_info, nationality: e.target.value } })} /></div>
                      <div className="col-span-1 md:col-span-2"><label className={labelC}>Professional Summary</label><textarea className={`${inputC} h-32 py-4`} value={editForm.summary || ""} onChange={e => setEditForm({ ...editForm, summary: e.target.value })} placeholder="Briefly describe your professional journey and key expertise..." /></div>
                    </>
                  ) : (
                    <>
                      {infoRow("Full Name", profile.first_name)}
                      {infoRow("Gender", profile.personal_info?.gender)}
                      {infoRow("Birthday", profile.personal_info?.dob)}
                      {infoRow("Nationality", profile.personal_info?.nationality)}
                      <div className="col-span-1 md:col-span-2">{infoRow("Professional Summary", profile.summary)}</div>
                    </>
                  )}

                  <div className="col-span-1 md:col-span-2 mt-8"><h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Contact & Location</h3></div>
                  {isEditing ? (
                    <>
                      <div className="col-span-1 md:col-span-2"><label className={labelC}>Address</label><input className={inputC} value={editForm.personal_info?.address || ""} onChange={e => setEditForm({ ...editForm, personal_info: { ...editForm.personal_info, address: e.target.value } })} /></div>
                      <div className="col-span-1"><label className={labelC}>City</label><input className={inputC} value={editForm.personal_info?.city || ""} onChange={e => setEditForm({ ...editForm, personal_info: { ...editForm.personal_info, city: e.target.value } })} /></div>
                      <div className="col-span-1"><label className={labelC}>Country</label><input className={inputC} value={editForm.personal_info?.country || ""} onChange={e => setEditForm({ ...editForm, personal_info: { ...editForm.personal_info, country: e.target.value } })} /></div>
                    </>
                  ) : (
                    <>
                      <div className="col-span-1 md:col-span-2">{infoRow("Address", profile.personal_info?.address)}</div>
                      {infoRow("City", profile.personal_info?.city)}
                      {infoRow("Country", profile.personal_info?.country)}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Experience" && (
              <div className="space-y-8">
                {sectionHeader("Work Experience")}
                <div className="space-y-12">
                  {isEditing && <button onClick={() => { const n = [...editForm.experiences]; n.push({ is_current: false }); setEditForm({ ...editForm, experiences: n }); }} className="text-teal-600 text-sm font-bold flex items-center gap-1 hover:underline mb-6"><FaPlus size={12} /> Add New Experience</button>}
                  {((isEditing ? editForm.experiences : profile.experiences) || []).length > 0 ? ((isEditing ? editForm.experiences : profile.experiences || [])).map((exp, i) => (
                    <div key={i} className="relative border-l-2 border-slate-100 pl-4 sm:pl-8 ml-1 sm:ml-2 group">
                      {isEditing ? (
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50/50 p-6 rounded-lg border border-slate-100">
                          <button onClick={() => { const n = [...editForm.experiences]; n.splice(i, 1); setEditForm({ ...editForm, experiences: n }); }} className="absolute -top-2 -right-2 bg-white p-1.5 border border-slate-200 text-red-400 hover:text-red-600 rounded-full shadow-sm z-10 transition-all"><FaTrash size={12} /></button>
                          <div className="col-span-1"><label className={labelC}>Role / Designation</label><input className={inputC} value={exp.role || ""} onChange={e => { const n = [...editForm.experiences]; n[i].role = e.target.value; setEditForm({ ...editForm, experiences: n }) }} /></div>
                          <div className="col-span-1"><label className={labelC}>Company Name</label><input className={inputC} value={exp.company || ""} onChange={e => { const n = [...editForm.experiences]; n[i].company = e.target.value; setEditForm({ ...editForm, experiences: n }) }} /></div>
                          <div className="col-span-1 md:col-span-2 flex items-center gap-3 py-1">
                            <input type="checkbox" id={`exp_curr_${i}`} checked={exp.is_current} onChange={e => { const n = [...editForm.experiences]; n[i].is_current = e.target.checked; setEditForm({ ...editForm, experiences: n }) }} className="w-4 h-4 accent-teal-600" />
                            <label htmlFor={`exp_curr_${i}`} className="text-xs font-bold text-slate-700 uppercase cursor-pointer">I am currently working here</label>
                          </div>
                          <div className="col-span-1"><label className={labelC}>Start Date</label><input type="date" className={inputC} value={exp.start || ""} onChange={e => { const n = [...editForm.experiences]; n[i].start = e.target.value; setEditForm({ ...editForm, experiences: n }) }} /></div>
                          {!exp.is_current && <div className="col-span-1"><label className={labelC}>End Date</label><input type="date" className={inputC} value={exp.end || ""} onChange={e => { const n = [...editForm.experiences]; n[i].end = e.target.value; setEditForm({ ...editForm, experiences: n }) }} /></div>}
                          <div className="col-span-1 md:col-span-2"><label className={labelC}>Role Description</label><textarea className={`${inputC} h-24`} value={exp.desc || ""} onChange={e => { const n = [...editForm.experiences]; n[i].desc = e.target.value; setEditForm({ ...editForm, experiences: n }) }} /></div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{exp.role}</h4>
                          <div className="flex items-center gap-2 text-sm font-semibold text-teal-600 mt-1">
                            <span>{exp.company}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1.5 text-slate-500 font-medium text-xs"><FaCalendarAlt size={12} className="text-slate-400" /> {exp.start} — {exp.is_current ? "Present" : exp.end}</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-4 leading-relaxed whitespace-pre-wrap max-w-2xl">{exp.desc}</p>
                        </div>
                      )}
                    </div>
                  )) : emptyState("No work experience provided.")}
                </div>
              </div>
            )}

            {activeTab === "Education" && (
              <div className="space-y-8">
                {sectionHeader("Academic History")}
                <div className="space-y-12">
                  {((isEditing ? editForm.education : profile.education) || []).some(e => e.institution || isEditing) ? ((isEditing ? editForm.education : profile.education || [])).map((edu, i) => (
                    edu.institution || isEditing ? (
                      <div key={i} className="border-l-2 border-slate-100 pl-4 sm:pl-8 ml-1 sm:ml-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] mb-3">{edu.category}</p>
                        {isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50/50 p-6 rounded-lg border border-slate-100">
                            <div className="col-span-1 md:col-span-2"><label className={labelC}>Institution / University</label><input className={inputC} value={edu.institution || ""} onChange={e => { const n = [...editForm.education]; n[i].institution = e.target.value; setEditForm({ ...editForm, education: n }) }} /></div>
                            <div className="col-span-1"><label className={labelC}>Board / Field of Study</label><input className={inputC} value={edu.board || ""} onChange={e => { const n = [...editForm.education]; n[i].board = e.target.value; setEditForm({ ...editForm, education: n }) }} /></div>
                            <div className="col-span-1"><label className={labelC}>Score / CGPA</label><input className={inputC} value={edu.score || ""} onChange={e => { const n = [...editForm.education]; n[i].score = e.target.value; setEditForm({ ...editForm, education: n }) }} /></div>
                            <div className="col-span-1 md:col-span-2 flex items-center gap-3 py-1">
                              <input type="checkbox" id={`edu_curr_${i}`} checked={edu.is_current} onChange={e => { const n = [...editForm.education]; n[i].is_current = e.target.checked; setEditForm({ ...editForm, education: n }) }} className="w-4 h-4 accent-teal-600" />
                              <label htmlFor={`edu_curr_${i}`} className="text-xs font-bold text-slate-700 uppercase cursor-pointer">I am currently studying here</label>
                            </div>
                            <div className="col-span-1"><label className={labelC}>{edu.is_current ? "Batch Start Year" : "Year of Completion"}</label><input className={inputC} value={edu.year || ""} onChange={e => { const n = [...editForm.education]; n[i].year = e.target.value; setEditForm({ ...editForm, education: n }) }} /></div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-base font-bold text-slate-900">{edu.institution}</h4>
                            <p className="text-sm text-slate-600 font-semibold mt-1">{edu.board}</p>
                            <p className="text-xs font-bold text-slate-500 mt-2 flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px]">YEAR: {edu.is_current ? "Ongoing (Present)" : edu.year}</span>
                              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-[10px]">SCORE: {edu.score}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    ) : null
                  )) : emptyState("No academic history provided.")}
                </div>
              </div>
            )}

            {activeTab === "Skills" && (
              <div className="space-y-10">
                {sectionHeader("Expertise")}
                {((isEditing ? editForm.skills?.technical : profile.skills?.technical) || []).length === 0 && ((isEditing ? editForm.skills?.soft : profile.skills?.soft) || []).length === 0 && !isEditing ? (
                  emptyState("No skills added yet.")
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Technical</h4>
                        {isEditing && <button onClick={() => { const n = { ...editForm.skills }; n.technical = [...(n.technical || []), { name: "", level: "Beginner" }]; setEditForm({ ...editForm, skills: n }) }} className="text-teal-600 text-xs font-bold flex items-center gap-1"><FaPlus size={10} /> Add</button>}
                      </div>
                      <div className="space-y-4">
                        {(isEditing ? (editForm.skills?.technical || []) : (profile.skills?.technical || [])).map((s, i) => (
                          <div key={i} className="space-y-2">
                            {isEditing ? (
                              <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <label className="text-[10px] font-bold text-slate-400">Skill</label>
                                  <input className={inputC} value={s.name || ""} onChange={e => { const n = { ...editForm.skills }; n.technical[i] = { ...n.technical[i], name: e.target.value }; setEditForm({ ...editForm, skills: n }) }} />
                                </div>
                                <div className="w-28">
                                  <label className="text-[10px] font-bold text-slate-400">Level</label>
                                  <select className={inputC} value={s.level || "Beginner"} onChange={e => { const n = { ...editForm.skills }; n.technical[i] = { ...n.technical[i], level: e.target.value }; setEditForm({ ...editForm, skills: n }) }}>
                                    <option>Beginner</option><option>Intermediate</option><option>Expert</option><option>Advanced</option>
                                  </select>
                                </div>
                                <button onClick={() => { const n = { ...editForm.skills }; n.technical.splice(i, 1); setEditForm({ ...editForm, skills: n }) }} className="text-red-400 hover:text-red-600 pb-2"><FaTrash size={14} /></button>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center px-3 py-1.5 bg-slate-50 rounded border border-slate-200">
                                <span className="text-xs font-bold text-slate-700">{s.name}</span>
                                <span className="text-[10px] font-bold text-teal-600 uppercase">{s.level}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Soft Skills</h4>
                        {isEditing && <button onClick={() => { const n = { ...editForm.skills }; n.soft = [...(n.soft || []), { name: "" }]; setEditForm({ ...editForm, skills: n }) }} className="text-teal-600 text-xs font-bold flex items-center gap-1"><FaPlus size={10} /> Add</button>}
                      </div>
                      <div className="space-y-3">
                        {(isEditing ? (editForm.skills?.soft || []) : (profile.skills?.soft || [])).map((s, i) => (
                          <div key={i}>
                            {isEditing ? (
                              <div className="flex gap-2 items-center">
                                <input className={inputC} value={s.name || ""} onChange={e => { const n = { ...editForm.skills }; n.soft[i] = { ...n.soft[i], name: e.target.value }; setEditForm({ ...editForm, skills: n }) }} />
                                <button onClick={() => { const n = { ...editForm.skills }; n.soft.splice(i, 1); setEditForm({ ...editForm, skills: n }) }} className="text-red-400 hover:text-red-600"><FaTrash size={14} /></button>
                              </div>
                            ) : (
                              <span className="flex items-center gap-2 text-xs font-bold text-slate-700"><FaCheckCircle className="text-teal-500" /> {s.name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Projects" && (
              <div className="space-y-8">
                {sectionHeader("Portfolio")}
                <div className="grid grid-cols-1 gap-8">
                  {isEditing && <button onClick={() => { const n = [...editForm.projects]; n.push({}); setEditForm({ ...editForm, projects: n }); }} className="text-teal-600 text-sm font-bold flex items-center gap-1 hover:underline mb-4"><FaPlus size={12} /> Add Project</button>}
                  {((isEditing ? editForm.projects : profile.projects) || []).length > 0 ? ((isEditing ? editForm.projects : profile.projects || [])).map((p, i) => (
                    <div key={i} className="relative p-6 border border-slate-200 rounded group hover:border-teal-200 transition-all">
                      {isEditing ? (
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button onClick={() => { const n = [...editForm.projects]; n.splice(i, 1); setEditForm({ ...editForm, projects: n }); }} className="absolute -top-2 -right-2 bg-white p-1.5 border border-slate-200 text-red-400 hover:text-red-600 rounded-full shadow-sm z-10 transition-all"><FaTrash size={12} /></button>
                          <div className="col-span-1"><label className={labelC}>Title</label><input className={inputC} value={p.title || ""} onChange={e => { const n = [...editForm.projects]; n[i].title = e.target.value; setEditForm({ ...editForm, projects: n }) }} /></div>
                          <div className="col-span-1"><label className={labelC}>Link</label><input className={inputC} value={p.url || ""} onChange={e => { const n = [...editForm.projects]; n[i].url = e.target.value; setEditForm({ ...editForm, projects: n }) }} /></div>
                          <div className="col-span-1 md:col-span-2"><label className={labelC}>Description</label><textarea className={`${inputC} h-20`} value={p.desc || ""} onChange={e => { const n = [...editForm.projects]; n[i].desc = e.target.value; setEditForm({ ...editForm, projects: n }) }} /></div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-base font-bold text-slate-900">{p.title}</h4>
                            {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="text-teal-600 hover:text-teal-700"><FaExternalLinkAlt size={14} /></a>}
                          </div>
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{p.desc}</p>
                        </div>
                      )}
                    </div>
                  )) : emptyState("No projects showcased.")}
                </div>
              </div>
            )}

            {activeTab === "Documents" && (
              <div className="space-y-12">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900">Career Documents</h3>
                </div>
                {[
                  { title: "Resumes", data: resumes, type: "resume" },
                  { title: "Cover Letters", data: coverLetters, type: "cover_letter" },
                  { title: "Other Docs", data: otherDocs, type: "other" }
                ].map(sec => (
                  <div key={sec.type} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{sec.title}</h4>
                      <label className="text-xs font-bold text-teal-600 hover:underline cursor-pointer">
                        + Upload New
                        <input type="file" className="hidden" onChange={async (e) => {
                          const f = e.target.files[0]; if (f) {
                            const name = prompt("Document Name:", f.name); if (name) {
                              const fd = new FormData(); fd.append("file", f); fd.append("name", name); fd.append("type", sec.type);
                              await api.post("/api/profile/resume/", fd); fetchProfile();
                            }
                          }
                        }} />
                      </label>
                    </div>
                    {sec.data.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {sec.data.map(r => (
                          <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded group transition-all hover:bg-white hover:border-teal-200">
                            <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
                              <div className="p-2 bg-white rounded border border-slate-100 shadow-sm text-slate-400 group-hover:text-teal-600 transition-colors"><FaFileAlt size={16} /></div>
                              <span className="text-sm font-bold text-slate-700 break-all">{r.name}</span>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button title="Rename" onClick={async () => { const n = prompt("New Name:", r.name); if (n) { await api.post(`/api/profile/resume/rename/${r.id}/`, { name: n }); fetchProfile(); } }} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-all"><FaEdit size={14} /></button>
                              <a title="View" href={`${API_URL}${r.file}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-all"><FaExternalLinkAlt size={14} /></a>
                              <button title="Delete" onClick={async () => { if (confirm("Delete this document?")) { await api.delete(`/api/profile/resume/${r.id}/`); fetchProfile(); } }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"><FaTrash size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[2px] py-2">No documents</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Settings" && (
              <div className="max-w-md space-y-8">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900">Account Security</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className={labelC}>Account Email</label>
                    <p className="text-sm font-bold text-slate-900 py-2 border-b border-slate-100">{profile.email}</p>
                  </div>
                  <div>
                    <label className={labelC}>Update Password</label>
                    <input type="password" id="new_pass" placeholder="New password" className={inputC} />
                  </div>
                  <button onClick={async () => { const p = document.getElementById("new_pass").value; if (p) { await api.post("/api/profile/request-password/", { password: p }); alert("Request Submitted"); } }} className="w-full py-2.5 bg-slate-900 text-white text-sm font-bold rounded hover:bg-black transition-all">Request Password Reset</button>
                </div>
                <div className="pt-10 border-t border-slate-100 mt-10">
                  <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4">Caution</h3>
                  <div className="p-6 border border-red-100 rounded-2xl bg-red-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Delete Account</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">Permanently remove all your data and career records.</p>
                    </div>
                    <button onClick={async () => { if (window.confirm("WARNING: Permanent deletion. Continue?")) { try { await api.delete("/api/profile/delete/"); sessionStorage.clear(); navigate("/"); window.location.reload(); } catch { alert("Failed"); } } }} className="px-6 py-2.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-100 shrink-0">Delete Permanently</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </UserLayout>
  );
}
