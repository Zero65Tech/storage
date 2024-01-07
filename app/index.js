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

  const result = await Data.uploadFile(localUploadPath, gcloudPath);

  res.send(result);

});

app.post('/download/memory', async(req, res) => {

  const { gcloudPath, localDownloadPath, } = req.body;

  const result = await Data.downloadFileInMemory(gcloudPath, localDownloadPath);

  res.send(result);

});

app.post('/download/RAM', async(req, res) => {

  const { gcloudPath } = req.body;

  const result = await Data.downloadFileInRAM(gcloudPath);

  res.send(result);

});

app.post('/getmetadata', async(req, res) => {

  const { gcloudPath } = req.body;

  const [filename, data] = await Data.getMetadata(gcloudPath);

  res.send({
    filename: filename,
      data: {...data}
  });

});

app.post('/setmetadata', async(req, res) => {

  const { gcloudPath, ...metadata } = req.body;

  await Data.setMetadata(gcloudPath, metadata );

  res.send({
    filename: gcloudPath,
      Metadata: {...metadata}
  });

});

app.post('/update', async(req, res) => {

  const { gcloudPath, data } = req.body;

  const result = await Data.writeStream(gcloudPath, data);

  res.send(result);

});

app.post('/read', async(req, res) => {

  const { gcloudPath } = req.body;

  const result = await Data.readStream(gcloudPath);

  res.send(result);

});


module.exports = app;
