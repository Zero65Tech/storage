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

  const local = remotePath => `@storage/${ bucket }/${ remotePath }`;

  if(mock === true) {

    exports.readFile = async (remotePath) => {
      let localPath = local(remotePath);
      return await fs.promises.readFile(localPath);
    }

    exports.writeFile = async (remotePath, data, contentType) => {
      let localPath = local(remotePath);
      await ensureLocalPathDir(localPath);
      await fs.promises.writeFile(localPath, data);
    }

    exports.createReadStream = (remotePath) => {
      let localPath = local(remotePath);
      return fs.createReadStream(localPath);
    }

    exports.createWriteStream = (remotePath, contentType) => {
      let localPath = local(remotePath);
      ensureLocalPathDir(localPath);
      return fs.createWriteStream(localPath);
    }

    exports.delete = async (remotePath) => {
      let localPath = local(remotePath);
      await fs.promises.unlink(localPath);
    };
    
  } else {

    const storage = new Storage();

    const upload = async (remotePath, localPath, contentType) => {
      await storage.bucket(bucket)
          .upload(localPath, { destination: remotePath, metadata: { contentType } });
    }

    const download = async (remotePath, localPath) => {
      await storage.bucket(bucket)
          .file(remotePath)
          .download({ destination:localPath });
    }

    exports.readFile = async (remotePath) => {
      let localPath = local(remotePath);
      if(!fs.existsSync(localPath))
        await download(remotePath, localPath);
      return await fs.promises.readFile(localPath);
    };

    exports.writeFile = async (remotePath, data, contentType) => {
      let localPath = local(remotePath);
      await ensureLocalPathDir(localPath);
      await fs.promises.writeFile(localPath, data);
      await upload(remotePath, localPath, contentType);
    };

    exports.createReadStream = async (remotePath) => {
      let localPath = local(remotePath);
      if(!fs.existsSync(localPath))
        await download(remotePath, localPath);
      return fs.createReadStream(localPath);
    };

    exports.createWriteStream = (remotePath, contentType) => {
      return storage.bucket(bucket)
          .file(remotePath)
          .createWriteStream({ metadata: { contentType } });
    };

    exports.createWriteUrl = async (remotePath, expiry = 300) => {
      let [url] = await storage.bucket(bucket)
          .file(remotePath)
          .getSignedUrl({ action: 'write', expires: Date.now() + expiry * 1000 });
      return url;
    }

    exports.delete = async (remotePath) => {
      let localPath = local(remotePath);
      await Promise.all([
        storage.bucket(bucket).file(remotePath).delete(),
        fs.promises.unlink(localPath)
      ]);
    };
    
  }

  delete exports.init;

};
