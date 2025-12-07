const axiosService = require('./axiosService');
const config = require("../config").cfg;
const appUtils = require("../appUtils");
/**
 * Function to send WhatsApp messages.
 * @param {Object} userData - The user data for the WhatsApp message.
 * @param {string} userData.whatsappNumber - The WhatsApp number to send the message to.
 * @param {string} userData.template_name - The template name of the WhatsApp message.
 * @param {string} userData.broadcast_name - The broadcast name of the message.
 * @param {Array} userData.parameters - Parameters for the message template.
 */
const sendWhatsapp = (userData) => {
  const apiUrl = `${config.WatiConfigurations.Endpoint}/api/v1/sendTemplateMessage?whatsappNumber=91${userData.number}`;
  let data = {
    template_name: userData.template_name,
    broadcast_name: userData.broadcast_name,
    parameters: [userData.parameters]
  };

  let object = {
    method: 'post',
    url: apiUrl,
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': config.WatiConfigurations.BearerToken 
    },
    data: data
  };
  return axiosService(object)
    .then(response => {
      console.log("Message sent successfully:");
      return response.data;
    })
    .catch(error => {
      appUtils.logError({moduleName:"whatsappService" , methodName : "sendWhatsapp",error });
      throw error;
    });
};

module.exports = {
    sendWhatsapp
};
