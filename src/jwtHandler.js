const jwt = require("jsonwebtoken"),
    customException = require("./customException"),
    config = require("./config").cfg,
    redisClient = require("./redisClient/init"),
    appUtils = require("./utils/appUtils");



var generateToken = function (userObject) {
    var options = {};
    try{
    return jwt
        .sign(userObject, config.JWT_SECRET_KEY, options)
    } catch (e) {
        appUtils.logError({moduleName:"jwtHandler" , methodName : "generateUserToken",err:e });
        throw customException.tokenGenException(e);
    }
};

const verifyToken = accessToken => {
    try{
        let tokenPayload= jwt.verify(accessToken, config.JWT_SECRET_KEY, {})
       return redisClient.getValue(JSON.stringify(tokenPayload._id)).then(tokenValue=>{
            if (tokenValue==JSON.stringify(accessToken)){
                return tokenPayload
            }
            else throw customException.unauthorizeAccess()
        })
    }catch(err){
        appUtils.logError({moduleName:"jwtHandler" , methodName : "verifyToken",err });
        throw err
    }
}


var verifyUsrForgotPassToken = function (acsTokn) {
    return jwt
        .verify(acsTokn, config.JWT_SECRET_KEY)
        .then(function (tokenPayload) {
            return tokenPayload;
        })
        .catch(function (err) {
            appUtils.logError({moduleName:"jwtHandler" , methodName : "verifyUsrForgotPassToken",err });
            throw customException.unauthorizeAccess(err);
        });
};

var expireToken = function (request) {
    var accessToken = request.get("accessToken");
    if (accessToken) {
        //blacklist token in redis db
        //it will be removed after 6 months
        // redisClient.setValue(accessToken, true);
        // redisClient.expire(accessToken, config.TOKEN_EXPIRATION_SEC);
        redisClient.deleteValue(JSON.stringify(request.user._id))
    }
};


// ========================== Export Module Start ==========================
module.exports = {
    generateToken,
    verifyToken,
    expireToken,
    verifyUsrForgotPassToken,
};
// ========================== Export Module End ============================