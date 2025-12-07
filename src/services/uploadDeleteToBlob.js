"use strict";
const path = require('path');
const fs = require('fs');
// const { BlobServiceClient } = require("@azure/storage-blob");
// import { S3Client } from "@aws-sdk/client-s3";
const AWS =require('aws-sdk');
//========================== Load internal modules ====================
const config = require("../config").cfg;
const azurepath = path.join(path.dirname(fs.realpathSync(__filename)), '../../');
// const blobServiceClient = BlobServiceClient.fromConnectionString(config.azureBlob.connectionString);
const blobServiceClient = new AWS.S3({ accessKeyId: config.SES_CONFIG.accessKeyId,
    secretAccessKey: config.SES_CONFIG.secretAccessKey,
    region: config.SES_CONFIG.region});
const appUtils = require("../utils/appUtils");
//========================== Load Modules End ==============================================
const __deleteTempFile = filePath => {
    fs.stat(filePath, (err, _stats) => {
        if (err) {
            appUtils.logError({moduleName:"uploadDeleteToBlob" , methodName : "__deleteTempFile",err });
        }
        fs.unlink(filePath, (_err) => {
            if (_err) {
                console.log(_err);
                appUtils.logError({moduleName:"uploadDeleteToBlob" , methodName : "__deleteTempFile",err:_err });
            }
            console.log('file deleted successfully');
        });
    });
};



const  __uploadToBlob = async (file, fileKey) => {
    try {
        const bucketName = "";
        const fileStream = fs.createReadStream(file.path);

        const params = {
            Bucket: bucketName,
            Key: fileKey,
            Body: fileStream
        };

        const data = await blobServiceClient.upload(params).promise();

        console.log({message: 'File uploaded successfully', 'filename': fileKey, 'location': data.Location});
        return data; // This object contains the URL of the uploaded file among other details

    } catch (err) {
        appUtils.logError({moduleName:"uploadDeleteToBlob" , methodName : "__uploadToBlob",err });
        throw err;
    }
};


function uploadFile(file,fileKey) {
    return __uploadToBlob(file,fileKey).then(data => {
        __deleteTempFile(file.path);
        return data
    }).catch(function (_err) {
        appUtils.logError({moduleName:"uploadDeleteToBlob" , methodName : "uploadFile",err:_err });
        __deleteTempFile(file.path);
        //throw err
    });
    // }
}

function uploadImageThumb(file) {
    let size = 128;
    let dest = path.join(file.path, "../");
    let resizeName = size + "x" + size + file.filename;
    dest += resizeName;
    return new Promise((resolve, reject) => {

        gm(file.path)
            .resize(size, size)
            .autoOrient()
            .write(dest, err => {
                if (err) {
                    reject(err);
                }
                let resizeImage = file;
                resizeImage.filename = resizeName;
              
                return __uploadToS3(resizeImage)
                    .then(data => {
                        __deleteTempFile(dest);
                        resolve(data);
                    })
                    .catch(_err => {
                        appUtils.logError({moduleName:"uploadDeleteToBlob" , methodName : "uploadImageThumb",err:_err });
                        throw _err
                    })
            });
    });
}
function deleteFromS3(fileKey) {
    photoBucket.deleteObject({
        Key: fileKey
    }, (err, data) => {
        if (err) {
            appUtils.logError({moduleName:"uploadDeleteToBlob" , methodName : "deleteFromS3",err });
            return false
        } else {
            console.log("delete success: ", data, fileKey);
            return true
        }
    });
    return true;
}



//========================== Export Module Start ==============================

module.exports = {
    uploadFile,
    uploadImageThumb,
    __deleteTempFile,
    deleteFromS3
};

//========================== Export Module End ===============================

