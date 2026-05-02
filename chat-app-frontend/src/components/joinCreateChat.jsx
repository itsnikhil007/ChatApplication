import React from 'react'
import chatIcon from "../assets/chat.png";
import { useState } from 'react';
import toast from 'react-hot-toast';
import { createRoomApi } from '../services/RoomService';
import useChatContext from '../context/chatContext';
import { useNavigate } from "react-router-dom";
// import { checkUserExists } from '../services/RoomService';
// import { userLeave } from '../services/RoomService';
import { joinUserApi  } from '../services/RoomService';
import { getRoomDetails } from '../services/RoomService';

const JoinCreateChat = () => {

  const [detail, setDetails] = useState({
    roomId: "room2",
    userName: "Anonymous",
  })

  const { roomId, setRoomId, currentUser, setCurrentUser, connected, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event){
    setDetails({
      ...detail,
      [event.target.name]: event.target.value.toLowerCase().replace(/\s/g, ""),
    })
  }

  function validateForm(){
    if((detail.userName.trim() === "" || detail.roomId.trim() === "")){
      toast.error("Please enter both name and room ID");
      return false;
    }
    return true;
  }


  async function joinChat() {
  if (!validateForm()) return;

  const roomId = detail.roomId.trim();
  const userName = detail.userName.trim();

  try {
    const room = await joinUserApi(roomId, userName);

    toast.success("Joined room successfully!");
    setRoomId(room.roomId);
    setCurrentUser(userName);
    setConnected(true);
    navigate("/chat");

  } catch (error) {
    if (error.response?.status === 409) {
      toast.error("Username already taken!");
    } else if (error.response?.status === 404) {
      toast.error("Room not found!");
    } else {
      console.error(error);
      toast.error("Something went wrong");
    }
  }
}

  async function createRoom(){
    if(validateForm()){
      // toast.success("Room created! Joining now...");
      console.log(detail);
      try {
        const response = await createRoomApi(detail);
        console.log(response);
        toast.success("Room created! Joining now...");
        setRoomId(response.roomId);
        setCurrentUser(detail.userName);
        setConnected(true);
        // joinChat();

        navigate("/chat");

      } catch (error) {
        if(error.response?.status === 400){
          toast.error(error.response.data.message || "Room ID already exists!!");
        } else {
          console.error("Error creating room:", error);
          toast.error("Failed to create room. Please try again.");
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4 transition-colors duration-300">
      <div className="w-full max-w-md">

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg shadow-gray-200/60 dark:shadow-none overflow-hidden">

          <div className="h-1 w-full bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 dark:from-gray-700 dark:via-gray-500 dark:to-gray-700" />

          <div className="p-8 flex flex-col gap-6">

            <div className="flex flex-col items-center gap-3">
              <div >
                <img src={chatIcon} className="w-18 h-18 object-contain" alt="Chat" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                  Join or Create a Room
                </h1>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Enter your details to get started
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800" />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500"
              >
                Your Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-sm select-none">
                  ✦
                </span>
                <input
                  onChange={handleFormInputChange}
                  value={detail.userName}
                  type="text"
                  id="name"
                  name="userName"
                  maxLength={20}
                  minLength={3}
                  required
                  placeholder="e.g. Nikhil"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="roomId"
                className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500"
              >
                Room ID
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-sm select-none">
                  ⬡
                </span>
                <input
                  name="roomId"
                  onChange={handleFormInputChange}
                  value={detail.roomId}
                  type="text"
                  id="roomId"
                  maxLength={15}
                  minLength={3}
                  required
                  placeholder="Enter or create a room ID"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button onClick={joinChat}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 hover:border-gray-400 dark:hover:border-gray-600 active:scale-[0.98] transition-all duration-150"
              >
                Join Room
              </button>
              <button onClick={createRoom}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 active:scale-[0.98] transition-all duration-150"
              >
                Create Room
              </button>
            </div>

          </div>

          <div className="px-8 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-center text-gray-400 dark:text-gray-600">
              No account needed · Rooms are session-based
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default JoinCreateChat