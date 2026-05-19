import {useEffect,useState,useRef} from "react";
import api, { API_URL } from "../../api";
import ManagerLayout from "../../layouts/ManagerLayout";
import {FaBell,FaCommentAlt,FaTrash,FaCheck,FaChartLine,FaStar,FaPaperclip,FaEnvelope,FaCheckDouble,FaArrowRight} from "react-icons/fa";
import EmojiPicker from 'emoji-picker-react';
export default function ManagerMessages(){
  const[notifications,setNotifications]=useState([]);
  const[selected,setSelected]=useState([]);
  const[filter,setFilter]=useState("all");
  const[selectedJob,setSelectedJob]=useState("all");
  const[selectedStage,setSelectedStage]=useState("all");
  const[activeChat,setActiveChat]=useState(null);
  const[messages,setMessages]=useState([]);
  const[newMessage,setNewMessage]=useState("");
  const[file,setFile]=useState(null);
  const[showEmojis,setShowEmojis]=useState(false);
  const[currentView,setCurrentView]=useState("messages");
  const[analytics,setAnalytics]=useState({ratings:{1:0,2:0,3:0,4:0,5:0},suggestions:[]});
  const messagesEndRef=useRef(null);
  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages]);
  const token=sessionStorage.getItem("token");
  const fetchNotifications=async()=>{
    try{
      const res=await api.get("/api/chat/manager-list/",{headers:{Authorization:`Bearer ${token}`}});
      setNotifications(res.data);
    }catch(err){}
  };
  const fetchAnalytics=async()=>{
    try{
      const res=await api.get("/api/chat/analytics/",{headers:{Authorization:`Bearer ${token}`}});
      setAnalytics(res.data);
    }catch(err){}
  };
  useEffect(()=>{fetchNotifications();fetchAnalytics();},[]);
  useEffect(()=>{
    if(!activeChat)return;
    const interval=setInterval(()=>{
      api.get(`/api/chat/messages/${activeChat.room_id}/`,{headers:{Authorization:`Bearer ${token}`}})
        .then(res=>setMessages(res.data))
        .catch(()=>{});
    },3000);
    return()=>clearInterval(interval);
  },[activeChat]);
  const toggleSelect=(id)=>{
    if(selected.includes(id)){setSelected(selected.filter(i=>i!==id));}
    else{setSelected([...selected,id]);}
  };
  const deleteSelected=async()=>{
    try{
      await Promise.all(selected.map(id=>api.post("/api/chat/delete-notification/",{room_id:id},{headers:{Authorization:`Bearer ${token}`}})));
      setSelected([]);
      fetchNotifications();
    }catch(err){}
  };
  const deleteChat=async(roomId)=>{
    if(!window.confirm("Are you sure you want to delete this chat?"))return;
    try{
      await api.post("/api/chat/delete-notification/",{room_id:roomId},{headers:{Authorization:`Bearer ${token}`}});
      fetchNotifications();
      setActiveChat(null);
      setMessages([]);
    }catch(err){}
  };
  const closeChat=async(roomId)=>{
    if(!window.confirm("Are you sure you want to close this chat?"))return;
    try{
      await api.post("/api/chat/manager-close-chat/",{room_id:roomId},{headers:{Authorization:`Bearer ${token}`}});
      fetchNotifications();
      setActiveChat(prev=>({...prev,is_closed:true}));
    }catch(err){}
  };
  const markAsRead=async(roomId)=>{
    try{
      await api.get(`/api/chat/messages/${roomId}/`,{headers:{Authorization:`Bearer ${token}`}});
      fetchNotifications();
    }catch(err){}
  };
  const markAllAsRead=async()=>{
    try{
      await Promise.all(notifications.map(n=>{
        if(n.unread_count>0){
          return api.get(`/api/chat/messages/${n.room_id}/`,{headers:{Authorization:`Bearer ${token}`}});
        }
      }));
      fetchNotifications();
    }catch(err){}
  };
  const formatLastActive=(dateStr)=>{
    if(!dateStr)return "";
    const date=new Date(dateStr);
    const now=new Date();
    const diffMs=now-date;
    const diffMins=Math.floor(diffMs/60000);
    const diffHrs=Math.floor(diffMins/60);
    if(diffMins<1)return "Active now";
    if(diffMins<60)return `Last active ${diffMins} mins ago`;
    if(diffHrs<24)return `Last active ${diffHrs} hrs ago`;
    return `Last active on ${date.toLocaleDateString()}`;
  };
  const isUserActive=(dateStr)=>{
    if(!dateStr)return false;
    const date=new Date(dateStr);
    const now=new Date();
    const diffMs=now-date;
    const diffMins=Math.floor(diffMs/60000);
    return diffMins<1;
  };
  const formatMessageTime=(dateStr)=>{
    if(!dateStr)return "";
    const date=new Date(dateStr);
    const now=new Date();
    const diffMs=now-date;
    const diffMins=Math.floor(diffMs/60000);
    if(diffMins<1)return "Just now";
    return date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  };
  useEffect(()=>{
    let ws;
    let tid;
    const connectWS=()=>{
      if(!activeChat?.room_id)return;
      ws=new WebSocket(`${API_URL.replace("http","ws")}/ws/chat/${activeChat.room_id}/`);
      ws.onmessage=(e)=>{
        const data=JSON.parse(e.data);
        setMessages(prev=>[...prev,data]);
      };
      ws.onclose=()=>{
        tid=setTimeout(connectWS,3000);
      };
    };
    if(activeChat?.room_id){
      connectWS();
    }
    return()=>{
      if(ws)ws.close();
      if(tid)clearTimeout(tid);
    };
  },[activeChat?.room_id]);
  const openChat=async(chat)=>{
    setActiveChat(chat);
    setSelectedJob(chat.job_title);
    setSelectedStage(chat.status);
    setFilter("all");
    try{
      const res=await api.get(`/api/chat/messages/${chat.room_id}/`,{headers:{Authorization:`Bearer ${token}`}});
      setMessages(res.data);
      fetchNotifications();
    }catch(err){}
  };
  const sendMessage=async(e)=>{
    e.preventDefault();
    if(!newMessage.trim()&&!file)return;
    const formData=new FormData();
    formData.append("room_id",activeChat.room_id);
    if(newMessage.trim())formData.append("message",newMessage);
    if(file)formData.append("file",file);
    try{
      await api.post("/api/chat/send/",formData,{headers:{Authorization:`Bearer ${token}`,"Content-Type":"multipart/form-data"}});
      setNewMessage("");
      setFile(null);
    }catch(err){alert(err.response?.data?.error || "Failed to send message");}
  };
  const filteredNotifs=notifications.filter(n=>{
    if(filter==="unread"&&!n.has_unread)return false;
    if(filter!=="unread"){
      if(selectedJob!=="all"&&n.job_title!==selectedJob)return false;
      if(selectedStage!=="all"&&n.status!==selectedStage)return false;
    }
    return true;
  });
  const jobs=[...new Set(notifications.map(n=>n.job_title))];
  return(
    <ManagerLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Student Support</h1>
          <p className="text-slate-500 text-sm">Manage student support messages and inquiries</p>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>setCurrentView(currentView==="messages"?"analytics":"messages")} className={`px-4 py-2 border rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${currentView==="analytics"?"bg-primary text-white border-primary":"bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}><FaChartLine/> {currentView==="analytics"?"View Messages":"Analytics"}</button>
          {currentView==="messages"&&(
            <button onClick={markAllAsRead} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 text-teal-600"><FaCheckDouble/> Mark All Read</button>
          )}
          <button onClick={fetchNotifications} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50">Refresh</button>
        </div>
      </div>
      {currentView==="messages"&&(
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm mb-6 p-4 flex justify-between items-center">
          <div className="flex gap-2">
            <button onClick={()=>setFilter("all")} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter==="all"?"bg-primary text-white":"bg-slate-100 text-slate-600"}`}>All Messages</button>
            <button onClick={()=>setFilter("unread")} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter==="unread"?"bg-primary text-white":"bg-slate-100 text-slate-600"}`}>Unread {notifications.filter(n=>n.has_unread).length>0&&`(${notifications.filter(n=>n.has_unread).length})`}</button>
          </div>
          <div className="flex gap-2">
            <select value={selectedJob} onChange={(e)=>setSelectedJob(e.target.value)} className="bg-white text-slate-900 border border-slate-200 rounded-lg p-2 text-sm">
              <option value="all">Select Job</option>
              {jobs.map(j=><option key={j} value={j}>{j} ({notifications.filter(n=>n.job_title===j).length})</option>)}
            </select>
            <select value={selectedStage} onChange={(e)=>setSelectedStage(e.target.value)} className="bg-white text-slate-900 border border-slate-200 rounded-lg p-2 text-sm">
              <option value="all">Select Stage</option>
              {["pending","interviewing","shortlisted","hired","rejected"].map(s=>(
                <option key={s} value={s}>{s.toUpperCase()} ({notifications.filter(n=>(selectedJob==="all"||n.job_title===selectedJob) && n.status===s).length})</option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-6 h-[600px]">
        {currentView==="analytics"?(
          <div className="col-span-3 border border-slate-100 rounded-2xl bg-white p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-6 font-['Plus_Jakarta_Sans']">Chat Analytics</h2>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl">
                <p className="text-sm font-bold text-slate-500 uppercase mb-4">Overall Rating Distribution</p>
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="10" fill="none"/>
                    <circle cx="50" cy="50" r="40" stroke="#14b8a6" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (Object.values(analytics.ratings).reduce((a,b)=>a+b,0) > 0 ? (Object.entries(analytics.ratings).reduce((acc,[star,count])=>acc+(parseInt(star)*count),0)/Object.values(analytics.ratings).reduce((a,b)=>a+b,0))/5 : 0))} fill="none" transform="rotate(-90 50 50)" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">{Object.values(analytics.ratings).reduce((a,b)=>a+b,0) > 0 ? (Object.entries(analytics.ratings).reduce((acc,[star,count])=>acc+(parseInt(star)*count),0)/Object.values(analytics.ratings).reduce((a,b)=>a+b,0)).toFixed(1) : "0.0"}</span>
                    <span className="text-xs text-slate-500 font-bold">Avg Rating</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4 flex flex-col justify-center">
                {[5,4,3,2,1].map(star=>(
                  <div key={star} className="flex items-center gap-2">
                    <div className="w-10 font-bold text-sm text-slate-600 flex items-center">{star} ★</div>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${star===5?'bg-teal-600':(star===4||star===3)?'bg-teal-400':star===2?'bg-teal-300':'bg-red-500'}`} style={{width:`${Object.values(analytics.ratings).reduce((a,b)=>a+b,0) > 0 ? (analytics.ratings[star]/Object.values(analytics.ratings).reduce((a,b)=>a+b,0))*100 : 0}%`}}></div>
                    </div>
                    <div className="w-6 text-sm text-slate-500 text-right">{analytics.ratings[star]}</div>
                  </div>
                ))}
              </div>
            </div>
            <h3 className="font-bold text-slate-800 mb-4">User Suggestions</h3>
            <div className="space-y-3">
              {analytics.suggestions.length===0?(
                <p className="text-sm text-slate-400">No suggestions yet</p>
              ):(
                analytics.suggestions.map((s,idx)=>(
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl text-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-slate-700">{s.username} <span className="text-xs font-normal text-slate-400">({s.job_title})</span></p>
                      <span className="text-xs text-slate-400">{s.date ? new Date(s.date).toLocaleString([],{dateStyle:'short',timeStyle:'short'}) : ""}</span>
                    </div>
                    <p className="text-slate-600">"{s.text}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        ):(
          filter!=="unread" && (selectedJob==="all"||selectedStage==="all") ? (
            <div className="col-span-3 flex flex-col items-center justify-center text-slate-400 border border-slate-100 rounded-2xl bg-white">
              <FaCommentAlt size={48} className="mb-4 text-slate-200"/>
              <p className="font-bold">Please select a Job and Stage to view messages</p>
            </div>
          ):(
            <>
              <div className="col-span-1 border border-slate-100 rounded-2xl bg-white overflow-y-auto">
                <div className="p-4 border-b border-slate-100 font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Messages ({filteredNotifs.length})</div>
                {filteredNotifs.map(n=>(
                  <div key={n.room_id} onClick={()=>openChat(n)} className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-3 ${activeChat?.room_id===n.room_id?"bg-slate-50":""}`}>
                    <div className="relative w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                      <FaEnvelope size={16}/>
                      {isUserActive(n.latest_time)&&<span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="font-bold text-slate-800 truncate">{n.username}</p>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{formatMessageTime(n.latest_time)}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{n.job_title}</p>
                      {n.unread_count>0&&(
                        <span className="inline-block mt-1 px-2 py-0.5 bg-teal-50 text-teal-600 text-[10px] font-bold rounded-lg uppercase">
                          {n.unread_count} new
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {filteredNotifs.length===0&&<div className="text-center py-10 text-slate-400 text-sm">No messages found</div>}
              </div>
              <div className="col-span-2 border border-slate-100 rounded-2xl bg-white flex flex-col h-[600px]">
                {activeChat && filteredNotifs.some(n => n.room_id === activeChat.room_id) ? (
                  <>
                    <div className="p-4 border-b border-slate-100 font-bold text-slate-900 flex justify-between items-center font-['Plus_Jakarta_Sans']">
                      <div>
                        <div>{activeChat.username} <span className="text-xs text-slate-400 font-normal">({activeChat.job_title})</span></div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">{formatLastActive(activeChat.latest_time)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {!activeChat.is_closed ? (
                          <button onClick={()=>closeChat(activeChat.room_id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all">Close Chat</button>
                        ) : (
                          <button onClick={()=>deleteChat(activeChat.room_id)} className="text-red-500 hover:text-red-700 transition-all"><FaTrash size={16}/></button>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                      {messages.map((msg,idx)=>(
                        <div key={idx} className={`flex ${msg.sender===activeChat.username?"justify-start":"justify-end"}`}>
                          <div className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.sender===activeChat.username?"bg-slate-100 text-slate-800":"bg-teal-600 text-white"}`}>
                            {msg.message}
                            {msg.file&&(
                              <div className="mt-2">
                                {msg.file.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                  <img src={`${API_URL}${msg.file}`} alt="attachment" className="max-w-full rounded-lg" />
                                ) : msg.file.match(/\.(mp4|webm|ogg)$/) ? (
                                  <video src={`${API_URL}${msg.file}`} controls className="max-w-full rounded-lg" />
                                ) : (
                                  <a href={`${API_URL}${msg.file}`} target="_blank" rel="noopener noreferrer" className={`underline text-xs ${msg.sender===activeChat.username?"text-teal-600":"text-teal-100"}`}>View Document</a>
                                )}
                              </div>
                            )}
                            <div className={`text-[10px] mt-1 text-right ${msg.sender===activeChat.username?"text-slate-400":"text-teal-100"}`}>
                              {new Date(msg.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    {!activeChat.is_closed?(
                      <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2 items-center">
                        <label className="cursor-pointer p-2 bg-white rounded-lg hover:bg-slate-200 transition-all">
                          <FaPaperclip className="text-slate-500" />
                          <input type="file" onChange={(e)=>setFile(e.target.files[0])} className="hidden" />
                        </label>
                        {file&&<span className="text-xs text-slate-500 font-bold max-w-[100px] truncate">{file.name}</span>}
                        <div className="relative">
                          <button type="button" onClick={()=>setShowEmojis(!showEmojis)} className="p-2 bg-white rounded-lg hover:bg-slate-200 transition-all">😊</button>
                          {showEmojis&&(
                            <div className="absolute bottom-12 right-0 z-50">
                              <EmojiPicker onEmojiClick={(emojiData)=>{setNewMessage(newMessage+emojiData.emoji);setShowEmojis(false);}} />
                            </div>
                          )}
                        </div>
                        <input type="text" value={newMessage} onChange={(e)=>setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-white text-slate-900 border border-slate-200 rounded-lg p-2 text-sm" />
                        <button type="submit" className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-secondary transition-all"><FaArrowRight/></button>
                      </form>
                    ):(
                      <div className="p-4 border-t border-slate-100 text-center text-slate-400 font-bold text-sm">
                        Chat closed by user on {activeChat.closed_at?new Date(activeChat.closed_at).toLocaleString():new Date(activeChat.latest_time).toLocaleString()}
                      </div>
                    )}
                  </>
                ):(
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <FaCommentAlt size={48} className="mb-4 text-slate-200"/>
                    <p className="font-bold">Select a message to view conversation</p>
                    <p className="text-sm">Click on a message to view details and reply</p>
                  </div>
                )}
              </div>
            </>
          )
        )}
      </div>
    </ManagerLayout>
  );
}
