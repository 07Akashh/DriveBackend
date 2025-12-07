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

      // Exposing Private key because docker env not supporting from variable
      const key = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQD0sdiUMSfiQH0H\neiD0K/bl26nKj6E+RQyFn7YzohkXTbGRZ1YdI4Zvj86m5rLCw9pQ0CwKx56jZ/ZU\nJNoOEpc5UK7Az+my+Zivo940jZB3t+OdhKX6ASg6dBkqMt2/zHG9BBdmdU0II+TP\nhxYXVJWIdZcROHA3DMNjuemU0gNKD5sZ3FOXp7LlfM/sxd/cef36eoNyINIDZzcn\nt2lepEcEaUvKXtelKfLC3ucLXxF7pFgXboniXX+UzLgm8kTb1Wf77xqueIUUhkEf\n7qskpEEKBQdGxBvfZBuHbCQluZjnHw/Wlcwa3PdPskuzVum+i4BQdCe+R5Rc8j72\n9vr44p6fAgMBAAECggEAQUYyArIsNAhE8horsUcLGV0kKZNwDYbo5LpqpdJvhA5n\nOGULDUHdSmRf2ZkABcGuOtGVdhizIl8I0IB2JLvj2FfEDk5IRsSbbPs3Ouiqqa0F\nzI7Goe7uFs3CqsWf7tqwWp49Sckvz+SXVJ7yDy4yp5DKyD64fI7sjm1ZOKhfVUFX\n7qPDW5w+ldyNxR6wVmOI7H6S+Gxjk4Cz9gCTzFC9+XfFFlu3IxaTRXu1eldLlpVH\nKyw88nhBCvLiFr0hPVyHd3SoLPYQTlKaEpEwwXALNf1OUgKpOGWreDSwOGI90pKQ\n/Tv6fBcx5rD/W8K5OgBFD15wJDpc1FV3yeOia5rNwQKBgQD+ubj3GuH9D2M/WFAG\nMD7oCqfQC2nD8xGMEm+h1Uo5rsKZ4uXF/BEyOvbDHSP8IxWF+c06jOpjYUyT4rMp\nCJvhwtCRO6AStXLg3wEfGfbyLv3dbaUWrWQldSlKYf6Vyfo8I4FDfWrZBX+BF5m/\nRMetrFJpGdkLHO83VIB6c00L3wKBgQD160Zsq4Tu5F4dc9I8JbK5Ny3xc68F7Hvl\nGpaGuEwdZSW9GNhs+J7xzfAx10YHvKGvUv3JkKJzlOLm+6KLM5Z3oaIn0DFGoj7W\nrZsjOyRCj+aVyTRLI0U331goWKjunbaBCqAJTk+rl1kAjrhMF9pm2bQ8OjeYDSxu\nhRq4ndDFQQKBgENnZdiNloteTQbwGYzpq1u/phRZUM13PodwQXXzeMa2xevurJqt\nTueZzr5msaUAq6teJL5/l25gyuC/NmV/T7B32rTzsDIDLbjvid5vAnenk6nKX8sW\nas+2pwx1zeZZIgxT4Nq5D1MKL2k7k4WXb7c3SD9jhZl5OJvNkonUhOjFAoGAEODO\n+pJjE0pVM0xJt5sWwyOIYbQA5TUv46+JeUGY58OTbYERCZmevxXVUHZn9gv6ROA7\nTuRAYhJr6FKI+2jVAOz1BiqB10k3auCLb0WV3YOm3czra+TF0Wng0RQUtBva9MxX\n44ueaDaBA0rIV2Cjur9iYWfVfPgafpNgHB+ovoECgYBYiewgkEMTmp6FhucPOXRf\n3yJs/MSA2+D1ORGF8mTNbNEZS0aieJY360f2ZOOQs//fDnqnunCecQrQLyaRljvw\nXBvbbzqmR5mdNoDrl1cgkBh1ScKnLsiycpazk/cdB1lYjhdXsXGr65YFrcpLgC86\nX/qMjoWBsRRRIsIhcMJ+Vw==\n-----END PRIVATE KEY-----\n"

      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: key.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
      }

      // const serviceAccount = JSON.parse(
      //   Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString(
      //     "utf8"
      //   )
      // );

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
