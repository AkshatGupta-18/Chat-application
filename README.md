# 💬 Real-Time Chat Application

A full-stack real-time chat application built using the MERN stack with WebSocket integration for instant messaging and typing indicators.

## 🚀 Live Demo
🔗 https://akshatgupta-chat-application-74vyykfk4.vercel.app/

## 📂 GitHub Repository
🔗 https://github.com/AkshatGupta-18/Chat-application

---

## ✨ Features

- 🔐 User Authentication (JWT-based)
- 💬 Real-time messaging using WebSockets
- ⌨️ Typing indicators
- 🟢 Online/offline user status (if implemented)
- ⚡ Fast and responsive UI
- 🔒 Protected routes using auth middleware

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Tailwind CSS (or your CSS framework)

**Backend:**
- Node.js
- Express.js
- Socket.IO (WebSockets)

**Database:**
- MongoDB

**Deployment:**
- Vercel (Frontend)
- Render / Other (Backend)

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/AkshatGupta-18/Chat-application
cd Chat-app
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start backend server:

```bash
npm start
```

---

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Make sure to configure:

- `MONGO_URI`
- `JWT_SECRET`
- `PORT`

---


## 🧠 What I Learned

- Implementing real-time communication using WebSockets
- Managing authentication securely with JWT
- Handling state and UI updates for live chat
- Deploying full-stack applications

---

## 📬 Contact

If you have any feedback or suggestions, feel free to reach out!
