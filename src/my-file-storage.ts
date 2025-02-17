import * as multer from 'multer';
import * as fs from 'fs';
// // CommonJS (used in Node.js)
// module.exports = { mkdirSync, readFile, writeFile };

// // ES6 Modules
// export const readFile = () => { ... };
// export const mkdirSync = () => { ... };
// export const writeFile = () => { ... };

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      fs.mkdirSync('uploads');
    } catch (error) {}
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '-' +
      file.originalname;
    cb(null, uniqueSuffix);
  },
});

export { storage };
