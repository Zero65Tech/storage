let { Storage } = require('@google-cloud/storage');

exports.init = ({ bucket }) => {

  let storage = new Storage();

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

  delete exports.init;

};



/*

class Storage {

  async save(buffer, contentType, filePath) {
    return await new Promise((resolve, reject) => {
      storage
          .bucket(this.bucket)
          .file(filePath)
          .createWriteStream({ metadata: { contentType: contentType } })
          .on('finish', resolve)
          .on('error', (e) => reject(e))
          .end(buffer);
    });
  }

  async delete(filePath) {
    return await storage
        .bucket(this.bucket)
        .file(filePath)
        .delete();
  }

}

*/
