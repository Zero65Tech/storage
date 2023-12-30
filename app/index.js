const express = require('express');
const app     = express();
const cors = require('cors');

const Data = require('../data');



app.use(express.json());
app.use(cors());



app.get('/', async (req, res) => {

  res.send('Hello NodeJs !');

});

app.get('/_env', async (req, res) => {

  res.send(process.env);
  
});

app.post('/upload', async(req, res) => {

  const { localUploadPath, gcloudPath } = req.body;

  await Data.uploadFile(localUploadPath, gcloudPath);

  res.send('Upload Successful');

});

app.post('/download', async(req, res) => {

  const { gcloudPath, localDownloadPath, } = req.body;

  await Data.downloadFile(gcloudPath, localDownloadPath);

  res.send('Document updated successfully !');

});


module.exports = app;
