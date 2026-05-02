# 🚀 ChatApplication

> **Full-stack real-time chat application** built with React, Spring Boot, WebSockets, and MongoDB.

A scalable, room-based chat system where users can create or join rooms, send live messages, view chat history, and track active users in real time.

---

## ✨ Key Highlights

* ⚡ Real-time messaging using **WebSocket + STOMP**
* 🧠 Clean separation of **REST + WebSocket architecture**
* 👥 Room-based chat with **active user tracking**
* 📜 Paginated message history (MongoDB)
* 🎨 Modern UI with **dark/light mode + emoji support**
* 🔁 Low-latency communication with **SockJS fallback**

---

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite
* Tailwind CSS
* React Router

### Backend

* Java 21
* Spring Boot
* Spring WebSocket
* Spring Data MongoDB

### Database

* MongoDB

### Communication

* REST APIs
* WebSocket
* STOMP Protocol
* SockJS

### Tools

* Axios
* stompjs
* sockjs-client
* emoji-picker-react
* Docker

---

## 🧱 Architecture

```text
Frontend (React)
   |
   |--- REST APIs ---> Spring Boot Backend ---> MongoDB
   |
   |--- WebSocket (SockJS)
            |
            ---> STOMP Broker
                    |
                    ---> /topic/room/{roomId}
```

---

## 📂 Project Structure

```text
ChatApplication/
 ├── chat-app-backend/   # Spring Boot backend
 └── chat-app-frontend/  # React frontend
```

---

## ⚙️ Setup Guide

### 1️⃣ Clone Repository

```bash
git clone https://github.com/<your-username>/ChatApplication.git
cd ChatApplication
```

---

### 2️⃣ Run Backend

```bash
cd chat-app-backend
./mvnw spring-boot:run
```

👉 Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

---

### 3️⃣ Run Frontend

```bash
cd chat-app-frontend
npm install
npm run dev
```

🌐 Runs at:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend

```env
MONGO_URI=mongodb://localhost:27017/chatapp
FRONTEND_URL=http://localhost:5173
```

---

### Frontend

```env
VITE_API_URL=http://localhost:8080
```

---

## 📡 API Endpoints

| Method | Endpoint                                        | Description     |
| ------ | ----------------------------------------------- | --------------- |
| POST   | `/api/v1/rooms`                                 | Create room     |
| GET    | `/api/v1/rooms/{roomId}`                        | Get room        |
| POST   | `/api/v1/rooms/{roomId}/users/{userName}/join`  | Join room       |
| DELETE | `/api/v1/rooms/{roomId}/users/{userName}/leave` | Leave room      |
| GET    | `/api/v1/rooms/{roomId}/messages`               | Message history |
| GET    | `/api/v1/rooms/{roomId}/activeUsers`            | Active users    |

---

## 🔌 WebSocket Flow

| Type      | Endpoint                     |
| --------- | ---------------------------- |
| Connect   | `/chat`                      |
| Send      | `/app/sendMessage/{roomId}`  |
| Subscribe | `/topic/room/{roomId}`       |
| Users     | `/topic/room/{roomId}/users` |

---

## 📸 Screenshots

```text
screenshots/
 ├── join-room.png
 ├── chat-room.png
 └── dark-mode.png
```

---

## 🚧 Future Improvements

* 🔐 JWT Authentication
* ⚡ Redis / RabbitMQ broker (scaling)
* 💬 Typing indicators & read receipts
* 📎 File attachments
* 🧪 Integration & WebSocket testing
* 🚀 CI/CD pipeline

---

## 🏆 Resume Impact

* Built a **real-time chat system** using WebSocket + STOMP
* Designed **scalable REST + event-driven architecture**
* Implemented **low-latency messaging with MongoDB persistence**
* Developed **responsive UI with modern UX features**

---

## 📄 License

MIT

---

## 👨‍💻 Author

**Nikhil**
