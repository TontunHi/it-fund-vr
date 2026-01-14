const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 1. หา Year และ Month ปัจจุบัน
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        // 2. กำหนดโฟลเดอร์ปลายทางตามประเภทไฟล์ (slip หรือ receipt)
        // ถ้า field ชื่อ slipImage ให้ลง slips/, ถ้า receiptImage ให้ลง receipts/
        const typeFolder = file.fieldname === 'receiptImage' ? 'receipts' : 'slips';
        const dir = `uploads/${typeFolder}/${year}/${month}`;

        // 3. สร้างโฟลเดอร์ถ้ายังไม่มี (Recursive คือสร้างซ้อนชั้นได้เลย)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter รับเฉพาะรูปภาพ
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

module.exports = upload;