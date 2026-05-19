import {useEffect,useState,useRef} from "react";
import api, { API_URL } from "../../api";
import UserLayout from "../../layouts/UserLayout";
import {FaStar,FaTimes,FaCommentAlt,FaCheckCircle,FaCheck,FaPaperclip,FaArrowRight} from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
export default function MyApplications(){const[apps,setApps]=useState([]);
  const[showReviewModal,setShowReviewModal]=useState(false);
  const[selectedJobId,setSelectedJobId]=useState(null);
  const[ratings,setRatings]=useState({overall:5,technical:5,clarity:5,behavior:5});
  const[reviewText,setReviewText]=useState("");
  const[showChat,setShowChat]=useState(false);
  const[selectedAppForChat,setSelectedAppForChat]=useState(null);
  const[messages,setMessages]=useState([]);
  const[newMessage,setNewMessage]=useState("");
  const[roomId,setRoomId]=useState(null);
  const[file,setFile]=useState(null);
  const[isClosed,setIsClosed]=useState(false);
  const[isBackendClosed,setIsBackendClosed]=useState(false);
  const[chatRating,setChatRating]=useState(0);
  const[chatSuggestions,setChatSuggestions]=useState("");
  const[feedbackSubmitted,setFeedbackSubmitted]=useState(false);
  const[justSubmittedFeedback,setJustSubmittedFeedback]=useState(false);
  const[showEmojis,setShowEmojis]=useState(false);
  const[activeApp,setActiveApp]=useState(null);
  const[chatWidgetView,setChatWidgetView]=useState("options");
  const[isDeleting,setIsDeleting]=useState(false);
  const messagesEndRef=useRef(null);
  useEffect(()=>{messagesEndRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  const token=sessionStorage.getItem("token");
  const fetchApps=async()=>{try{const res=await api.get("/api/applications/user/",{headers:{Authorization:`Bearer ${token}`}});
      setApps(res.data);
      if(res.data.length>0){if(!activeApp){setActiveApp(res.data[0]);}else{const updated=res.data.find(a=>a.id===activeApp.id);
          if(updated)setActiveApp(updated);}}}catch(err){}};
  useEffect(()=>{fetchApps();},[]);
  useEffect(()=>{if(showChat&&activeApp){openChat(activeApp);}},[activeApp]);
  const handleReviewSubmit=async()=>{try{await api.post("/api/applications/reviews/post/",{job_id:selectedJobId,overall_rating:ratings.overall,technical_difficulty:ratings.technical,process_clarity:ratings.clarity,interviewer_behavior:ratings.behavior,review_text:reviewText},{headers:{Authorization:`Bearer ${token}`}});
      alert("Review posted successfully!");
      setShowReviewModal(false); setReviewText(""); fetchApps();} catch(err){alert(err.response?.data?.error||"Failed to post review");}};
  const openChat=async(app)=>{setSelectedAppForChat(app);
    setShowChat(true);
    setChatWidgetView("options");
    setIsClosed(false);
    setChatRating(0);
    setChatSuggestions("");
    setFeedbackSubmitted(false);
    setJustSubmittedFeedback(false);
    try{const res=await api.get(`/api/chat/room/${app.id}/`,{headers:{Authorization:`Bearer ${token}`}});
      setRoomId(res.data.room_id);
      setMessages(res.data.messages);
      setIsBackendClosed(res.data.is_closed);
      setChatRating(res.data.rating||0);
      setChatSuggestions(res.data.suggestions||"");
      setFeedbackSubmitted(res.data.is_closed&&!!res.data.rating);
      if(res.data.is_closed&&!res.data.rating){setIsClosed(true);}else{setIsClosed(false);}
      if(res.data.is_closed){setChatWidgetView("chat");}
      setApps(prev=>prev.map(a=>a.id === app.id ? {...a,has_unread: false} : a));} catch(err){console.log(err);
      if(err.response?.status===403){alert(err.response.data.error||"Access denied");}}};
  const sendMessage=async()=>{if(!newMessage.trim()&&!file||!roomId)return;
    const formData=new FormData();
    formData.append("room_id",roomId);
    if(newMessage.trim())formData.append("message",newMessage);
    if(file)formData.append("file",file);
    try{const res=await api.post("/api/chat/send/",formData,{headers:{Authorization:`Bearer ${token}`,"Content-Type":"multipart/form-data"}});
      setMessages([...messages,res.data]);
      setNewMessage("");
      setFile(null);}catch(err){console.log(err);}};
  const closeChatOnly=async()=>{if(window.confirm("Are you confirm?")){try{await api.post("/api/chat/close-chat/",{room_id:roomId},{headers:{Authorization:`Bearer ${token}`}});
        setIsBackendClosed(true);
        setIsClosed(true);}catch(err){alert("Failed to close chat. Please try again.");console.log(err);}}};
  const handleCloseAndRate=async()=>{if(chatRating===0){alert("Please select a rating before submitting!");return;}
    try{await api.post("/api/chat/close-chat/",{room_id:roomId,rating:chatRating,suggestions:chatSuggestions},{headers:{Authorization:`Bearer ${token}`}});
      setFeedbackSubmitted(true);
      setJustSubmittedFeedback(true);
      fetchApps();}catch(err){alert(err.response?.data?.error||"Failed to submit rating");console.log(err);}};
  const handleDeleteApp=async(id)=>{if(!window.confirm("Are you sure you want to delete this application?"))return;
    setIsDeleting(true);
    try{await api.delete(`/api/applications/delete/${id}/`,{headers:{Authorization:`Bearer ${token}`}});
      alert("Application deleted successfully");
      fetchApps();
      setActiveApp(null);}catch(err){alert("Failed to delete application");}
    finally{setIsDeleting(false);}};
  useEffect(()=>{let interval;
    if(showChat&&roomId){interval=setInterval(async ()=>{try{const res=await api.get(`/api/chat/messages/${roomId}/`,{headers: {Authorization: `Bearer ${token}`}});
          setMessages(res.data);} catch(err){console.log(err);}},3000);}
    return ()=>clearInterval(interval);},[showChat,roomId]);
  const RatingRow=({label,value,field})=>(<div className="space-y-3">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <div className="flex gap-1.5 flex-wrap">
        {[1,2,3,4,5,6,7,8,9,10].map(n=>(<button key={n} onClick={()=>setRatings({...ratings,[field]: n})} className={`w-9 h-9 rounded-lg font-bold text-xs transition-all border ${ratings[field] === n ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-100 scale-110' : 'bg-white text-slate-400 border-slate-100 hover:border-teal-200 hover:text-teal-600'}`}>{n}</button>))}
      </div>
    </div>);
  return (<UserLayout>
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">My Applications</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Track your recruitment progress</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 border border-slate-100 rounded-2xl bg-white overflow-y-auto h-[600px]">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-800">My Applications</div>
          {apps.map(a=>(<div key={a.id} onClick={()=>setActiveApp(a)} className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all flex justify-between items-center ${activeApp?.id === a.id ? "bg-slate-50" : ""}`}>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{a.job_title}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${a.status === 'shortlisted' ? 'bg-teal-50 text-teal-600' : a.status === 'rejected' ? 'bg-red-50 text-red-600' : a.status === 'hired' ? 'bg-teal-600 text-white' : a.status === 'interviewing' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600'}`}>{a.status === 'pending' ? 'applied' : a.status}</span>
              </div>
              {a.has_unread&&a.unread_count > 0&&(<span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] text-center">
                  {a.unread_count}
                </span>)}
            </div>))}
          {apps.length === 0&&<div className="text-center py-10 text-slate-400 text-sm">No applications found</div>}
        </div>
        <div className="lg:col-span-2 border border-slate-100 rounded-2xl bg-white flex flex-col h-[600px] relative">
          {activeApp ? (<>
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">{activeApp.job_title}</h2>
                <p className="text-xs text-slate-500 mt-1">Status: <span className="font-bold uppercase text-teal-600">{activeApp.status === 'pending' ? 'applied' : activeApp.status}</span></p>
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Application Progress</p>
                    <div className="flex items-center justify-between relative w-full px-4">
                    <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-100 z-0"></div>
                    {(()=>{const stages=['applied','shortlisted','assessment','interviewing','hired'];const cur=activeApp.status;const isRej=cur==='rejected';const statusMap={'pending':0,'applied':0,'shortlisted':1,'assessment_pending':2,'assessment_completed':2,'interviewing':3,'hired':4};const curIdx=statusMap[cur]??-1;return stages.map((step,idx)=>{const stepIdx=stages.indexOf(step);let isComp=stepIdx<=curIdx;let isActive=stepIdx===curIdx;return(<div key={step} className="relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${isRej?'bg-red-500 text-white shadow-lg shadow-red-100':isComp?'bg-teal-600 text-white shadow-lg shadow-teal-100':'bg-white border-2 border-slate-200 text-slate-400'} ${isActive?'ring-4 ring-teal-100':''}`}>{isRej?<FaTimes size={12}/>:isComp?<FaCheck size={10}/>:idx+1}</div>
                      <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${isRej?'text-red-500':isComp?'text-teal-600':'text-slate-400'}`}>{isRej?'Rejected':step}</span>
                      {isRej&&<div className="absolute top-4 left-1/2 w-full h-0.5 bg-red-500 -z-10"></div>}
                    </div>);}).slice(0,isRej?1:5);})()}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Job Description</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{activeApp.description||"No description provided."}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Skills</p>
                    <p className="text-sm text-slate-600 font-bold">{activeApp.skills||"N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Salary</p>
                    <p className="text-sm text-slate-600 font-bold">{activeApp.salary||"N/A"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Applied</p>
                    <p className="text-sm text-slate-600 font-bold">{activeApp.applied_at?new Date(activeApp.applied_at).toLocaleDateString():"N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deadline</p>
                    <p className="text-sm text-slate-600 font-bold">{activeApp.deadline?new Date(activeApp.deadline).toLocaleDateString():"N/A"}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex gap-4">
                  {['interviewing','hired'].includes(activeApp.status)&&(<div className="flex-1">{activeApp.reviewed?(<div className="w-full py-3 bg-teal-50 text-teal-600 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-teal-100/50"><FaCheck size={12}/> Interview Reviewed</div>):(<button onClick={()=>{setSelectedJobId(activeApp.job_id);setShowReviewModal(true);}} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-secondary transition-all shadow-lg shadow-slate-100"><FaCommentAlt size={12}/> Rate Experience</button>)}</div>)}
                  <button onClick={()=>handleDeleteApp(activeApp.id)} disabled={isDeleting} className="px-6 py-3 border border-red-100 text-red-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50">Delete Application</button>
                </div>
              </div>
              {['shortlisted','interviewing'].includes(activeApp.status)&&(<button onClick={()=>openChat(activeApp)} className="absolute bottom-6 right-6 w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all"><FaCommentAlt size={20}/>{activeApp.has_unread&&<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">1</span>}</button>)}
            </>)
 : (<div className="flex flex-col items-center justify-center h-full text-slate-400">
              <FaCommentAlt size={48} className="mb-4 text-slate-200" />
              <p className="font-bold">Please select an application to view details</p>
            </div>)}
        </div>
      </div>
      {showReviewModal&&(<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-12 border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Candidate Feedback</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Help us improve the recruitment journey</p>
              </div>
              <button onClick={()=>setShowReviewModal(false)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-black transition-all"><FaTimes /></button>
            </div>
            <div className="space-y-10">
              <RatingRow label="Overall Experience" value={ratings.overall} field="overall" />
              <RatingRow label="Technical Difficulty" value={ratings.technical} field="technical" />
              <RatingRow label="Process Clarity" value={ratings.clarity} field="clarity" />
              <RatingRow label="Interviewer Behavior" value={ratings.behavior} field="behavior" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Final Comments & Experience</p>
                <textarea className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 min-h-[120px] outline-none focus:ring-2 focus:ring-teal-100 resize-none" placeholder="Share your detailed feedback..." value={reviewText} onChange={e=>setReviewText(e.target.value)} />
              </div>
              <button onClick={handleReviewSubmit} className="w-full py-5 bg-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all flex items-center justify-center gap-3"><FaCheckCircle /> Submit Detailed Review</button>
            </div>
          </div>
        </div>)}
      {showChat&&(<div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl border border-slate-100 flex flex-col h-[500px] z-[100]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 p-4">
            <div>
              <h2 className="text-sm font-bold text-black">{selectedAppForChat?.job_title}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Recruiter Communication</p>
            </div>
            <div className="flex items-center gap-2">
              {chatWidgetView==="chat"&&!isClosed&&!feedbackSubmitted&&(<button onClick={()=>closeChatOnly()} className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-black transition-all"><FaCheck/></button>)}
              <button onClick={()=>setShowChat(false)} className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-black transition-all"><FaTimes/></button>
            </div>
          </div>

          {chatWidgetView === "options" ? (<div className="flex-1 p-4 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Options</p>
              <div onClick={()=>setChatWidgetView("chat")} className="p-4 bg-white border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600">
                  <FaCommentAlt size={14}/>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Chat with Recruiter</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Open conversation</p>
                </div>
              </div>
            </div>):feedbackSubmitted?(<div className="flex-1 flex flex-col justify-center items-center p-6 space-y-4">
              <FaCheckCircle size={48} className="text-teal-500"/>
              <h3 className="text-lg font-bold text-slate-800">Feedback Submitted</h3>
              <p className="text-sm text-slate-500">Thank you for your rating!</p>
            </div>):isClosed?(<div className="flex-1 flex flex-col justify-center items-center p-6 space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-800">Chat Closed</h3>
                <p className="text-sm text-slate-500">Please rate your conversation with the recruiter</p>
              </div>
              <div className="flex gap-3">
                {[1,2,3,4,5].map(n=>(<button key={n} onClick={()=>setChatRating(n)} className="text-4xl transition-all transform hover:scale-110">
                    <FaStar className={n <= chatRating ? "text-amber-400" : "text-slate-200"} />
                  </button>))}
              </div>
              <div className="w-full">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Suggestions / Comments</p>
                <textarea value={chatSuggestions} onChange={(e)=>setChatSuggestions(e.target.value)} placeholder="How can we improve?" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-black min-h-[100px] outline-none focus:ring-2 focus:ring-teal-100 resize-none" />
              </div>
              <button onClick={handleCloseAndRate} className="w-full py-3 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-secondary transition-all">Submit Rating</button>
            </div>) : (<>
              <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 bg-slate-50 rounded-lg">
                {messages.map(msg=>(<div key={msg.id} className={`flex ${msg.sender===selectedAppForChat?.manager?"justify-start":"justify-end"}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-xl text-sm font-medium leading-relaxed ${msg.sender===selectedAppForChat?.manager?"bg-white text-slate-700 border border-slate-100":"bg-teal-600 text-white"}`}>
                      {msg.message}
                      {msg.file&&(<div className="mt-2">
                          {msg.file.match(/\.(jpeg|jpg|gif|png)$/)?(<img src={`${API_URL}${msg.file}`} alt="attachment" className="max-w-full rounded-lg"/>):(<a href={`${API_URL}${msg.file}`} target="_blank" rel="noopener noreferrer" className={`underline text-xs ${msg.sender===selectedAppForChat?.manager?"text-teal-600":"text-teal-100"}`}>View Document</a>)}
                        </div>)}
                      <div className={`text-[10px] mt-1 text-right ${msg.sender===selectedAppForChat?.manager?"text-slate-400":"text-teal-100"}`}>{new Date(msg.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                  </div>))}
                <div ref={messagesEndRef}/>
              </div>
              {!isBackendClosed?(<form onSubmit={(e)=>{e.preventDefault();sendMessage();}} className="flex gap-2 items-center p-4">
                  <label className="cursor-pointer p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all">
                    <FaPaperclip className="text-slate-500"/>
                    <input type="file" onChange={(e)=>setFile(e.target.files[0])} className="hidden"/>
                  </label>
                  {file&&<span className="text-xs text-slate-500 font-bold max-w-[100px] truncate">{file.name}</span>}
                  <div className="relative">
                    <button type="button" onClick={()=>setShowEmojis(!showEmojis)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all">😊</button>
                    {showEmojis&&(<div className="absolute bottom-12 right-0 z-50">
                        <EmojiPicker onEmojiClick={(emojiData)=>{setNewMessage(prev=>prev+emojiData.emoji);setShowEmojis(false);}}/>
                      </div>)}
                  </div>
                  <input type="text" value={newMessage} onChange={(e)=>setNewMessage(e.target.value)} placeholder="Type your message..." className="flex-1 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-400 font-bold text-sm"/>
                  <button type="submit" className="w-10 h-10 bg-teal-600 text-white rounded-lg flex items-center justify-center hover:bg-teal-700 transition-all"><FaArrowRight/></button>
                </form>) : (<div className="text-center text-slate-400 py-3 font-bold text-sm">This conversation has been closed.</div>)}
            </>)}
        </div>)}
    </UserLayout>);}
