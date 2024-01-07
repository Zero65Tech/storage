const { Storage } = require('@google-cloud/storage');


const storage = new Storage({
  projectId: 'zero65-test',
  keyFilename: './keyfile2.json',
});

const bucketName = 'test_bucket_zero65';
const bucket = storage.bucket(bucketName);

// Upload file from local machine to Google Cloud Storage
async function uploadFile(localFilePath, remoteFileName) {
  await bucket.upload(localFilePath, {
    destination: remoteFileName,
  });

  return `File ${localFilePath} uploaded to ${bucketName}/${remoteFileName}.`;
}

// Download file from Google Cloud Storage to local machine
async function downloadFileInMemory(remoteFileName, localFilePath) {
  const file = bucket.file(remoteFileName);
  await file.download({ destination: localFilePath });

  return `File ${bucketName}/${remoteFileName} downloaded to ${localFilePath}.`;
}

// Download file from Google Cloud Storage to RAM
async function downloadFileInRAM(remoteFileName) {
  const file = bucket.file(remoteFileName);
  const [fileContent] = await file.download();

  return `File ${bucketName}/${remoteFileName} downloaded to system RAM.`;
}

// Get Object Metadata of file in Google Cloud Storage 
async function getMetadata(remoteFileName) {
  const file = bucket.file(remoteFileName);
  const [metadata] = await file.getMetadata();

  return [remoteFileName, metadata];
}

// Function to set metadata for a file in Google Cloud Storage
async function setMetadata(remoteFileName, metadata) {
  const file = bucket.file(remoteFileName);

  await file.setMetadata(metadata);
  
}

// Writing data to file in Google Cloud Storage
async function writeStream(remoteFileName, data) {
  const file = bucket.file(remoteFileName);
  
  const writeStream = file.createWriteStream();
  writeStream.write(data);
  writeStream.end();

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return `Data: ${data} \nupdated to ${bucketName}/${remoteFileName}.`
}

// Download data from Google Cloud Storage file using a readable stream
async function readStream(remoteFileName) {
  const file = bucket.file(remoteFileName);

  const readStream = file.createReadStream();
  let data = '';
  readStream.on('data', (chunk) => {
    data += chunk.toString();
  });

  await new Promise((resolve, reject) => {
    readStream.on('end', resolve);
    readStream.on('error', reject);
  });

  return `Data downloaded from ${bucketName}/${remoteFileName}: ${data}`;
}

module.exports = {
   uploadFile, 
   downloadFileInMemory, 
   downloadFileInRAM, 
   getMetadata, 
   setMetadata, 
   writeStream, 
   readStream 
  }
