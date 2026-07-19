# 🍌 BananaStocks Server

Backend API for **BananaStocks**, an AI-powered application that explains stock market concepts using simple and entertaining banana farm analogies.

This server handles requests from the frontend, communicates with the AI model, and returns beginner-friendly explanations of stocks, investing concepts, and financial news.

---

## 🚀 Features

- REST API built with Express.js
- AI-powered stock explanations
- Secure environment variable configuration
- CORS support for frontend communication
- JSON request/response handling
- Lightweight and easy to deploy

---

## 🛠 Tech Stack

- Node.js
- Express.js
- JavaScript
- dotenv
- CORS
- AI API Integration

---

## 📁 Project Structure

```
bananastocks-server/
├── routes/
├── controllers/
├── .env
├── server.js
├── package.json
└── README.md
```

*(Structure may vary depending on future updates.)*

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/joyaljaimon/bananastocks-server.git
```

Navigate into the project:

```bash
cd bananastocks-server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
AI_API_KEY=your_api_key_here
PORT=5000
```

Start the development server:

```bash
npm run dev
```

or

```bash
npm start
```

The server will run on:

```
http://localhost:5000
```

---

## 🔗 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/...` | Sends a stock-related prompt to the AI and returns a simplified explanation |

---

## 🔒 Environment Variables

| Variable | Description |
|----------|-------------|
| `AI_API_KEY` | API key for the language model |
| `PORT` | Server port (default: 5000) |

---

## 💻 Frontend Repository

The frontend for this project is available here:

**https://github.com/joyaljaimon/bananastocks**

---

## 📌 Purpose

This backend exists to provide a clean API layer between the BananaStocks frontend and the AI model. It handles prompt processing, API communication, and response formatting while keeping sensitive API keys secure on the server.

---

## 📄 License

This project is licensed under the MIT License.

---

Built with 🍌 using Node.js and Express.
