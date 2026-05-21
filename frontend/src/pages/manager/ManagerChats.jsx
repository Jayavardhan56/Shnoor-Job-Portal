import { useEffect,useState } from "react";
import api, { API_URL } from "../../api";
import ManagerLayout from "../../layouts/ManagerLayout";
import { FaTrash } from "react-icons/fa";

export default function ManagerChats(){
    const[chats,setChats]=useState([]);
    const[selectedChat,setSelectedChat]=useState(null);
    const[showChatMobile,setShowChatMobile]=useState(false);
    const[messages,setMessages]=useState([]);
    const[newMessage,setNewMessage]=useState("");
    const token=sessionStorage.getItem("token");
    useEffect(()=>{
        fetchChats();
    },[]);
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
            const res=await api.get("/api/chat/manager-list/",
                {headers:{Authorization:`Bearer ${token}`}}
            );
            setChats(res.data);
        }catch(err){
            console.log(err);
        }
    };
    const fetchMessages=async(application_id)=>{
        try{
            const roomRes=await api.get(`/api/chat/room/${application_id}/`,
                {headers:{Authorization:`Bearer ${token}`}}
            );
            setSelectedChat(prev=>({...prev,room_id:roomRes.data.room_id}));
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
                {room_id:selectedChat.room_id,
                    message:newMessage
                },{
                    headers:{Authorization:`Bearer ${token}`}
                }
            );
            setNewMessage("");
        }catch(err){
            console.log(err);
        }
    };
    const deleteChat=async(roomId)=>{
        if(!window.confirm("Are you sure you want to delete this chat?"))return;
        try{
            await api.post("/api/chat/delete-notification/",{room_id:roomId},{headers:{Authorization:`Bearer ${token}`}});
            fetchChats();
            if(selectedChat?.room_id===roomId){
                setSelectedChat(null);
                setMessages([]);
                setShowChatMobile(false);
            }
        }catch(err){console.log(err);}
    };
    return(
        <ManagerLayout>
        <div className="h-[calc(100vh-40px)] flex flex-col lg:flex-row gap-6">
        <div className={`w-full lg:w-[340px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${showChatMobile ? 'hidden lg:block' : 'block'}`}>
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900">
              Recruiter Chats
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Shortlisted Candidates
            </p>
          </div>
          <div className="overflow-y-auto h-[calc(100%-90px)]">
            {chats.map(chat=>(
              <div
              key={chat.application_id}
              onClick={()=>{setSelectedChat(chat);setShowChatMobile(true);}}
              className={`p-5 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${
                selectedChat?.application_id===chat.application_id
                ?"bg-teal-50 border-r-4 border-r-teal-500"
                :""}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {chat.username}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {chat.job_title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {chat.is_closed?(
                      <span className="px-3 py-1 bg-red-100 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                        Closed
                      </span>
                    ):chat.initiated?(
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                        Active
                      </span>
                    ):(
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                        New
                      </span>
                    )}
                    {chat.is_closed&&(
                      <button onClick={(e)=>{e.stopPropagation();deleteChat(chat.room_id);}} className="text-red-500 hover:text-red-700 transition-all"><FaTrash size={12}/></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col ${showChatMobile ? 'flex' : 'hidden lg:flex'}`}>
          {!selectedChat?(
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900">
                  Recruiter Messaging
                </h2>
                <p className="text-slate-500 mt-3">
                  Select a candidate to start communication
                </p>
              </div>
            </div>
          ):(
            <>
              <div className="p-6 border-b border-slate-100">
                <button onClick={() => setShowChatMobile(false)} className="lg:hidden mb-4 flex items-center gap-2 text-xs font-bold text-[#2E8B87] hover:underline">← Back to Chats</button>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {selectedChat.username}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedChat.job_title}
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-teal-50 text-teal-600 rounded-2xl text-xs font-bold uppercase tracking-widest">
                    Recruiter Chat
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.map(msg=>(
                  <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender===selectedChat.username?"justify-start":"justify-end"}`}>
                    <div
                    className={`max-w-[70%] px-5 py-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                      msg.sender===selectedChat.username?"bg-white text-slate-700":"bg-teal-500 text-white"}`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              {!selectedChat.is_closed?(
                <div className="p-5 border-t border-slate-100 flex gap-4">
                  <input
                  type="text"
                  value={newMessage}
                  onChange={(e)=>setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-6 py-4 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-teal-400"/>
                  <button
                  onClick={sendMessage}
                  className="px-8 py-4 bg-teal-500 text-white rounded-2xl font-bold hover:bg-teal-600 transition-all">
                    Send
                  </button>
                </div>
              ):(
                <div className="p-5 border-t border-slate-100 text-center text-slate-400 font-bold text-sm">
                  Chat closed by user on {selectedChat.closed_at?new Date(selectedChat.closed_at).toLocaleString():new Date(selectedChat.latest_time).toLocaleString()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ManagerLayout>
    );
}
