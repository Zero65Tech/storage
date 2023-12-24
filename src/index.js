const fs = require('fs');
const { Storage } = require('@google-cloud/storage');

exports.init = ({ bucket, mock }) => {

  if(mock === true) {

    exports.createReadStream = (remotePath) {
      fs.createReadStream(`@storage/${ bucket }/${ remotePath }`);
    }

  } else {

    const storage = new Storage();

    exports.createReadStream = (remotePath) {
      storage.bucket(bucket)
          .file(remotePath)
          .createReadStream();
    }

    exports.upload = async (remotePath, localPath, contentType) {
      await storage.bucket(bucket)
          .upload(localPath, {
            destination: remotePath,
            metadata: { contentType: contentType }
          });
    }

    exports.download = async (remotePath, localPath) {
      await storage.bucket(bucket)
          .file(remotePath)
          .download({ destination: localPath });
    }

    exports.delete(remotePath) {
      return await storage.bucket(bucket)
          .file(remotePath)
          .delete();
    }

  }

  delete exports.init;

};
