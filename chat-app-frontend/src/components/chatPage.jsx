import React, { useState, useRef, useEffect } from 'react';
import { MdAttachFile, MdEmojiEmotions, MdSend } from 'react-icons/md';
import useChatContext from '../context/chatContext';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { baseURL } from '../config/AxiosHelper';
import Stomp from 'stompjs';
import toast from 'react-hot-toast';
import { getMessagess } from '../services/RoomService';
import { timeAgo } from '../config/helper';
import { formatDayLabel } from '../config/helper';
import { userLeave } from '../services/RoomService';
import { getRoomDetails } from '../services/RoomService';
import axios from 'axios';
import { getActiveUser } from '../services/RoomService';
import EmojiPicker from 'emoji-picker-react';

const AVATAR_COLORS = [
  "bg-teal-950 text-teal-300",
  "bg-purple-950 text-purple-300",
  "bg-orange-950 text-orange-300",
  "bg-pink-950 text-pink-300",
  "bg-indigo-950 text-indigo-300",
  "bg-yellow-950 text-yellow-300",
  "bg-rose-950 text-rose-300",
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function isNewGroup(prevMsg, currMsg, gapMinutes = 1) {
  if (!prevMsg || prevMsg.sender !== currMsg.sender) return true;
  const diff = new Date(currMsg.timestamp) - new Date(prevMsg.timestamp);
  return diff > gapMinutes * 60 * 1000;
}

const ChatPage = () => {

  const { roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser } = useChatContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!connected) navigate("/");
  }, [connected, roomId, currentUser]);

  const [darkMode, setDarkMode] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activeUsers, setActiveUsers] = useState([]); 
  const inputRef = useRef(null);
  const chatBoxRef = useRef();
  const [stompClient, setStompClient] = useState();
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef();

  //Add close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target) && !inputRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function loadRoomDetails() {
      try {
        const room = await getRoomDetails(roomId);
        setActiveUsers(room.activeUsers || []);
      } catch (error) {
        console.error("Error loading room details:", error);
      }
    }
    if (connected) loadRoomDetails();
  }, []);

  useEffect(() => {
    async function loadMessages() {
      try {
        const messagesData = await getMessagess(roomId);
        setMessages(
          messagesData.map(msg => ({
            ...msg,
            mine: msg.sender.trim().toLowerCase() === currentUser.trim().toLowerCase()
          }))
        );
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load messages. Please try again.");
      }
    }
    if (connected) loadMessages();
  }, []);

  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);
      client.debug = null;

      client.connect({ roomId: roomId, userName: currentUser }, () => {
        console.log("Connected to chat server!");
        setStompClient(client);
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const msg = JSON.parse(message.body);
          setMessages((prev) => [...prev, { ...msg, mine: msg.sender === currentUser }]);
        });

        //subscribe to active users updates
        client.subscribe(`/topic/room/${roomId}/users`, (message) => {
          const users = JSON.parse(message.body);
          setActiveUsers(users);
        });

      client.send(`/app/getUsers/${roomId}`, {}, JSON.stringify({}));

      });
    };
    if (connected) connectWebSocket();
  }, [roomId]);

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      const message = { sender: currentUser, content: input.trim(), roomId };
      stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
      setInput("");
      const el = chatBoxRef.current;
      if (el) el.scroll({ top: el.scrollHeight, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    const el = chatBoxRef.current;
    if (!el) return;
    setShouldAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 50);
  };

  useEffect(() => {
    const el = chatBoxRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [roomId]);

  useEffect(() => {
    const el = chatBoxRef.current;
    if (!el) return;
    if (shouldAutoScroll) el.scroll({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleLogout() {
    userLeave(roomId, currentUser);
    stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
    toast.success("You have left the room.");
  }

  //check if a user is online
  function isOnline(senderName) {
    return activeUsers.some(
      (u) => u.trim().toLowerCase() === senderName.trim().toLowerCase()
    );
  }

  //if user diconnect then need to fix the online status like 
  useEffect(() => {
  if (!connected) return;
  const interval = setInterval(async () => {
    const room = await getActiveUser(roomId);
    setActiveUsers(room || []);
  }, 10000);
  return () => clearInterval(interval);
}, [roomId, connected]);

  const t = {
    pageBg:           darkMode ? "bg-gray-950"    : "bg-gray-100",
    cardBg:           darkMode ? "bg-gray-950"    : "bg-[#fafafa]",
    cardBorder:       darkMode ? "border-gray-800" : "border-gray-200",
    headerBg:         darkMode ? "bg-gray-900"    : "bg-white",
    headerBorder:     darkMode ? "border-gray-800" : "border-gray-200",
    roomName:         darkMode ? "text-gray-200"   : "text-gray-800",
    roomIdText:       darkMode ? "text-gray-600"   : "text-gray-400",
    roomIdBg:         darkMode ? "bg-gray-800"     : "bg-gray-100",
    roomIdBorder:     darkMode ? "border-gray-700" : "border-gray-200",
    pillBg:           darkMode ? "bg-gray-800"     : "bg-gray-100",
    pillBorder:       darkMode ? "border-gray-700" : "border-gray-200",
    pillText:         darkMode ? "text-gray-400"   : "text-gray-600",
    membersBarBg:     darkMode ? "bg-gray-950"     : "bg-gray-50",
    membersBarBorder: darkMode ? "border-gray-800" : "border-gray-200",
    membersLabel:     darkMode ? "text-gray-700"   : "text-gray-400",
    membersName:      darkMode ? "text-gray-500"   : "text-gray-500",
    dividerLine:      darkMode ? "bg-gray-800"     : "bg-gray-200",
    dividerText:      darkMode ? "text-gray-500"   : "text-gray-400",
    themBubble:       darkMode ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-100 border-gray-200 text-gray-700",
    mineBubble:       darkMode ? "bg-blue-950 border-blue-900 text-gray-200" : "bg-blue-100 border-blue-200 text-blue-900",
    senderName:       darkMode ? "text-gray-500"   : "text-gray-400",
    timeText:         darkMode ? "text-gray-600"   : "text-gray-400",
    inputBarBg:       darkMode ? "bg-gray-900"     : "bg-white",
    inputBarBorder:   darkMode ? "border-gray-800" : "border-gray-200",
    inputBg:          darkMode ? "bg-gray-800"     : "bg-gray-100",
    inputBorder:      darkMode ? "border-gray-700" : "border-gray-200",
    inputText:        darkMode ? "text-gray-200"   : "text-gray-800",
    inputPlaceholder: darkMode ? "placeholder-gray-600" : "placeholder-gray-400",
    inputFocus:       darkMode ? "focus:border-gray-600" : "focus:border-gray-400",
    attachBg:         darkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-gray-100 border-gray-200 hover:bg-gray-200",
    attachIcon:       darkMode ? "text-gray-500"   : "text-gray-400",
    sendBg:           darkMode ? "bg-green-950 border-green-900 hover:bg-green-900" : "bg-green-100 border-green-200 hover:bg-green-200",
    sendIcon:         darkMode ? "text-green-400"  : "text-green-600",
    dotBorder:        darkMode ? "border-gray-950" : "border-gray-50",
  };

  const renderItems = [];
  messages.forEach((msg, index) => {
    const currentDay = formatDayLabel(msg.timestamp);
    const prevDay = index > 0 ? formatDayLabel(messages[index - 1].timestamp) : null;
    if (currentDay !== prevDay) {
      renderItems.push({ type: "divider", label: currentDay, key: `divider-${index}` });
    }
    const nextMsg = messages[index + 1] || null;
    const prevMsg = messages[index - 1] || null;
    const isLastInGroup = !nextMsg || isNewGroup(msg, nextMsg);
    const isSameAsPrev  = !!prevMsg && !isNewGroup(prevMsg, msg);
    renderItems.push({ type: "message", msg, index, isLastInGroup, isSameAsPrev, key: `msg-${index}` });
  });

  return (
    <div className={`min-h-screen ${t.pageBg} flex items-center justify-center p-4 `}>
      <div className={`w-full max-w-6xl ${t.cardBg} border ${t.cardBorder} rounded-2xl overflow-hidden flex flex-col h-[800px] sm:h-[700px]`}>


        {/* Header */}
        <div className="fixed top-0 left-[16px] right-[16px] z-30 rounded-t-xl sm:rounded-none overflow-hidden sm:static">
        <div>
        <div className={`${t.headerBg} border-b ${t.headerBorder} px-3 pr-2 sm:px-5 h-14 flex items-center justify-between flex-shrink-0 top-0 left-0 right-0 z-10 sm:static sm:top-auto sm:left-auto sm:right-auto`}>
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className={`text-sm font-medium ${t.roomName}`}>General Chat</span>
            <span className={`text-xs ${t.roomIdText} ${t.roomIdBg} border ${t.roomIdBorder} rounded-md ml-1 px-1.5 py-0.5`}>
              {roomId}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={` text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border transition-colors flex gap-1 ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
                  : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {darkMode ? "☀ " : "☾ "}
              <span className="hidden sm:block">{darkMode ? "light " : "Dark "}</span>
            </button>

            <div className={`flex items-center gap-1.5 sm:gap-2 ${t.pillBg} border ${t.pillBorder} rounded-full px-2 sm:px-3 py-1`}>
              <div className="relative">
                <div className="w-4 h-4   sm:w-5 sm:h-5 rounded-full bg-purple-900 flex items-center justify-center text-purple-300 text-[8px] sm:text-xs font-medium">
                  {currentUser.slice(0, 2).toUpperCase()}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 border ${t.dotBorder}`} />
              </div>
              <span className={`text-xs ${t.pillText} max-w-[45px] overflow-hidden  truncate whitespace-nowrap`}>{currentUser}</span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-950 border  border-red-900 text-red-400 text-xs px-3 py-1.5 rounded-lg hover:bg-red-900 transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
        </div>

        <div>

        {/* Active members bar */}
        {activeUsers.length > 0 && (
  <div
    className={`${t.membersBarBg} border-b ${t.membersBarBorder} px-5 py-1.5 flex items-center gap-2 flex-shrink-0 border`}
    
  >
    <div className="flex justify-between w-full ">

  <div className="flex items-center gap-2 min-w-0 ">
    <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    <span className={`text-xs ${t.membersLabel} shrink-0 mr-[10px]`}>Online : </span>
    {/* Removed: overflow-x-auto and w-full from here */}
    <div className="flex items-center gap-3 overflow-x-auto py-1"
    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      {activeUsers.map((user, i) => (
        <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
          <div className="relative">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${getAvatarColor(user)} flex-nowrap`}
              style={{ fontSize: "8px" }}
            >
              {user.slice(0, 2).toUpperCase()}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-500 border ${t.dotBorder}`} />
          </div>
          <span className={`text-xs ${t.membersName} max-w-[70px] overflow-hidden truncate whitespace-nowrap`}>{user}</span>
          {i < activeUsers.length - 1 && (
            <span className={`text-xs ${t.membersLabel}`}>·</span>
          )}
        </div>
      ))}
    </div>
  </div>

      <div className="shrink-0 text-end">
        <span className={`text-xs ${t.membersLabel} ml-[20px]`}>Total : {activeUsers.length}</span>
      </div>
  </div>
  </div>
)}

</div>
</div>


        {/* Messages */}
        <div
          ref={chatBoxRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto mt-17 sm:mt-0 px-5 py-5 flex flex-col gap-1"
        >
          {renderItems.map((item) => {
            if (item.type === "divider") {
              return (
                <div key={item.key} className="flex items-center gap-3 mb-4">
                  <div className={`flex-1 h-px ${t.dividerLine}`} />
                  <span className={`text-xs font-medium ${t.dividerText} tracking-widest uppercase px-2`}>
                    {item.label}
                  </span>
                  <div className={`flex-1 h-px ${t.dividerLine}`} />
                </div>
              );
            }

            const { msg, index, isLastInGroup, isSameAsPrev } = item;
            const avatarColor = msg.mine ? "bg-purple-950 text-purple-300" : getAvatarColor(msg.sender);
            const online = isOnline(msg.sender); 

            return (
              <div
                key={item.key}
                className={`flex gap-2.5 items-center ${msg.mine ? "flex-row-reverse" : ""} ${isSameAsPrev ? "mt-0.5" : "mt-3"}`}
              >
                {isLastInGroup ? (
                  // avatar with green dot
                  <div className="relative flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${avatarColor}`}>
                      {msg.sender.slice(0, 2).toUpperCase()}
                    </div>
                    {online && (
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 ${t.dotBorder}`} />
                    )}
                  </div>
                ) : (
                  <div className="w-7 flex-shrink-0" />
                )}

                <div
                  className={`flex flex-col gap-1 ${msg.mine ? "items-end" : "items-start"}`}
                  style={{ maxWidth: "min(320px, 65%)" }}
                >
                  {!msg.mine && !isSameAsPrev && (
                    <span className={`text-xs ${t.senderName} px-1 truncate max-w-full`}>
                      {msg.sender}
                    </span>
                  )}
                  <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed border break-words w-fit max-w-full ${
                    msg.mine
                      ? `${t.mineBubble} rounded-br-sm`
                      : `${t.themBubble} rounded-bl-sm`
                  }`}>
                    {msg.content}
                  </div>
                  {isLastInGroup && (
                    <span className={`text-xs ${t.timeText} px-1`}>
                      {timeAgo(msg.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input bar */}
        <div
  className={`relative border-t ${t.inputBarBorder} ${t.inputBarBg} px-4 py-3 flex items-center gap-3 flex-shrink-0`}
>
  <input
    ref={inputRef}
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") sendMessage();
    }}
    type="text"
    placeholder="Type a message..."
    className={`flex-1 ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-sm ${t.inputText} ${t.inputPlaceholder} focus:outline-none ${t.inputFocus} transition-colors`}
  />

  {showPicker && (
    <div
      ref={pickerRef}
      className="absolute bottom-full mb-2 right-2 z-50"
    >
      <EmojiPicker
      autoFocusSearch={false}
        theme={darkMode ? "dark" : "light"}
        onEmojiClick={(emojiData) => {
          setInput((prev) => prev + emojiData.emoji);
        }}
      />
    </div>
  )}

  <button
    onClick={() => setShowPicker((prev) => !prev)}
    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors flex-shrink-0 ${t.attachBg}`}
  >
    <MdEmojiEmotions size={16} className={t.attachIcon} />
  </button>

  <button
    onClick={sendMessage}
    className={`w-9 h-9 rounded-xl border flex items-center justify-center active:scale-95 transition-all flex-shrink-0 ${t.sendBg}`}
  >
    <MdSend size={16} className={t.sendIcon} />
  </button>
</div>

      </div>
    </div>
  );
};

export default ChatPage;