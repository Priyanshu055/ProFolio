<div align="center">
  
# 🏆 ProFolio
**The Ultimate MERN Stack Competitive Programming Dashboard**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

An aesthetic, high-performance aggregator that consolidates your coding profiles across 8 different platforms into one unified, stunning dashboard. Analyze your weaknesses, track your rating trajectory, and discover upcoming global contests all in one place.

[Features](#features) • [Installation](#installation) • [Tech Stack](#tech-stack) • [Environment Variables](#environment-variables)

</div>

---

## ✨ Features

- **🌐 Unified Global Profiles**: Seamlessly link and track your statistics across **LeetCode, Codeforces, CodeChef, GitHub, GeeksforGeeks, HackerRank, HackerEarth**, and **AtCoder**.
- **⚡ Blazing Fast API Aggregation**: The Node.js backend features a custom Redis-style caching engine (`node-cache`) that drops 8-second global concurrent HTTP pulls down to **~20ms** response times.
- **📈 Past Contest Trajectories**: Visualize your actual rating history using dynamic Recharts Area Graphs.
- **🎯 Weakness Analysis**: Identify your top 4 strongest algorithm topics and the top 4 weaknesses you need to focus on through an interactive Radar analysis structure.
- **📅 Master Contest Calendar**: Stop missing out on competitions. The backend native aggregator compiles every single upcoming global contest for the month into one scrollable, actionable list sorted by date.
- **🔐 Secure Authentication**: Includes full JSON Web Token (JWT) based user session management with `bcryptjs` encryption.
- **🖼️ Real Avatar Uploads**: Complete multi-part `FormData` form processing using `multer` configured to allow users to securely upload actual `.png` and `.jpg` image files to the server.
- **💎 Glassmorphic UI**: A stunning, fully-responsive dashboard built on raw TailwindCSS utilizing modern glassmorphism design principles, custom scrollbars, and floating navigation logic.

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Recharts, Framer Motion, Lucide React
- **Backend**: Node.js, Express.js, Axios (API Aggregation), Node-Cache (In-memory acceleration), Multer (File Uploads)
- **Database**: MongoDB & Mongoose ORM

---

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Priyanshu055/ProFolio.git
   cd ProFolio
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `/backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```
   *Run the server:*
   ```bash
   npm start # or node server.js
   ```

3. **Setup the Frontend**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `/frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
   *Run the Vite dev server:*
   ```bash
   npm run dev
   ```

4. **Access the App**
   Open your browser and navigate to `http://localhost:5173`. Create an account and begin linking your coding profiles!

---

## 📡 Supported External Platforms

The backend natively parses and scrapes external profiles from the following systems:
- `Codeforces` (Full Stats, Past Contests, Live Contests)
- `LeetCode` (GraphQL Problem Breakdown, Past Contests, Live Contests)
- `CodeChef` (Future Contests)
- `HackerEarth` (Future Contests)
- `GitHub` (Repository Contributions)
- `GeeksForGeeks` (Profile Setup)
- `AtCoder` (Profile Setup)
- `HackerRank` (Profile Setup)

---

<div align="center">
  <i>Built with ❤️ for Competitive Programmers.</i>
</div>
