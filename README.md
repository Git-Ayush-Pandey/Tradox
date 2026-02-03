# 🚀 TRADOX — Stock Trading Simulation Platform

Tradox is a full-stack stock trading simulation platform inspired by real-world trading applications like Groww and Zerodha. It allows users to experience the core mechanics of stock trading — including order placement, fund management, holdings, positions, and watchlists — in a realistic, production-style environment.

The project focuses on backend logic, system design, and financial workflows, not just UI.

---

## 🌐 Live Demo

https://tradox-1-9j4m.onrender.com

---

## 🧠 Key Features

- OTP-based Authentication
- Funds Management
- Buy & Sell Order Placement
- Holdings & Positions Tracking
- Watchlist Management
- Auto Square-Off using Cron Jobs
- Automatic Fund & Position Updates
- Order Book & Trade History
- JWT-Protected APIs

---

## 🏗️ Project Architecture

Tradox/
├── backend/        # Node.js + Express backend
│   ├── model/      # MongoDB schemas
│   ├── routes/     # REST API routes
│   ├── util/       # Trading logic & cron jobs
│   ├── middleware/ # JWT authentication
│   └── index.js    # Server entry point
│
├── dashboard/      # React trading dashboard (logged-in users)
│   ├── components/
│   ├── context/
│   └── services/
│
├── frontend/       # Basic public-facing frontend
└── README.md

---

## ⚙️ Tech Stack

### Frontend
- React
- Context API
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Cron Jobs

### Deployment
- Render
- MongoDB Atlas

---

## 🔐 Authentication Flow

1. User enters email
2. OTP is generated and sent
3. OTP verification succeeds
4. JWT token issued
5. Token used to access protected routes

---

## 📊 Trading Logic Overview

- Orders: Buy / Sell orders stored in database
- Holdings: Long-term owned stocks
- Positions: Active or intraday trades
- Funds: Updated automatically after every transaction
- Auto Square-Off: Cron job closes positions at scheduled times

---

## 🚀 Getting Started (Local Setup)

### Clone Repository
git clone https://github.com/Git-Ayush-Pandey/Tradox.git
cd Tradox

### Backend Setup
cd backend
npm install

Create .env file:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

npm start

### Frontend Setup
cd dashboard
npm install
npm start

---

## 👨‍💻 Author

Ayush Pandey  
B.Tech CSE, IIT Jammu  
Aspiring Software Engineer | Full-Stack Developer
