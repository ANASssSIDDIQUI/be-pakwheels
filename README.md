# 🚗 Mini Car Listing App

A lightweight **React + Tailwind** web app for searching and viewing car listings with filters like city, make/model, and price — inspired by PakWheels. Backend served via Express and JSON.

---

## 📁 Folder Structure

```
├── fe-pakwheels   # Frontend (React + Tailwind CSS)
└── be-test        # Backend (Express + Fake JSON API)
```

---

## Features

- Filter cars by make/model, city, price range
- Dynamic results with backend filtering
- Car detail view with routing
- Add Car option
- Styled with Tailwind CSS
- Basic Express server with JSON data

---

## 🔧 Tech Stack

| Frontend  | Backend   |
|-----------|-----------|
| React.js  | Node.js + Express |
| Tailwind CSS | JSON file-based data |
| Axios     | CORS + Body-parser |

---

## 🚀 Getting Started

### Clone the Repo

```bash
git clone https://github.com/your-username/mini-car-listing-app.git
cd mini-car-listing-app
```

---

### ▶️ Start Backend (`be-test`)

```bash
cd be-test
npm install
npm start
# runs on http://localhost:3000
```

---

### 💻 Start Frontend (`fe-pakwheels`)

```bash
cd ../fe-pakwheels
npm install
npm run dev
# runs on http://localhost:5173 (Vite default)
```

---

## 🎬 Demo Video

📽️ [Click here to watch the demo video](https://drive.google.com/file/d/1sURC0Fi6y-uq_zUtLuDBXif0tAOACwjH/view?usp=sharing)

---

## 📦 Example Car Object

```json
{
  "id": 1,
  "make": "Suzuki",
  "model": "Alto",
  "year": 2022,
  "price": 1500000,
  "location": "Karachi",
  "condition": "Used",
  "image": "https://example.com/suzuki.jpg"
}
```

## 🪪 License

MIT © 2025
