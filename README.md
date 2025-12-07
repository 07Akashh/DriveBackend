# Cloud Drive Backend

A secure, scalable cloud storage backend built with Node.js, Express, and MongoDB. Features real-time file uploads via Socket.IO and Cloudinary integration for file storage.

## 🚀 Features

- **Authentication**: Firebase Authentication with JWT token support
- **File Management**: Upload, download, delete, and restore files
- **Real-time Uploads**: Socket.IO powered chunked file uploads with progress tracking
- **File Sharing**: Share files with specific users or generate public links
- **Access Control**: Role-based permissions (view/edit) with expiry dates
- **Trash System**: Soft delete with restore and permanent delete options
- **Stream Proxy**: Secure file streaming without exposing Cloudinary URLs
- **Audit Logging**: Track file access and modifications

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Firebase Admin SDK + JWT
- **File Storage**: Cloudinary
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Basic Auth middleware

## 📁 Project Structure

```
src/
├── config/           # Express and app configuration
├── middleware/       # Authentication and other middleware
├── modules/
│   ├── media/        # File management (routes, facade, service, model)
│   └── user/         # User management
├── routes/           # API route definitions
├── services/         # External service integrations (Cloudinary, Firebase)
└── utils/            # Helper utilities
```

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file:

   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # MongoDB
   MONGO_URI=mongodb://localhost:27017/clouddrive

   # Firebase (download serviceAccountKey.json from Firebase Console)
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # JWT
   JWT_SECRET=your_jwt_secret

   # Basic Auth (for API protection)
   BASIC_AUTH_USERNAME=admin
   BASIC_AUTH_PASSWORD=password

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📡 API Endpoints

### Media

| Method   | Endpoint                        | Description                 |
| -------- | ------------------------------- | --------------------------- |
| `GET`    | `/api/v1/media`                 | List user's files           |
| `GET`    | `/api/v1/media/trashed`         | List trashed files          |
| `GET`    | `/api/v1/media/shared/with-me`  | List files shared with user |
| `GET`    | `/api/v1/media/:id`             | Get file details            |
| `GET`    | `/api/v1/media/:id/details`     | Check file access           |
| `DELETE` | `/api/v1/media/:id`             | Move file to trash          |
| `PUT`    | `/api/v1/media/:id/restore`     | Restore from trash          |
| `DELETE` | `/api/v1/media/:id/permanent`   | Permanently delete          |
| `POST`   | `/api/v1/media/:id/share/users` | Share with users            |
| `GET`    | `/api/v1/media/:id/shares`      | Get share list              |

### Proxy (No Basic Auth)

| Method | Endpoint                           | Description         |
| ------ | ---------------------------------- | ------------------- |
| `GET`  | `/api/v1/proxy/media/:id/stream`   | Stream file content |
| `GET`  | `/api/v1/proxy/media/:id/download` | Download file       |

## 🔌 Socket.IO Events

### Upload Flow

```javascript
// Client -> Server
socket.emit("media:upload:start", {
  filename: "file.pdf",
  mimeType: "application/pdf",
  size: 1024000
});

// Server -> Client
socket.on("media:upload:ready", ({ uploadId }) => {
  // Send chunks
  socket.emit("media:upload:chunk", { uploadId, chunk, chunkIndex });
});

// Server -> Client (progress)
socket.on("media:upload:chunk-received", ({ uploadedSize, chunkIndex });

// Server -> Client (complete)
socket.on("media:upload:complete", { media });
```

## 🔐 Security

- **Basic Auth**: Protects main API endpoints
- **Firebase Auth**: Validates user identity
- **JWT Tokens**: Session management
- **Origin Validation**: Stream endpoints validate request origin
- **Secure Streaming**: Files proxied through server, Cloudinary URLs hidden

## 📄 License

MIT
