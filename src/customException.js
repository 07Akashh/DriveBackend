//========================== Load Modules Start ===========================

//========================== Load Internal Module =========================

// Load exceptions
var Exception = require("./model/Exception");
var status_codes = require("./status_codes.json");

//========================== Load Modules End =============================

//========================== Export Module Start ===========================

module.exports = {
    intrnlSrvrErr: err => {
        return new Exception(
            status_codes.intrnlSrvrErr.code,
            status_codes.intrnlSrvrErr.msg,
            500,
            err
        )
    },
    unauthorizeAccess: (err=false) => err?
     new Exception(
                status_codes.unauth_access.code,
                status_codes.unauth_access.msg,
                 402,
                err
            ):new Exception(
                status_codes.unauth_access.code,
                status_codes.unauth_access.msg,
                 402
            )
    ,
    tokenGenException: err =>
        new Exception(
            status_codes.tokenGenError.code,
            status_codes.tokenGenError.msg,
            status_codes.tokenGenError.status,
            err
        ),
    getCustomErrorException: (errMsg, error) => new Exception(406, errMsg,406,error),
    validationErrors: err => {
        return new Exception(
            406,
            err.message,
            406
        )
    },
    dbErr: err =>
        new Exception(
            status_codes.intrnlSrvrErr.code,
            status_codes.intrnlSrvrErr.msg,
             500,
            err
        ),
    completeCustomException: (type, err=false) => {
        if (!err) 
            return new Exception(status_codes[type].code, status_codes[type].msg, status_codes[type].status);
        else
            return new Exception(
                status_codes[type].code,
                status_codes[type].msg,
                status_codes[type].status,
                err
            );
    }
};

//========================== Export Module   End ===========================