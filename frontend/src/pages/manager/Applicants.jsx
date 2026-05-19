import { useEffect, useState } from "react";
import api, { API_URL } from "../../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ManagerLayout from "../../layouts/ManagerLayout";
import { FaDownload, FaEye, FaTimes, FaInfoCircle, FaRobot } from "react-icons/fa";

export default function Applicants() {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const token = sessionStorage.getItem("token");
  const fetchApplications = async () => {
    try {
      const res = await api.get("/api/applications/manager-all/", { headers: { Authorization: `Bearer ${token}` } });
      setApps(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const downloadAllApplicants = () => {
    const img = new Image();
    img.src = "/logo.png";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const logoData = canvas.toDataURL("image/png");
      const doc = new jsPDF();
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 45, 'F');
      doc.setFillColor(230, 255, 250);
      doc.triangle(140, 0, 210, 0, 210, 45, 'F');
      doc.setFillColor(45, 212, 191);
      doc.triangle(180, 0, 210, 0, 210, 30, 'F');
      doc.setDrawColor(20, 184, 166);
      doc.setLineWidth(1);
      doc.line(0, 45, 210, 45);
      doc.addImage(logoData, 'PNG', 15, 10, 25, 25);
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("SHNOOR JOB", 48, 20);
      doc.text("RECRUITMENT PORTAL", 48, 30);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Global Applicants Recruitment Report", 48, 38);
      let y = 55;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text("DETAILED APPLICANT OVERVIEW", 105, y, { align: "center" });
      doc.setDrawColor(226, 232, 240);
      doc.line(15, y + 3, 195, y + 3);
      const tableData = apps.map(a => [a.username.toUpperCase(), a.email, a.job_title, `${a.ats_score}%`, a.status.toUpperCase()]);
      autoTable(doc, {
        startY: y + 7,
        head: [["NAME", "EMAIL", "POSITION", "ATS", "STATUS"]],
        body: tableData,
        theme: "plain",
        headStyles: { fillColor: [15, 118, 110], textColor: 255, fontSize: 10, fontStyle: 'bold', halign: "center" },
        bodyStyles: { fontSize: 9, cellPadding: 6, textColor: [30, 41, 59], halign: "center" },
        columnStyles: { 0: { halign: "left" }, 1: { halign: "left" } },
        styles: { lineWidth: 0 }
      });
      doc.setFillColor(230, 255, 250);
      doc.triangle(170, 297, 210, 297, 210, 280, 'F');
      doc.setFillColor(45, 212, 191);
      doc.triangle(190, 297, 210, 297, 210, 290, 'F');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text(`Report Generated On: ${new Date().toLocaleString()}`, 15, 290);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 184, 166);
      doc.text("Shnoor International LLC", 150, 285);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("Empowering Talent. Building Futures.", 150, 290);
      doc.save("Shnoor_Global_Applicants_Report.pdf");
    };
  };

  useEffect(() => { fetchApplications(); }, []);

  return (
    <ManagerLayout>
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">System Applicants</h1>
          <p className="text-slate-500 mt-2 text-sm font-bold uppercase tracking-widest">Global candidate directory diagnostics</p>
        </div>
        <button onClick={downloadAllApplicants} className="px-8 py-4 bg-teal-50 text-teal-600 rounded-2xl font-bold hover:bg-teal-600 hover:text-white transition-all text-xs uppercase tracking-widest border border-teal-100 flex items-center gap-3 shadow-sm"><FaDownload />Export PDF Report</button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-10 py-8">Candidate Profile</th>
              <th className="px-10 py-8">Applied Role</th>
              <th className="px-10 py-8">Match Score</th>
              <th className="px-10 py-8">Pipeline Status</th>
              <th className="px-10 py-8 text-right">Intelligence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {apps.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 transition-all group">
                <td className="px-10 py-8">
                  <p className="font-bold text-slate-900 text-lg font-['Plus_Jakarta_Sans'] group-hover:text-teal-600 transition">{a.username}</p>
                  <p className="text-sm text-slate-500 font-bold mt-1 tracking-tight">{a.email}</p>
                </td>
                <td className="px-10 py-8">
                  <p className="text-slate-700 font-bold text-base">{a.job_title}</p>
                </td>
                <td className="px-10 py-8">
                  <span className="px-5 py-2.5 bg-teal-50 text-teal-600 rounded-xl font-black text-sm border border-teal-100">{a.ats_score}%</span>
                </td>
                <td className="px-10 py-8">
                  <span className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest ${a.status === 'hired' ? 'bg-teal-500 text-white shadow-lg shadow-teal-50' : a.status === 'shortlisted' ? 'bg-teal-50 text-teal-600 border border-teal-200' : a.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>{a.status}</span>
                </td>
                <td className="px-10 py-8 text-right">
                  <button onClick={() => setSelectedApp(a)} className="px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50 transition shadow-sm inline-flex items-center gap-3">
                    <FaEye size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Review</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-sm bg-slate-500/20">
          <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-slate-200">
            <button onClick={() => setSelectedApp(null)} className="absolute top-8 right-8 w-12 h-12 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all z-10 flex items-center justify-center shadow-sm"><FaTimes /></button>
            <div className="p-12 md:p-16 overflow-y-auto custom-scrollbar bg-white">
              <div className="mb-12 border-b border-slate-100 pb-10">
                <span className="text-teal-600 font-black text-xs uppercase tracking-[4px] mb-3 block">Recruitment Intelligence</span>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">{selectedApp.username} <span className="text-slate-200 mx-4">/</span> <span className="text-teal-500">{selectedApp.ats_score}% Match</span></h2>
                <p className="text-slate-500 font-bold text-base mt-2">{selectedApp.job_title} Candidate</p>
              </div>
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-12">
                  <div className="bg-white p-10 rounded-2xl border border-slate-200 relative">
                    <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100">Screening Impacted</div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">EXECUTIVE SUMMARY & COMPARISON</h3>
                    <p className="text-slate-800 text-base leading-relaxed font-bold italic whitespace-pre-wrap">"{selectedApp.ai_analysis || "Analysis pending calibration."}"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                      <h3 className="text-xs font-black text-teal-600 uppercase tracking-widest mb-6">Core Strengths</h3>
                      <ul className="space-y-4">
                        {selectedApp.highlights?.strengths?.map((s, i) => (<li key={i} className="text-base font-bold text-slate-800 flex items-start gap-4"><span className="text-teal-500 mt-1.5">•</span> {s}</li>))}
                      </ul>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                      <h3 className="text-xs font-black text-red-600 uppercase tracking-widest mb-6">Critical Gaps</h3>
                      <ul className="space-y-4">
                        {selectedApp.highlights?.gaps?.map((g, i) => (<li key={i} className="text-base font-bold text-slate-800 flex items-start gap-4"><span className="text-red-400 mt-1.5">•</span> {g}</li>))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="space-y-12">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Screening Diagnostics</h3>
                    <div className="space-y-6">
                      {selectedApp.screening_answers?.length > 0 ? selectedApp.screening_answers.map((item, idx) => (
                        <div key={idx} className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm">
                          <p className="text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">Q: {item.question}</p>
                          <div className="p-5 bg-teal-50/30 rounded-xl border border-teal-100">
                            <p className="text-base font-black text-teal-900 leading-relaxed">A: {item.answer}</p>
                          </div>
                        </div>
                      )) : (<div className="p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center"><p className="text-slate-400 font-bold text-sm uppercase tracking-widest italic">No screening data captured</p></div>)}
                    </div>
                  </div>
                  <div className="pt-10 border-t border-slate-100 flex gap-6">
                    <a href={`${API_URL}${selectedApp.resume}`} target="_blank" className="flex-1 py-6 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest text-center hover:bg-secondary transition shadow-lg active:scale-95">View Candidate CV</a>
                    <button onClick={() => setSelectedApp(null)} className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition">Close Review</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}
