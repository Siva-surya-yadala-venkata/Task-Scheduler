# 🚀 Task Scheduler & Personal Planner

A powerful, full-stack MERN application designed to help you never miss a beat. Whether it's a critical meeting, a simple reminder, or a scheduled email, this app handles it all—even when you're offline.

---

## 🌟 Key Features

*   **📅 Google Calendar Integration**: Automatically syncs your meetings and reminders to your personal Google Calendar.
*   **📧 Smart Email Scheduling**: Send emails directly from your own Gmail account using OAuth2 delegation or a custom SMTP setup.
*   **💬 Custom Notifications**: Personalize every alert with a custom message body.
*   **🔔 Real-time Alerts**: Get instant browser notifications and visual "Nearly due" indicators.
*   **📴 Offline First**: Uses IndexedDB to cache your tasks so you can browse and plan even without an internet connection.
*   **📱 Simulated SMS**: Reminders are logged to the server console, simulating a real SMS service.

---

## 🛠️ Technical Stack

*   **Frontend**: React (Vite), CSS3, IndexedDB.
*   **Backend**: Node.js, Express, Mongoose (MongoDB).
*   **Automation**: `node-cron` for background job execution.
*   **Mailing**: `nodemailer` with individual SMTP support and Google OAuth2 fallback.

---

## ⚙️ The "Secret Sauce": Setting Up Google Integrations

This is the most critical part to get the app running. Follow these human-friendly steps to unlock the full power of the app.

### 1. Google Cloud Console (The Brain)
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project named "Task Scheduler".
3.  **Crucial**: Enable the following APIs:
    *   **Google Calendar API** [Enable Link](https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview)
    *   **Gmail API** [Enable Link](https://console.developers.google.com/apis/api/gmail.googleapis.com/overview)
4.  Go to **APIs & Services > OAuth Consent Screen**:
    *   Choose "External".
    *   **Test Users**: Add your email and any other emails you want to test with. (Gmail will reject any user not on this list!).
5.  Go to **Credentials**:
    *   Create **OAuth 2.0 Client ID** (Web Application).
    *   Add `http://localhost:5000/api/calendar/callback` to **Authorized Redirect URIs**.
    *   Copy your **Client ID** and **Client Secret**.

### 2. Email Sending (The Voice)
To send emails from your own account safely, you need a **Gmail App Password**.
1.  Go to your [Google Account > Security](https://myaccount.google.com/security).
2.  Enable **2-Step Verification**.
3.  Search for **"App passwords"**.
4.  Generate a 16-character code and save it. You'll need this in the app's `Email` form field.

---

## 🚀 Getting Started

### Backend Setup
1.  Navigate to `/server`.
2.  Install dependencies: `npm install`.
3.  Create a `.env` file (refer to `.env.example` in the root).
4.  Start server: `nodemon index.js`.

### Frontend Setup
1.  Navigate to `/client`.
2.  Install dependencies: `npm install`.
3.  Start dev server: `npm run dev`.

---

## 💡 Developer Note for Interviewers
This project was built to demonstrate **real-world integration challenges**—specifically handling complex OAuth flows, managing token persistence in MongoDB, and implementing a reliable background task scheduler. The inclusion of IndexedDB ensures high availability, while the granular SMTP configuration shows a deep understanding of secure mailing protocols.

**Happy Planning!** 🥂
