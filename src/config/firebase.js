const admin = require("firebase-admin")

class FirebaseService {
  constructor() {
    this.app = null
  }

  async initialize() {
    try {
      if (this.app) {
        return this.app
      }

      // const serviceAccount = {
      //   type: "service_account",
      //   project_id: process.env.FIREBASE_PROJECT_ID,
      //   private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      //   private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      //   client_email: process.env.FIREBASE_CLIENT_EMAIL,
      //   client_id: process.env.FIREBASE_CLIENT_ID,
      //   auth_uri: process.env.FIREBASE_AUTH_URI,
      //   token_uri: process.env.FIREBASE_TOKEN_URI,
      // }

      const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString(
          "utf8"
        )
      );

      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      })

      return this.app
    } catch (error) {
      console.error("Firebase initialization failed:", error)
      throw error
    }
  }

  getAuth() {
    if (!this.app) {
      throw new Error("Firebase not initialized")
    }
    return admin.auth()
  }

  getFirestore() {
    if (!this.app) {
      throw new Error("Firebase not initialized")
    }
    return admin.firestore()
  }
}

const firebaseService = new FirebaseService()

module.exports = {
  initializeFirebase: () => firebaseService.initialize(),
  getFirebaseAuth: () => Promise.resolve(firebaseService.getAuth()),
  getFirestore: () => firebaseService.getFirestore(),
}
