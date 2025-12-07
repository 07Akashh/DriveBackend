module.exports = {
  environment: process.env.NODE_ENV,
  ip: "",
  port: 8080,
  isProd: true,
  sentryDsn: process.env.sentryDsn,
  sql: {
    database: process.env.database,
    username: process.env.username,
    password: process.env.password,
    dbOptions: {},
    host: process.env.host,
  },

  mongo: {
    dbName: process.env.MONGODB_NAME,
    userName: process.env.MONGO_USERNAME,
    Pass: process.env.MONGO_PASS,
    dbUrl: (userName, pass, db) =>
      `mongodb+srv://${userName}:${pass}@cluster0.kp9bxqv.mongodb.net/${db}?retryWrites=true&w=majority`,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      connectTimeoutMS: 10000,
      retryWrites: true,
    },
  },

  redis: {
    server: process.env.REDIS_REVER,
    port: process.env.REDIS_PORT,
    user: process.env.REDIS_USERNAME,
    pass: process.env.REDIS_PASS,
  },
  fronEndUrl: "",
};
