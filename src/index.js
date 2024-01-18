const fs = require('fs');
const { Storage } = require('@google-cloud/storage');



exports.init = ({ bucket, mock }) => {

  function local(remotePath) {
    return `@storage/${ bucket }/${ remotePath }`;
  }

  async function ensureLocalPathDir(localPath) {
    const i = localPath.lastIndexOf('/');
    if(i !== -1) {
      const dir = localPath.substring(0, i);
      if(!fs.existsSync(dir))
        await fs.promises.mkdir(dir, { recursive: true });
    }
  }

  if(mock === true) {

    exports.readFile = async(remotePath) => {
      const localPath = local(remotePath);
      return await fs.promises.readFile(localPath);
    };

    exports.writeFile = async(remotePath, data) => {
      const localPath = local(remotePath);
      await ensureLocalPathDir(localPath);
      await fs.promises.writeFile(localPath, data);
    };

    exports.createReadStream = (remotePath) => {
      const localPath = local(remotePath);
      return fs.createReadStream(localPath);
    };

    exports.createWriteStream = (remotePath) => {
      const localPath = local(remotePath);
      ensureLocalPathDir(localPath);
      return fs.createWriteStream(localPath);
    };

  } else {

    const storage = new Storage();

    async function upload(remotePath, localPath, contentType) {
      await storage.bucket(bucket)
        .upload(localPath, {
          destination: remotePath,
          metadata: { contentType: contentType },
        });
    }

    exports.readFile = async(remotePath) => {
      const localPath = local(remotePath);
      if(!fs.existsSync(localPath)) {
        try {
          await storage.bucket(bucket)
            .file(remotePath)
            .download({ destination: localPath });
        } catch(error) {
          if(error.code === 404) console.error('File Not Found');
          else console.error('Error reading file', error);
        }
      }

      return await fs.promises.readFile(localPath);
    };

    exports.writeFile = async(remotePath, data) => {
      const localPath = local(remotePath);
      await ensureLocalPathDir(localPath);

      await Promise.all([
        fs.promises.writeFile(localPath, data),
        upload(remotePath, localPath, 'text/plain'),
      ]);
    };

    exports.createReadStream = async(remotePath) => {
      const localPath = local(remotePath);
      if(!fs.existsSync(localPath))
        await storage.bucket(bucket)
          .file(remotePath)
          .download({ destination: localPath });

      return fs.createReadStream(localPath);
    };

    exports.createWriteStream = async(remotePath) => {
      const localPath = local(remotePath);
      ensureLocalPathDir(localPath);

      return fs.createWriteStream(localPath);
    };

    exports.delete = async(remotePath) => {
      try {
        const localPath = local(remotePath);

        await Promise.all([
          fs.unlink(localPath),
          storage.bucket(bucket)
            .file(remotePath)
            .delete(),
        ]);

      } catch (error) {
        console.error('Error deleting file:', error);
      }
    };
  }

  delete exports.init;

};
