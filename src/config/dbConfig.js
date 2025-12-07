"use strict"

//=================================== Load Modules start ===================================

//=================================== Load external modules=================================
const mongoose = require('mongoose');

//=================================== Load Modules end =====================================

// Connect to Db - Optimized for serverless
function connectDb(env, callback) {
    // Check if already connected (important for serverless connection reuse)
    if (mongoose.connection.readyState === 1) {
        console.log('MongoDB already connected, reusing connection');
        if (callback) callback();
        return mongoose.connection;
    }

    // Check if connection is in progress
    if (mongoose.connection.readyState === 2) {
        console.log('MongoDB connection in progress, waiting...');
        mongoose.connection.once('connected', () => {
            if (callback) callback();
        });
        mongoose.connection.once('error', (error) => {
            if (callback) callback(error);
        });
        return mongoose.connection;
    }

    let dbUrl = env.mongo.dbUrl(env.mongo.userName, env.mongo.Pass, env.mongo.dbName);
    let dbOptions = env.mongo.options || {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0,
        // Serverless optimizations
        connectTimeoutMS: 10000,
        retryWrites: true,
    };

    if (env.isProd) {
        console.log("Configuring db in " + env.TAG + ' mode');
    } else {
        console.log("Configuring db in " + env.TAG + ' mode');
        mongoose.set('debug', true);
    }
    if(process.env.NODE_ENV==='remote'){
    dbUrl=`mongodb://localhost:27017/${env.mongo.dbName}`;
    }
    console.log("Connecting to database", dbUrl);
    
    // Use promise-based connection for better serverless support
    mongoose.connect(dbUrl, dbOptions).catch((error) => {
        console.log('DB connection error: ' + error);
        if (callback) callback(error);
    });

    // CONNECTION EVENTS
    // When successfully connected
    mongoose.connection.on('connected', function () {
        console.log('Connected to DB');
        if (callback) callback();
    });

    // If the connection throws an error
    mongoose.connection.on('error', function (error) {
        console.log('DB connection error: ' + error);
        if (callback) callback(error);
    });

    // When the connection is disconnected
    mongoose.connection.on('disconnected', function () {
        console.log('DB connection disconnected.');
        // Don't call callback on disconnect as it's not necessarily an error
    });
}

// ========================== Export Module Start ==========================
module.exports = connectDb;
// ========================== Export Module End ============================