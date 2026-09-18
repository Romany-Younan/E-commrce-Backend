const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {

    const ext = path.extname(file.originalname).toLowerCase();

    const allowed = ['.jpg', '.png', '.jpeg', '.webp'];

    if (!allowed.includes(ext)) {
        return cb(new Error('Only images allowed'), false);
    }
    cb(null, true);

}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const MB = 1024 * 1024;
const MAX_FILE_SIZE_MB = 5;

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_MB * MB }
});

module.exports = upload;
module.exports.MAX_FILE_SIZE_MB = MAX_FILE_SIZE_MB;