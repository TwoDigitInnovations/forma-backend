const response = require('../../responses');

module.exports = {
  fileUpload: async (req, res) => {
    try {
      if (!req.file) {
        return response.badRequest(res, { message: 'No file uploaded.' });
      }
      console.log(req.file);
      return response.ok(res, {
        message: 'File uploaded successfully.',
        fileUrl: req.file.path, // Cloudinary file URL
        fileName: req.file.filename, // public ID
      });
    } catch (error) {
      return response.error(res, error);
    }
  },
};
