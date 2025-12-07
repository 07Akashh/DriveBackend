"use strict";

const AWS = require("aws-sdk");
const config = require("../config").cfg;
const appUtils = require("../appUtils");

const sqs = new AWS.SQS({
  accessKeyId: config.SES_CONFIG.accessKeyId,
  secretAccessKey: config.SES_CONFIG.secretAccessKey,
  region: config.SES_CONFIG.region,
  apiVersion: "2012-11-05",
});

const sendMessage = (queueUrl, messageBody) => {
  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(messageBody),
    DelaySeconds: 0,
  };

  return new Promise((resolve, reject) => {
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        appUtils.logError({moduleName:"QueueService" , methodName : "sendMessage",err });
        reject(err);
      } else {
        console.log("Message sent successfully:", data.MessageId);
        resolve(data.MessageId);
      }
    });
  });
};

const deleteMessage = (receiptHandle) => {  
    const params = {
      QueueUrl: QUEUE_URL,
      ReceiptHandle: receiptHandle,
    };
  
    return new Promise((resolve, reject) => {
      sqs.deleteMessage(params, (err, data) => {
        if (err) {
          appUtils.logError({moduleName:"QueueService" , methodName : "deleteMessage",err });
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
};

module.exports = {
  sendMessage,
  deleteMessage,
};
