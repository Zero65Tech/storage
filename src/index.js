const fs = require('fs');
const { Storage } = require('@google-cloud/storage');

exports.init = ({ bucket, mock }) => {

  if(mock === true) {

    exports.sync = async (remotePath) => {
      return `@storage/${ bucket }/${ remotePath }`;
    }

  } else {

    const storage = new Storage();

    exports.sync = async (remotePath) => {
      let localPath = `@storage/${ bucket }/${ remotePath }`;
      if(!fs.existsSync(localPath))
        await storage.bucket(bucket)
            .file(remotePath)
            .download({ destination: localPath });
      return localPath;
    }

    exports.createReadStream = (remotePath) => {
      storage.bucket(bucket)
          .file(remotePath)
          .createReadStream();
    }

    exports.upload = async (remotePath, localPath, contentType) => {
      await storage.bucket(bucket)
          .upload(localPath, {
            destination: remotePath,
            metadata: { contentType: contentType }
          });
    }

    exports.delete = async (remotePath) => {
      return await storage.bucket(bucket)
          .file(remotePath)
          .delete();
    }

  }

  delete exports.init;

};
