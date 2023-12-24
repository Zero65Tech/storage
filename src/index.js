const storage = new (require('@google-cloud/storage').Storage)();

const BUCKET = {
  alpha   : {
    image: 'bolo-live_image',
    video: 'bolo-live_video',
    agora: 'bolo-live_agora'
  },
  beta    : {
    image: 'bolo-live_image',
    video: 'bolo-live_video',
    agora: 'bolo-live_agora'
  },
  gamma   : {
    image: 'bolo-live_image_asia-south1',
    video: 'bolo-live_video_asia-south1',
    agora: 'bolo-live_agora_asia-south1'
  },
  offline : {
    image: 'bolo-live_image_asia-south1',
    video: 'bolo-live_video_asia-south1',
    agora: 'bolo-live_agora_asia-south1'
  },
  prod    : {
    image: 'bolo-live_image_asia-south1',
    video: 'bolo-live_video_asia-south1',
    agora: 'bolo-live_agora_asia-south1'
  },
}[process.env.NODE_ENV][process.env.npm_package_name];



class Storage {

  constructor(bucket) {
    this.bucket = bucket || BUCKET;
  }

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

  async upload(file, contentType, dest) {
    return await storage.bucket(this.bucket).upload(file, {
      destination: dest,
      metadata: { contentType: contentType }
    });
  }

  async download(file, dest) {
    await storage.bucket(this.bucket).file(file).download({ destination: dest });
  }

  async delete(filePath) {
    return await storage
        .bucket(this.bucket)
        .file(filePath)
        .delete();
  }

}

module.exports = Storage;