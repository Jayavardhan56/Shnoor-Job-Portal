import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { API_URL } from "../../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import ManagerLayout from "../../layouts/ManagerLayout";
import logo from "../../assets/logo.png";
import { FaEdit, FaTrash, FaCheck, FaTimes, FaArrowLeft, FaBriefcase, FaPaperPlane, FaDownload, FaFileExcel, FaFilePdf, FaChevronDown, FaRobot, FaLightbulb, FaExclamationTriangle, FaSync, FaStar, FaChartLine, FaUserCheck, FaInfoCircle, FaCommentAlt } from "react-icons/fa";

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", salary: "", skills: "", deadline: "" });
  const [assessmentLink, setAssessmentLink] = useState(`${API_URL}/api/applications/submit-assessment/?application_id={app_id}&score=85&passing_score=70`);
  const [sendingAssessment, setSendingAssessment] = useState(false);
  const [exportingStage, setExportingStage] = useState(false);
  const [exportingPipeline, setExportingPipeline] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedAppIds, setSelectedAppIds] = useState([]);
  const [showResponses, setShowResponses] = useState(null);
  const [activeStatus, setActiveStatus] = useState("pending");
  const [showExportOpts, setShowExportOpts] = useState(false);
  const [loadingReanalyze, setLoadingReanalyze] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const fetchJobs = async () => {
    try {
      const res = await api.get("/api/jobs/my/", { headers: { Authorization: `Bearer ${token}` } });
      setJobs(res.data);
      if (res.data.length > 0 && !selectedJob) handleJobSelect(res.data[0]);
    } catch (err) { }
  };
  const fetchApplicants = async (id) => {
    try {
      const res = await api.get(`/api/applications/job/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setApps(res.data);
    } catch (err) { }
  };
  const handleJobSelect = (j) => {
    setSelectedJob(j);
    setIsEditing(false);
    fetchApplicants(j.id);
  };
  const updateStatus = async (appId, status) => {
    try {
      await api.put(`/api/applications/update/${appId}/`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      fetchApplicants(selectedJob.id);
    } catch (err) { }
  };
  const handleBulkUpdateStatus = async (status) => {
    if (selectedAppIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      await api.post("/api/applications/bulk-update/", { application_ids: selectedAppIds, status }, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedAppIds([]);
      fetchApplicants(selectedJob.id);
    } catch (err) { alert("Bulk update failed."); }
    finally { setBulkActionLoading(false); }
  };
  const toggleSelectApp = (id) => {
    setSelectedAppIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const toggleSelectAllApps = () => {
    const filteredApps = apps.filter(a => a.status === activeStatus).map(a => a.id);
    if (selectedAppIds.length === filteredApps.length) setSelectedAppIds([]);
    else setSelectedAppIds(filteredApps);
  };
  const handleReanalyze = async () => {
    if (!selectedApp) return;
    setLoadingReanalyze(true);
    try {
      const res = await api.post(`/api/applications/reanalyze/${selectedApp.id}/`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const updatedApp = { ...selectedApp, ...res.data };
      setSelectedApp(updatedApp);
      setApps(prev => prev.map(a => a.id === selectedApp.id ? updatedApp : a));
    } catch (err) { alert("Analysis failed. Please try again."); }
    finally { setLoadingReanalyze(false); }
  };
  const handleUpdateJob = async () => {
    try {
      await api.put(`/api/jobs/update/${selectedJob.id}/`, editForm, { headers: { Authorization: `Bearer ${token}` } });
      setIsEditing(false);
      fetchJobs();
      setSelectedJob({ ...selectedJob, ...editForm });
    } catch (err) { alert("Update failed."); }
  };
  const deleteJob = async () => {
    if (!window.confirm("Delete this job listing?")) return;
    try {
      await api.delete(`/api/jobs/${selectedJob.id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedJob(null);
      fetchJobs();
    } catch (err) { }
  };
  const deleteSelectedJobs = async () => {
    if (!window.confirm(`Delete ${selectedJobIds.length} job listings?`)) return;
    try {
      for (const id of selectedJobIds) {
        await api.delete(`/api/jobs/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      }
      setSelectedJobIds([]);
      fetchJobs();
      if (selectedJobIds.includes(selectedJob?.id)) setSelectedJob(null);
    } catch (err) { }
  };
  const toggleSelectJob = (id) => {
    setSelectedJobIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const exportExcel = (aoaData, name) => {
    const ws = XLSX.utils.aoa_to_sheet(aoaData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${name}.xlsx`);
  };
  const handleExportAllExcel = () => {
    if (apps.length === 0) { alert("No applicant data to export."); return; }
    const stats = { pending: apps.filter(a => a.status === 'pending').length, shortlisted: apps.filter(a => a.status === 'shortlisted').length, interviewing: apps.filter(a => a.status === 'interviewing').length, hired: apps.filter(a => a.status === 'hired').length, rejected: apps.filter(a => a.status === 'rejected').length };
    const data = [
      ["JOB RECRUITMENT DETAILS"],
      ["Title", selectedJob.title],
      ["Salary", selectedJob.salary],
      ["Manager", "Hiring Manager"],
      ["Posted On", new Date(selectedJob.created_at).toLocaleDateString()],
      ["Deadline", new Date(selectedJob.deadline).toLocaleDateString()],
      [],
      ["PIPELINE ANALYTICS"],
      ["STAGE", "COUNT", "MATCH", "PRIMARY CONTACT"],
      ["Pending", stats.pending, "-", "N/A"],
      ["Shortlisted", stats.shortlisted, "100.00%", "Jayavardhan"],
      ["Interviewing", stats.interviewing, "-", "N/A"],
      ["Hired", stats.hired, "-", "N/A"],
      ["Rejected", stats.rejected, "-", "N/A"]
    ];
    exportExcel(data, `${selectedJob.title}_Recruitment_Report`);
  };
  const handleExportStageExcel = () => {
    const stageApps = apps.filter(a => a.status === activeStatus);
    if (stageApps.length === 0) { alert("No data found in this stage."); return; }
    setExportingStage(true);
    setTimeout(() => {
      const data = [["NAME", "EMAIL", "STATUS", "ATS SCORE"], ...stageApps.map(a => [a.username, a.email, activeStatus, a.ats_score + "%"])];
      exportExcel(data, `${selectedJob.title}_${activeStatus}_Applicants`);
      setExportingStage(false);
    }, 600);
  };
  const downloadReport = async () => {
    const doc = new jsPDF();
    const stats = { pending: apps.filter(a => a.status === 'pending').length, shortlisted: apps.filter(a => a.status === 'shortlisted').length, interviewing: apps.filter(a => a.status === 'interviewing').length, hired: apps.filter(a => a.status === 'hired').length, rejected: apps.filter(a => a.status === 'rejected').length };
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(45, 180, 160);
    doc.triangle(140, 0, 210, 0, 210, 70, 'F');
    const loadImage = (src) => new Promise((res) => { const img = new Image(); img.src = src; img.onload = () => res(img); });
    try {
      const img = await loadImage(logo);
      doc.addImage(img, "PNG", 15, 15, 25, 25);
    } catch (e) { }
    doc.setFont("arial", "bold");
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    doc.text("SHNOOR JOB", 45, 28);
    doc.text("RECRUITMENT PORTAL", 45, 37);
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Recruitment Report: ${selectedJob.title}`, 45, 45);
    doc.setDrawColor(45, 180, 160);
    doc.setLineWidth(0.8);
    doc.line(15, 55, 195, 55);
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("JOB TITLE", 20, 70);
    doc.text("HIRING MANAGER", 20, 80);
    doc.text("DATE POSTED", 20, 90);
    doc.setTextColor(15, 23, 42);
    doc.text(selectedJob.title, 70, 70);
    doc.text("Manager", 70, 80);
    doc.text(new Date(selectedJob.created_at).toLocaleDateString(), 70, 90);
    doc.setTextColor(100, 116, 139);
    doc.text("DEADLINE", 120, 70);
    doc.text("ATS THRESHOLD", 120, 80);
    doc.setTextColor(15, 23, 42);
    doc.text(new Date(selectedJob.deadline).toLocaleDateString(), 165, 70);
    doc.setTextColor(45, 180, 160);
    doc.text(`${selectedJob.min_ats_score || 50}%`, 165, 80);
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("APPLICANTS SUMMARY", 105, 110, { align: "center" });
    doc.line(20, 115, 190, 115);
    const boxW = 32;
    const startX = 18;
    const colors = [[45, 180, 160], [59, 130, 246], [168, 85, 247], [34, 197, 94], [239, 68, 68]];
    const labels = ["PENDING", "SHORTLISTED", "INTERVIEW", "HIRED", "REJECTED"];
    const values = [stats.pending, stats.shortlisted, stats.interviewing, stats.hired, stats.rejected];
    labels.forEach((l, i) => {
      const x = startX + (i * 36);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(l, x + 16, 125, { align: "center" });
      doc.setFontSize(18);
      doc.setTextColor(colors[i][0], colors[i][1], colors[i][2]);
      doc.text(values[i].toString(), x + 16, 135, { align: "center" });
      doc.setDrawColor(colors[i][0], colors[i][1], colors[i][2]);
      doc.setLineWidth(2);
      doc.line(x, 140, x + boxW, 140);
    });
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("RECRUITMENT PIPELINE OVERVIEW", 105, 160, { align: "center" });
    autoTable(doc, {
      startY: 165,
      head: [['STAGE', 'COUNT', 'MATCH', 'NAME', 'EMAIL']],
      body: [
        ['Pending', stats.pending, '-', 'N/A', 'N/A'],
        ['Shortlisted', stats.shortlisted, '100.00%', 'Jayavardhan', 'jayavardhan@nsrit.edu.in'],
        ['Interviewing', stats.interviewing, '-', 'N/A', 'N/A'],
        ['Hired', stats.hired, '-', 'N/A', 'N/A'],
        ['Rejected', stats.rejected, '-', 'N/A', 'N/A']
      ],
      styles: { font: "arial", fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [45, 180, 160], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Report Generated On: ${new Date().toLocaleString()}`, 20, 280);
    doc.setTextColor(45, 180, 160);
    doc.text("Shnoor International LLC", 190, 275, { align: "right" });
    doc.setTextColor(148, 163, 184);
    doc.text("Empowering Talent. Building Futures.", 190, 280, { align: "right" });
    doc.save(`${selectedJob.title}_Recruitment_Report.pdf`);
  };
  const triggerAssessment = async () => {
    if (!assessmentLink) return;
    setSendingAssessment(true);
    try {
      await api.post("/api/applications/trigger-assessment/", { job_id: selectedJob.id, link: assessmentLink }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Assessment invitations sent successfully.");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to trigger assessment.");
    } finally {
      setSendingAssessment(false);
    }
  };
  useEffect(() => {
    fetchJobs();
    const fetchCount = async () => {
      try {
        const res = await api.get("/api/chat/manager-list/", { headers: { Authorization: `Bearer ${token}` } });
        const count = res.data.filter(a => a.has_unread).length;
        setNotifCount(count);
      } catch (err) { }
    };
    fetchCount();
  }, []);

  return (
    <ManagerLayout>
      <div className="space-y-10">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end border-b border-slate-100 pb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">Recruitment Hub</h1>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-2">Manage and track your active job pipelines</p>
          </div>
          {selectedJob && (
            <div className="flex flex-wrap gap-4 w-full xl:w-auto">
              <button onClick={() => window.location.href = '/manager/messages'} className="flex-1 sm:flex-initial px-6 py-4 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-secondary flex items-center justify-center gap-3">
                <FaCommentAlt size={14} />
                Messages
                {notifCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{notifCount}</span>
                )}
              </button>
              <div className="relative flex-1 sm:flex-initial">
                <button onClick={() => setShowExportOpts(!showExportOpts)} className="w-full px-6 py-4 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-secondary flex items-center justify-center gap-3">Generate Report <FaChevronDown /></button>
                {showExportOpts && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[60] overflow-hidden">
                    <button onClick={() => { downloadReport(); setShowExportOpts(false) }} className="w-full px-6 py-4 text-left text-xs font-bold text-slate-800 hover:bg-teal-50 flex items-center gap-3 border-b border-slate-50"><FaFilePdf className="text-red-500 text-base" /> Professional PDF</button>
                    <button onClick={() => { handleExportAllExcel(); setShowExportOpts(false) }} className="w-full px-6 py-4 text-left text-xs font-bold text-slate-800 hover:bg-teal-50 flex items-center gap-3"><FaFileExcel className="text-teal-600 text-base" /> Analytics Excel</button>
                  </div>
                )}
              </div>
              <button onClick={deleteJob} className="flex-1 sm:flex-initial px-6 py-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition shadow-sm justify-center flex">Delete Role</button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-12 gap-6 lg:gap-10">
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Job Openings</h2>
            <div className="space-y-3">
              {jobs.map(j => (
                <div key={j.id} onClick={() => handleJobSelect(j)} className={`p-6 rounded-2xl cursor-pointer border transition-all flex items-center gap-4 ${selectedJob?.id === j.id ? 'bg-slate-50 border-slate-900 shadow-sm' : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'}`}>
                  <input type="checkbox" checked={selectedJobIds.includes(j.id)} onClick={(e) => e.stopPropagation()} onChange={() => toggleSelectJob(j.id)} className="w-5 h-5 rounded border-slate-300 text-slate-900" />
                  <div className="flex-1 truncate">
                    <h3 className={`font-bold text-base truncate font-['Plus_Jakarta_Sans'] ${selectedJob?.id === j.id ? 'text-slate-900' : 'text-slate-900'}`}>{j.title}</h3>
                    <p className={`text-xs font-bold mt-1 ${selectedJob?.id === j.id ? 'text-slate-900' : 'text-slate-500'}`}>{j.salary}</p>
                  </div>
                </div>
              ))}
            </div>
            {selectedJobIds.length > 0 && <button onClick={deleteSelectedJobs} className="w-full py-5 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-red-100">Delete Selected ({selectedJobIds.length})</button>}
          </div>
          <div className="col-span-12 lg:col-span-9 space-y-10">
            {selectedJob ? (
              <div className="space-y-10">
                <div className="bg-white p-5 sm:p-12 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10 pb-10 border-b border-slate-100">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">{selectedJob.title}</h2>
                      <p className="text-slate-900 font-bold text-base mt-2">{selectedJob.salary}</p>
                    </div>
                    <button onClick={() => { setIsEditing(true); setEditForm({ title: selectedJob.title, description: selectedJob.description, salary: selectedJob.salary, skills: selectedJob.skills, deadline: selectedJob.deadline }) }} className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary shadow-lg shadow-slate-100 text-center">Modify Listing</button>
                  </div>
                  {isEditing ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Job Title</label>
                          <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base text-slate-700 outline-none focus:border-teal-500" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Salary</label>
                          <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base text-slate-700 outline-none focus:border-teal-500" value={editForm.salary} onChange={e => setEditForm({ ...editForm, salary: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <textarea className="w-full p-6 bg-slate-50 border border-slate-200 rounded-xl font-medium text-base min-h-[180px] text-slate-700 outline-none focus:border-teal-500 leading-relaxed" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={handleUpdateJob} className="w-full sm:w-auto px-12 py-4 bg-[#2E8B87] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg text-center">Save Changes</button>
                        <button onClick={()=>setIsEditing(false)} className="w-full sm:w-auto px-12 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 text-center">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 gap-8 lg:gap-12 mt-12">
                      <div className="col-span-12 lg:col-span-7 space-y-10">
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Job Responsibilities</p>
                          <p className="text-slate-700 text-base leading-relaxed font-medium italic whitespace-pre-wrap">"{selectedJob.description}"</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Technical Stack</p>
                          <div className="flex flex-wrap gap-3">
                            {selectedJob.skills?.split(",").map((s, i) => (
                              <span key={i} className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 shadow-sm">{s.trim()}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-y-8 lg:gap-y-12 gap-x-8 pt-6 lg:pt-0">
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Posted</p>
                          <p className="text-base font-black text-slate-900">{selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Expiry</p>
                          <p className="text-base font-black text-slate-900">{selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ATS Bar</p>
                          <p className="text-base font-black text-slate-900">{selectedJob.min_ats_score || 50}% Match</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Listing Status</p>
                          {selectedJob.is_draft ? (
                            <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">Draft</span>
                          ) : selectedJob.scheduled_publish_at && new Date(selectedJob.scheduled_publish_at) > new Date() ? (
                            <span className="px-4 py-1.5 bg-slate-50 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">Scheduled</span>
                          ) : (
                            <span className="px-4 py-1.5 bg-[#2E8B87] text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-[#2E8B87]">Live</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-8 mt-12 border-b border-slate-100 px-6 overflow-x-auto">
                  {[
                    { id: 'pending', label: 'Applied' },
                    { id: 'shortlisted', label: 'Shortlist' },
                    { id: 'assessment_pending', label: 'Assessment' },
                    { id: 'interviewing', label: 'Interview' },
                    { id: 'hired', label: 'Hired' },
                    { id: 'rejected', label: 'Rejected' }
                  ].map(s => (
                    <button key={s.id} onClick={()=>{setActiveStatus(s.id);setSelectedAppIds([])}} className={`pb-4 px-2 font-bold text-[11px] uppercase tracking-wider transition-all relative flex items-center gap-2 whitespace-nowrap ${activeStatus===s.id?'text-[#2E8B87]':'text-slate-400 hover:text-slate-600'}`}>
                      {s.label}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] ${activeStatus===s.id?'bg-[#2E8B87] text-white':'bg-slate-100 text-slate-500'}`}>{apps.filter(a=>a.status===s.id).length}</span>
                      {activeStatus===s.id&&<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2E8B87] animate-in fade-in duration-300"></div>}
                    </button>
                  ))}
                </div>
                 {activeStatus === 'shortlisted' && (
                  <div className="bg-white p-6 sm:p-10 rounded-2xl border-2 border-slate-100 shadow-sm mt-10 flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10 relative overflow-hidden">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0"><FaPaperPlane size={24} /></div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Assessment Link</h3>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Invite shortlisted candidates to a technical evaluation.</p>
                      </div>
                    </div>
                    <div className="w-full lg:flex-[1.5] flex flex-col sm:flex-row gap-4">
                      <input className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-700 outline-none focus:border-teal-500" value={assessmentLink} onChange={e => setAssessmentLink(e.target.value)} placeholder="e.g. https://shnoor.com/test-abc" />
                      <button onClick={triggerAssessment} disabled={sendingAssessment} className="px-10 py-4 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-secondary transition-all disabled:opacity-50 text-center">{sendingAssessment ? "Sending..." : "Send Now"}</button>
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mt-12 overflow-hidden relative">
                  {selectedAppIds.length > 0 && (
                    <div className="absolute top-0 left-0 right-0 bg-white border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-20 shadow-xl animate-in slide-in-from-top duration-300">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-100 whitespace-nowrap">{selectedAppIds.length} Selected</span>
                        <div className="hidden sm:block h-4 w-px bg-slate-200" />
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => handleBulkUpdateStatus('shortlisted')} disabled={bulkActionLoading} className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-50 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border border-slate-200 disabled:opacity-50">Shortlist</button>
                          <button onClick={() => handleBulkUpdateStatus('interviewing')} disabled={bulkActionLoading} className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-50 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border border-slate-200 disabled:opacity-50">Interview</button>
                          <button onClick={()=>handleBulkUpdateStatus('hired')} disabled={bulkActionLoading} className="px-3 py-1.5 bg-[#2E8B87] text-white rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-md disabled:opacity-50">Hire Now</button>
                          <button onClick={() => handleBulkUpdateStatus('rejected')} disabled={bulkActionLoading} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border border-red-100 disabled:opacity-50">Reject</button>
                        </div>
                      </div>
                      <button onClick={() => setSelectedAppIds([])} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all shrink-0 self-end sm:self-auto">Clear Selection</button>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                        <div className="flex items-center gap-6">
                          <input type="checkbox" onChange={toggleSelectAllApps} checked={selectedAppIds.length === apps.filter(a => a.status === activeStatus).length && selectedAppIds.length > 0} className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidate</p>
                        </div>
                        <div className="flex items-center gap-10">
                          <button onClick={handleExportStageExcel} disabled={exportingStage} className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 disabled:opacity-50"><FaFileExcel className="text-teal-600" /> {exportingStage ? "Exporting..." : "Export Stage"}</button>
                          <div className="flex gap-20 mr-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI ATS</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</p>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {apps.filter(a => a.status === activeStatus).map(a => (
                      <div key={a.id} className={`p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all group ${selectedAppIds.includes(a.id) ? 'bg-teal-50/30' : ''}`}>
                        <div className="flex items-center gap-6 flex-1">
                          <input type="checkbox" checked={selectedAppIds.includes(a.id)} onChange={() => toggleSelectApp(a.id)} className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-slate-900 text-base font-['Inter',sans-serif]">{a.username}</p>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-bold tracking-tighter border border-slate-200">ID: {a.id}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium tracking-tight">{a.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-16 mr-10">
                          <button onClick={()=>setSelectedApp(a)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all border shadow-sm ${a.ats_score > 70 ? 'bg-[#2E8B87] text-white border-[#2E8B87]' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                            <FaRobot size={12}/> {a.ats_score}%
                          </button>
                          <div className="flex items-center gap-3">
                            <button onClick={()=>navigate(`/manager/user-profile/${a.user_id}`)} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-wider border border-slate-100 hover:bg-slate-100 transition-all">View Profile</button>
                            {a.resume ? (
                              <a href={`${API_URL}${a.resume}`} target="_blank" className="px-5 py-2.5 bg-[#2E8B87] text-white rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-md flex items-center gap-2">View CV</a>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-300 uppercase italic">No CV</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
              <div className="h-[650px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm text-center p-24">
                <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-10 text-slate-300 shadow-inner"><FaBriefcase size={40} /></div>
                <h2 className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">Recruitment Pipeline</h2>
                <p className="text-slate-500 mt-4 text-sm font-bold uppercase tracking-[4px]">Select an active listing to analyze applicants</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {showResponses && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-6 sm:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tight">Screening Diagnostics</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Candidate Direct Submissions</p>
              </div>
              <button onClick={() => setShowResponses(null)} className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm"><FaTimes /></button>
            </div>
            <div className="p-6 sm:p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {showResponses?.screening_answers && showResponses.screening_answers.length > 0 ? (
                <div className="space-y-8">
                  {showResponses.screening_answers.map((item, index) => (
                    <div key={index} className="border border-slate-100 rounded-2xl p-6 sm:p-8 bg-slate-50/30">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2E8B87]"></div> Question {index + 1}</p>
                      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
                        <p className="text-base font-bold text-slate-900 leading-relaxed font-['Plus_Jakarta_Sans']">{item.question}</p>
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Candidate Answer</p>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 sm:p-6">
                        <p className="text-base font-bold text-slate-900 leading-relaxed break-words">{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-base uppercase tracking-widest">No diagnostic responses available</p>
                </div>
              )}
            </div>
            <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/30 flex justify-end">
              <button onClick={() => setShowResponses(null)} className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-secondary transition-all shadow-xl text-center">Close Diagnostics</button>
            </div>
          </div>
        </div>
      )}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-500/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            <div className="p-6 sm:p-10 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 border border-slate-100"><FaRobot size={28} /></div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tight">Advanced AI Match Report</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Intelligent Evaluation & Comparison</p>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="w-12 h-12 bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all shadow-sm"><FaTimes /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-12 space-y-12 custom-scrollbar bg-white">
              <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 relative">
                <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-[#2E8B87] text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-[#2E8B87]">Screening Impacted</div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">EXECUTIVE SUMMARY & COMPARISON</h3>
                <p className="text-slate-800 text-base leading-relaxed font-bold whitespace-pre-wrap">"{selectedApp.ai_analysis || 'Analysis pending. Please run a scan.'}"</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 text-center flex flex-col justify-center">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Technical</p>
                  <p className="text-2xl font-black text-slate-900">{selectedApp.highlights?.ratings?.Technical || 0}/10</p>
                </div>
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 text-center flex flex-col justify-center">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Experience</p>
                  <p className="text-2xl font-black text-slate-900">{selectedApp.highlights?.ratings?.Experience || 0}/10</p>
                </div>
                <div className="bg-[#2E8B87] p-6 sm:p-8 rounded-3xl border border-[#2E8B87] text-center flex flex-col justify-center shadow-xl">
                  <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-4">Overall Score</p>
                  <p className="text-5xl font-black text-white font-['Plus_Jakarta_Sans']">{selectedApp.ats_score}%</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">MATCH HIGHLIGHTS</h3>
                  <div className="space-y-4">
                    {selectedApp.highlights?.strengths?.map((s, i) => (
                      <div key={i} className="flex gap-4 items-start bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-[#2E8B87] mt-2 shrink-0"></div>
                        <p className="text-sm text-slate-700 font-bold leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-3">AREAS OF CONCERN</h3>
                  <div className="space-y-4">
                    {selectedApp.highlights?.gaps?.map((s, i) => (
                      <div key={i} className="flex gap-4 items-start bg-red-50/30 p-5 rounded-2xl border border-red-100/50">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0"></div>
                        <p className="text-sm text-slate-700 font-bold leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
              <button onClick={() => setSelectedApp(null)} className="w-full sm:w-auto px-12 py-4 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all text-center">Dismiss</button>
              <button onClick={handleReanalyze} disabled={loadingReanalyze} className="w-full sm:w-auto px-12 py-4 bg-[#2E8B87] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-4">
                <FaSync className={loadingReanalyze ? "animate-spin" : ""}/> {loadingReanalyze ? "Analyzing..." : "Run AI Scan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}
