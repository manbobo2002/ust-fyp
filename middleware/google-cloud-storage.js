// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
  
const GOOGLE_CLOUD_PROJECT_ID = keys.GOOGLE_CLOUD_PROJECT_ID; // Replace with your project ID
const GOOGLE_CLOUD_KEYFILE = './config/gcp-key.json'; // Replace with the path to the downloaded private key
//const GOOGLE_CLOUD_KEYFILE = keys.GOOGLE_APPLICATION_CREDENTIALS; // Replace with the path to the downloaded private key
  
  const storage = new Storage({
    projectId: GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: GOOGLE_CLOUD_KEYFILE,
  });
  

  const DEFAULT_BUCKET_NAME = keys.DEFAULT_BUCKET_NAME; // Replace with the name of your bucket
  
  /**
   * Middleware for uploading file to GCS.
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   * @return {*}
   */
  exports.sendUploadToGCS = (req, res, next) => {
    if (!req.file) {
      return next();
    }
  
    const bucketName = req.body.bucketName || DEFAULT_BUCKET_NAME;
    const bucket = storage.bucket(bucketName);
    const gcsFileName = `${Date.now()}-${req.file.originalname}`;
    const file = bucket.file(gcsFileName);
  
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });
  
    stream.on('error', (err) => {
      req.file.cloudStorageError = err;
      next(err);
    });
  
    stream.on('finish', () => {
      req.file.cloudStorageObject = gcsFileName;
  
    return file.makePublic()
        .then(() => {
          req.file.gcsUrl = gcsFileName;
          next();
        });
    });
  
    stream.end(req.file.buffer);
  };