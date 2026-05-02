import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router";
import AppRoutes from './config/routes.jsx';
import './index.css'
import { Toaster } from 'react-hot-toast';
import { ChatProvider } from './context/chatContext.jsx';
import { createRoomApi } from './services/RoomService.js';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <Toaster />
      <ChatProvider>
        <AppRoutes />
      </ChatProvider>
    </BrowserRouter>
)
