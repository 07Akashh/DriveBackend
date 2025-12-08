# 🚀 Cloud Drive Backend - Setup Guide

This guide will walk you through setting up the Cloud Drive Backend on your local machine or server.

## Prerequisites

- **Node.js** v18.x or higher
- **npm** v9.x or higher
- **MongoDB** database (local or Atlas)
- **Redis** server (local or cloud)
- **Firebase** project with Authentication enabled
- **Cloudinary** account for file storage

---

## 📦 Step 1: Install Dependencies

```bash
npm install
```

---

## 🔐 Step 2: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Fill in the required values (see sections below for details).

---

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Navigate to **Project Settings** → **Service Accounts**
4. Click **Generate new private key**
5. Download the JSON file
6. Convert to base64:

```bash
# macOS/Linux
base64 -i serviceAccountKey.json

# Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("serviceAccountKey.json"))
```

7. Set `FIREBASE_SERVICE_ACCOUNT_BASE64` in your `.env` file

---

## ☁️ Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to **Dashboard**
3. Copy the following values to your `.env`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

---

## 🍃 MongoDB Setup

### Option A: MongoDB Atlas (Cloud)

1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write permissions
3. Whitelist your IP address
4. Set in `.env`:
   - `MONGODB_NAME` - Your database name
   - `MONGO_USERNAME` - Database username
   - `MONGO_PASS` - Database password

### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Configure credentials in `.env`

---

## 🔴 Redis Setup

### Option A: Redis Cloud

1. Create an account at [Redis Cloud](https://redis.com/try-free/)
2. Create a new database
3. Set in `.env`:
   - `REDIS_SERVER` - Redis host
   - `REDIS_PORT` - Redis port
   - `REDIS_USERNAME` - Redis username
   - `REDIS_PASS` - Redis password

### Option B: Local Redis

```bash
# macOS
brew install redis
brew services start redis

# Docker
docker run -d -p 6379:6379 redis
```

---

## 🔒 Security Configuration

### JWT Secret

Generate a strong secret key:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Set `JWT_SECRET_KEY` in your `.env`.

### Basic Auth

Set `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASS` for API protection.

---

## ▶️ Step 3: Start the Server

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

Server will start on `http://localhost:8080` (or your configured PORT).

---

## 🐳 Docker Deployment

```bash
# Build the image
docker build -t cloud-drive-backend .

# Run the container
docker run -d -p 8080:8080 --env-file .env cloud-drive-backend
```

---

## ✅ Verify Installation

1. Server health check:

```bash
curl http://localhost:8080/api/v1/health
```

2. Check logs for successful connections:
   - MongoDB connected
   - Redis connected
   - Firebase initialized

---

## 🔧 Troubleshooting

### MongoDB Connection Failed

- Verify credentials in `.env`
- Check if IP is whitelisted (Atlas)
- Ensure MongoDB service is running

### Redis Connection Failed

- Verify Redis server is running
- Check port and credentials

### Firebase Auth Error

- Ensure base64 encoding is correct
- Verify service account has proper permissions

### Cloudinary Upload Issues

- Verify API key and secret
- Check upload preset settings

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
