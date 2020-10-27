//prod.js

module.exports = {
    mongoURI:process.env.MONGO_URI,
    DEFAULT_BUCKET_NAME: process.env.DEFAULT_BUCKET_NAME,
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    image_path:process.env.IMAGE_PATH
 };
 