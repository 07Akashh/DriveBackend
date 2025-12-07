const axios = require('axios');
const config = require("../config").cfg;
const appUtils = require("../appUtils");


/**
 * Function to send SMS messages.
 * @param {Object} smsData - The data needed to send an SMS.
 * @param {string} smsData.number - The phone number to send the SMS to.
 * @param {string} smsData.message - The message content for the SMS.
 */
const sendSms = (smsData) => {
  let data = JSON.stringify({
    api_id: config.SmsPlansService.api_id,
    api_password: config.SmsPlansService.api_password,
    sms_type: "Transactional",
    sms_encoding: config.SmsPlansService.sms_encoding,
    sender: config.SmsPlansService.sender,
    number: smsData.number,
    message: smsData.message,
    template_id: smsData.templateId
  });


  let object = {
    method: 'post',
    url: `${config.SmsPlansService.endpoint}/send_sms`,
    headers: { 
      'Content-Type': 'application/json'
    },
    data: data,
    maxBodyLength: Infinity 
  };

 
  return axios.request(object)
    .then(response => {
      console.log("SMS sent successfully:");
      return response.data;
    })
    .catch(error => {
      appUtils.logError({moduleName:"smsService" , methodName : "sendSms",error });
      throw error; 
    });
};

module.exports = {
    sendSms
};
