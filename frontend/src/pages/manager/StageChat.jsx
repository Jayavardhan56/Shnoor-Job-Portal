import {useEffect,useState} from "react";
import {useLocation} from "react-router-dom";
import api, { API_URL } from "../../api";
import ManagerLayout from "../../layouts/ManagerLayout";
import {FaPaperclip} from "react-icons/fa";
export default function StageChat(){
  const location=useLocation();
  const{jobId,stage}=location.state||{};
  const[candidates,setCandidates]=useState([]);
  const[selectedCandidate,setSelectedCandidate]=useState(null);
  const[showChatMobile,setShowChatMobile]=useState(false);
  const[messages,setMessages]=useState([]);
  const[newMessage,setNewMessage]=useState("");
  const[roomId,setRoomId]=useState(null);
  const[file,setFile]=useState(null);
  const token=sessionStorage.getItem("token");
  useEffect(()=>{
    fetchCandidates();
  },[]);
  const fetchCandidates=async()=>{
    try{
      const res=await api.get(`/api/applications/job/${jobId}/`,{headers:{Authorization:`Bearer ${token}`}});
      const filtered=res.data.filter(a=>a.status===stage);
      setCandidates(filtered);
    }catch(err){console.log(err);}
  };
  const openChat=async(candidate)=>{
    setSelectedCandidate(candidate);
    setShowChatMobile(true);
    try{
      const res=await api.get(`/api/chat/room/${candidate.id}/`,{headers:{Authorization:`Bearer ${token}`}});
      setRoomId(res.data.room_id);
      setMessages(res.data.messages);
    }catch(err){console.log(err);}
  };
  const sendMessage=async()=>{
    if(!newMessage.trim()&&!file||!roomId)return;
    const formData=new FormData();
    formData.append("room_id",roomId);
    if(newMessage.trim())formData.append("message",newMessage);
    if(file)formData.append("file",file);
    try{
      await api.post("/api/chat/send/",formData,{headers:{Authorization:`Bearer ${token}`,"Content-Type":"multipart/form-data"}});
      setNewMessage("");
      setFile(null);
    }catch(err){console.log(err);}
  };
  useEffect(()=>{
    let ws;
    let tid;
    const connectWS=()=>{
      if(!roomId)return;
      ws=new WebSocket(`${API_URL.replace("http","ws")}/ws/chat/${roomId}/`);
      ws.onmessage=(e)=>{
        const data=JSON.parse(e.data);
        setMessages(prev=>[...prev,data]);
      };
      ws.onclose=()=>{
        tid=setTimeout(connectWS,3000);
      };
    };
    if(roomId){
      connectWS();
    }
    return()=>{
      if(ws)ws.close();
      if(tid)clearTimeout(tid);
    };
  },[roomId]);
  return(
    <ManagerLayout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Recruitment Stage Chat</h1>
          <p className="text-slate-500 mt-2">Manage candidate conversations for this recruitment stage</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 uppercase font-['Plus_Jakarta_Sans']">{stage} Candidates</h2>
              <p className="text-slate-500 mt-2">Recruitment communication workspace</p>
            </div>
            <div className="px-5 py-2 bg-teal-50 text-teal-600 rounded-xl text-xs font-bold uppercase tracking-widest">{candidates.length} Candidates</div>
          </div>
          <div className="flex flex-col lg:grid lg:grid-cols-12 min-h-[700px]">
            <div className={`col-span-4 border-r border-slate-100 overflow-y-auto ${showChatMobile ? 'hidden lg:block' : 'block'}`}>
              {candidates.length===0?(
                <div className="p-24 text-center">
                  <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">No Candidates Available</h2>
                  <p className="text-slate-500 mt-3">No applicants available in this stage currently</p>
                </div>
              ):(
                candidates.map(candidate=>(
                  <div key={candidate.id} onClick={()=>openChat(candidate)} className={`p-6 border-b border-slate-100 cursor-pointer transition-all ${selectedCandidate?.id===candidate.id?"bg-teal-50":"hover:bg-slate-50"}`}>
                    <h2 className="text-lg font-bold text-slate-900">{candidate.username}</h2>
                    <p className="text-sm text-slate-500 mt-2">{candidate.email}</p>
                  </div>
                ))
              )}
            </div>
            <div className={`col-span-8 flex flex-col ${showChatMobile ? 'flex' : 'hidden lg:flex'}`}>
              {!selectedCandidate?(
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Select Candidate</h2>
                    <p className="text-slate-500 mt-3">Open a candidate conversation workspace</p>
                  </div>
                </div>
              ):(
                <>
                  <div className="p-6 border-b border-slate-100">
                    <button onClick={() => setShowChatMobile(false)} className="lg:hidden mb-4 flex items-center gap-2 text-xs font-bold text-[#2E8B87] hover:underline">← Back to Candidates</button>
                    <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">{selectedCandidate.username}</h2>
                    <p className="text-sm text-slate-500 mt-2">Recruitment Communication</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                    {messages.map(msg=>(
                      <div key={msg.id} className={`flex ${msg.sender===selectedCandidate.username?"justify-start":"justify-end"}`}>
                        <div className={`max-w-[70%] px-4 py-3 rounded-xl text-sm font-medium leading-relaxed ${msg.sender===selectedCandidate.username?"bg-white text-slate-700 border border-slate-100":"bg-teal-600 text-white"}`}>
                          {msg.message}
                          {msg.file&&(
                            <div className="mt-2">
                              {msg.file.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                <img src={`${API_URL}${msg.file}`} alt="attachment" className="max-w-full rounded-lg" />
                              ) : (
                                <a href={`${API_URL}${msg.file}`} target="_blank" rel="noopener noreferrer" className={`underline text-xs ${msg.sender===selectedCandidate.username?"text-teal-600":"text-teal-100"}`}>View Document</a>
                              )}
                            </div>
                          )}
                          <div className={`text-[10px] mt-1 text-right ${msg.sender===selectedCandidate.username?"text-slate-400":"text-teal-100"}`}>{new Date(msg.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={(e)=>{e.preventDefault();sendMessage();}} className="p-4 border-t border-slate-100 flex gap-4 items-center">
                    <label className="cursor-pointer p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
                      <FaPaperclip className="text-slate-500" />
                      <input type="file" onChange={(e)=>setFile(e.target.files[0])} className="hidden" />
                    </label>
                    {file&&<span className="text-xs text-slate-500 font-bold max-w-[100px] truncate">{file.name}</span>}
                    <input type="text" value={newMessage} onChange={(e)=>setNewMessage(e.target.value)} placeholder="Send recruitment message..." className="flex-1 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-400 text-sm" />
                    <button type="submit" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all text-sm">Send</button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
