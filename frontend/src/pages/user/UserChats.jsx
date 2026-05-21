import {useEffect,useState} from "react";
import api, { API_URL } from "../../api";
import UserLayout from "../../layouts/UserLayout";
export default function UserChats(){
  const[chats,setChats]=useState([]);
  const[selectedChat,setSelectedChat]=useState(null);
  const[showChatMobile,setShowChatMobile]=useState(false);
  const[messages,setMessages]=useState([]);
  const[newMessage,setNewMessage]=useState("");
  const[rating,setRating]=useState(0);
  const[suggestions,setSuggestions]=useState("");
  const token=sessionStorage.getItem("token");
  useEffect(()=>{fetchChats();},[]);
  useEffect(()=>{
    let ws;
    let tid;
    const connectWS=()=>{
      if(!selectedChat?.room_id)return;
      ws=new WebSocket(`${API_URL.replace("http","ws")}/ws/chat/${selectedChat.room_id}/`);
      ws.onmessage=(e)=>{
        const data=JSON.parse(e.data);
        setMessages(prev=>[...prev,data]);
      };
      ws.onclose=()=>{
        tid=setTimeout(connectWS,3000);
      };
    };
    if(selectedChat?.room_id){
      fetchMessages(selectedChat.application_id);
      connectWS();
    }
    return()=>{
      if(ws)ws.close();
      if(tid)clearTimeout(tid);
    };
  },[selectedChat?.room_id]);
  const fetchChats=async()=>{
    try{
      const res=await api.get("/api/chat/user-list/",
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );
      setChats(res.data);
    }catch(err){
      console.log(err);
    }
  };
  const fetchMessages=async(applicationId)=>{
    try{
      const roomRes=await api.get(`/api/chat/room/${applicationId}/`,
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );
      setSelectedChat(prev=>({...prev,room_id:roomRes.data.room_id,is_closed:roomRes.data.is_closed,rating:roomRes.data.rating}));
      setMessages(roomRes.data.messages);
    }catch(err){
      console.log(err);
    }
  };
  const sendMessage=async()=>{
    if(!newMessage.trim()||!selectedChat?.room_id){
      return;
    }
    try{
      await api.post("/api/chat/send/",
        {
          room_id:selectedChat.room_id,
          message:newMessage
        },
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );
      setNewMessage("");
    }catch(err){
      console.log(err);
    }
  };
  const submitRating=async()=>{
    if(!rating||!selectedChat?.room_id){
      return;
    }
    try{
      await api.post("/api/chat/close-chat/",
        {
          room_id:selectedChat.room_id,
          rating:rating,
          suggestions:suggestions
        },
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );
      setSelectedChat(prev=>({...prev,rating:rating}));
      fetchChats();
    }catch(err){
      console.log(err);
    }
  };
  return(
    <UserLayout>
      <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6">
        <div className={`w-full lg:w-[340px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${showChatMobile ? 'hidden lg:block' : 'block'}`}>
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900">
              User Chats
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Active Conversations
            </p>
          </div>
          <div className="overflow-y-auto h-[calc(100%-90px)]">
            {chats.map(chat=>(
              <div
              key={chat.application_id}
              onClick={()=>{setSelectedChat(chat);setShowChatMobile(true);}}
              className={`p-5 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${
                selectedChat?.application_id===chat.application_id?"bg-teal-50 border-r-4 border-r-teal-500":""}`}>
                <h3 className="font-bold text-slate-800">
                  {chat.manager}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {chat.job_title}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className={`flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col ${showChatMobile ? 'flex' : 'hidden lg:flex'}`}>
          {!selectedChat?(
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900">
                  Recruiter Communication
                </h2>
                <p className="text-slate-500 mt-3">
                  Open a conversation to continue recruitment process
                </p>
              </div>
            </div>
          ):(
            <>
              <div className="p-6 border-b border-slate-100">
                <button onClick={() => setShowChatMobile(false)} className="lg:hidden mb-4 flex items-center gap-2 text-xs font-bold text-teal-600 hover:underline">← Back to Chats</button>
                <h2 className="text-xl font-bold text-slate-800">
                  {selectedChat.manager}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedChat.job_title}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.map(msg=>(
                  <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender===selectedChat.manager?"justify-start":"justify-end"}`}>
                    <div
                    className={`max-w-[70%] px-5 py-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                      msg.sender===selectedChat.manager?"bg-white text-slate-700":"bg-primary text-white"}`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              {selectedChat.is_closed ? (
                selectedChat.rating ? (
                  <div className="p-10 text-center bg-slate-50 border-t border-slate-100">
                    <p className="text-slate-500 font-bold">This chat has been closed and rated.</p>
                  </div>
                ) : (
                  <div className="p-10 bg-slate-50 border-t border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Rate your conversation</h3>
                    <div className="flex gap-4 mb-6">
                      {[1,2,3,4,5].map(star=>(
                        <button key={star} onClick={()=>setRating(star)} className={`w-10 h-10 rounded-full font-bold text-lg ${rating===star?'bg-primary text-white':'bg-white text-slate-400 border border-slate-100'}`}>{star}</button>
                      ))}
                    </div>
                    <textarea value={suggestions} onChange={(e)=>setSuggestions(e.target.value)} placeholder="Share your feedback..." className="w-full p-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-teal-400 mb-4 h-24 resize-none"/>
                    <button onClick={submitRating} className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-secondary transition-all">Submit & Close</button>
                  </div>
                )
              ) : (
                <div className="p-5 border-t border-slate-100 flex gap-4">
                  <input
                  type="text"
                  value={newMessage}
                  onChange={(e)=>setNewMessage(e.target.value)}
                  placeholder="Reply to recruiter..."
                  className="flex-1 px-6 py-4 bg-white text-slate-900 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-teal-400"/>
                  <button
                  onClick={sendMessage}
                  className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-secondary transition-all">
                    Send
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
