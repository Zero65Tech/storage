const { Storage } = require('@google-cloud/storage');
const axios = require('axios');

const storage = new Storage({
    projectId: 'zero65-test',
    keyFilename: './keyfile2.json',
});

function generateSignedUrl(bucketname, filename) {
    const bucket = storage.bucket(bucketname);
    const file = bucket.file(filename);
  
    const options = {
      action: 'read',
      expires: Date.now() + 1 * 60 * 1000, // 1 minute
    };
  
    // return file.getSignedUrl(options);
    file.getSignedUrl(options, (err, url) => {
        if (err) {
          console.error('Error generating signed URL:', err);
          return;
        }
      
        console.log('Signed URL:', url);

        axios.get(url)
            .then(response => {
                console.log('Successfully fetched data:', response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
      });
}

generateSignedUrl('test_bucket_zero65', 'gcloudFile.txt');

