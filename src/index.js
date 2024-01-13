const fs = require('fs');
const { Storage } = require('@google-cloud/storage');



exports.init = ({ bucket, mock }) => {

  function local(remotePath) {
    return `@storage/${ bucket }/${ remotePath }`
  }

  async function ensureLocalPathDir(localPath) {
    let i = localPath.lastIndexOf('/');
    if(i != -1) {
      let dir = localPath.substring(0, i);
      if(!fs.existsSync(dir))
        await fs.promises.mkdir(dir, { recursive: true });
    }
  }

  if(mock === true) {

    exports.readFile = async (remotePath) => {
      let localPath = local(remotePath);
      return await fs.promises.readFile(localPath);
    }

    exports.writeFile = async (remotePath, data) => {
      let localPath = local(remotePath);
      await ensureLocalPathDir(localPath);
      await fs.promises.writeFile(localPath, data);
      return `File Updated at ${ localPath }`
    }

    exports.createReadStream = (remotePath) => {
      let localPath = local(remotePath);
      return fs.createReadStream(localPath);
    }

    exports.createWriteStream = (remotePath, data) => {
      let localPath = local(remotePath);
      ensureLocalPathDir(localPath);
      const writeStream = fs.createWriteStream(localPath);
      writeStream.write(data);
      writeStream.end();
    }

  } else {

    const storage = new Storage({
      projectId: 'zero65-test',
      keyFilename: './keyfile2.json',
    });

    exports.readFile = async (remotePath) => {
      let localPath = local(remotePath);
      if(!fs.existsSync(localPath))
        await storage.bucket(bucket)
            .file(remotePath)
            .download({ destination: localPath });

      return await fs.promises.readFile(localPath);
    }

    exports.writeFile = async (remotePath, data) => {
      let localPath = local(remotePath);
      await ensureLocalPathDir(localPath);

      await Promise.all([
        fs.promises.writeFile(localPath, data),
        exports.upload(remotePath, localPath, 'text/plain')
      ]);

      return `File Updated at ${ localPath }`
    }

    exports.createReadStream = async (remotePath) => {
      let localPath = local(remotePath);
      if(!fs.existsSync(localPath))
        await storage.bucket(bucket)
            .file(remotePath)
            .download({ destination: localPath });

      return fs.createReadStream(localPath);
    }

    exports.createWriteStream = async (remotePath, data) => {
      let localPath = local(remotePath);
      ensureLocalPathDir(localPath);

      const writeStream = fs.createWriteStream(localPath);

      await Promise.all([
        writeStream.write(data),
        exports.upload(remotePath, localPath, 'text/plain')
      ]);
      writeStream.end();
    }

    exports.upload = async (remotePath, localPath, contentType) => {
      await storage.bucket(bucket)
          .upload(localPath, {
            destination: remotePath,
            metadata: { contentType: contentType }
          });
    }

    exports.delete = async (remotePath) => {
      let localPath = local(remotePath);

      await Promise.all([
        fs.promises.unlink(localPath),
        storage.bucket(bucket)
        .file(remotePath)
        .delete()
      ]);
    }

    return 'File Deleted';
  }

  delete exports.init;

};
