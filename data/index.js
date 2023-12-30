const { Storage } = require('@google-cloud/storage');


const storage = new Storage({
  projectId: 'zero65-test',
  keyFilename: './keyfile2.json',
});

const bucketName = 'test_bucket_zero65';

// Upload file from local machine to Google Cloud Storage
async function uploadFile(localFilePath, remoteFileName) {
  const bucket = storage.bucket(bucketName);
  await bucket.upload(localFilePath, {
    destination: remoteFileName,
  });
  console.log(`File ${localFilePath} uploaded to ${bucketName}/${remoteFileName}.`);
}

// Download file from Google Cloud Storage to local machine
async function downloadFile(remoteFileName, localFilePath) {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(remoteFileName);
  await file.download({ destination: localFilePath });
  console.log(`File ${bucketName}/${remoteFileName} downloaded to ${localFilePath}.`);
}

module.exports = {uploadFile, downloadFile}
