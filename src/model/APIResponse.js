var constant = require('../constant');
const config = require('../config');

class APIResponse {
    constructor(statusCode, result) {
        this.status = statusCode;
        if (statusCode == constant.STATUS_CODE.SUCCESS) {
            this.res= result ?   result : constant.EMPTY;
        } else {
            this.err = result ?  result : constant.EMPTY;
        }
    }
}

// ========================== Export Module Start ==========================
module.exports = APIResponse;
// ========================== Export Module End ============================
