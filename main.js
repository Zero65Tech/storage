(async () => {

    const storage = require('./src/index');

    await storage.init({
        bucket: 'test_bucket_zero65',
        mock: false
    })
  
  })();
  