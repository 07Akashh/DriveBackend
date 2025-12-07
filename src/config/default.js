const path = require('path');
module.exports = {
    msName:"master",
    TOKEN_EXPIRATION_SEC: 60 * 24 * 60 * 60,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    cryptoKey: process.env.cryptoKey,
    uploadDir: path.resolve('./uploads'),
    S3_url:process.env.S3_url,
    basicAuth: {
        "username": process.env.basicauthusername,
        "password": process.env.basicauthpass
    },
   
    SES_CONFIG: {
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey,
        region:"ap-south-1",
        email: process.env.emailUser
    },
    BULK_SMS_AUTH_KEY:process.env.BULK_SMS_AUTH_KEY,
    Bulk_sms_url:'https://bulksmservice.com/api/v5/otp',
    Bulk_sms_login_template:'',
    WatiConfigurations: {
        BearerToken: process.env.WatiToken,
        Endpoint: process.env.WatiEndpoint
    },
    SmsPlansService:{
        api_id: process.env.smsplanApiId,
        api_password: process.env.smsplanApiPass,
        sms_encoding: "text",
        sender: "GG",
        endpoint:"https://www.bulksmsplans.com/api"
    },
    razorPay : {
        key_id : process.env.razorPay_key_id,
        key_secret : process.env.razorPay_key_secret,
        webhooks_secret : process.env.razorPay_webhook_secret,
        payment_webhook_secret : process.env.razorPay_payment_webhook_secret
    },
    cloudinary: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    },
}