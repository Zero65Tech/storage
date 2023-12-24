const fs = require('fs');
const { Storage } = require('@google-cloud/storage');



async function ensureLocalPathDir(localPath) {
  let i = localPath.lastIndexOf('/');
  if(i != -1) {
    let dir = localPath.substring(0, i);
    if(!fs.existsSync(dir))
      await fs.promises.mkdir(dir, { recursive: true });
  }
}



exports.init = ({ bucket, mock }) => {

  if(mock === true) {

    exports.sync = async (remotePath) => {
      return `@storage/${ bucket }/${ remotePath }`;
    }

    exports.readFile = async (remotePath) => {
      let localPath = `@storage/${ bucket }/${ remotePath }`;
      return await fs.promises.readFile(localPath);
    }

    exports.writeFile = async (remotePath, data) => {
      let localPath = `@storage/${ bucket }/${ remotePath }`;
      await ensureLocalPathDir(localPath);
      return await fs.promises.writeFile(localPath, data);
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
