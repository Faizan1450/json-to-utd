const express = require('express');
const generateRouter = express.Router();
const generateUTD = require('../controller/generateUTD')
const multer = require('multer');
const upload = multer();
const path = require('path');
const fs = require('fs');
// Used to create ZIP archives on the fly
const archiver = require('archiver');

//! Generate Route
generateRouter.post('/generate', upload.any() ,generateUTD);

//! Download Route
generateRouter.get('/download/:fileNames', (req, res) => {
    console.log('Inside download route');
    const fileNames = req.params.fileNames.split(',');
    const baseDir = path.join(__dirname, '../data/Output_UTDs');

    // Validate that every requested file exists
    for (const name of fileNames) {
        const filePath = path.join(baseDir, name);
        console.log('filePath', filePath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: `File not found: ${name}` });
        }
    }

    // If only one file is requested, download it directly
    if (fileNames.length === 1) {
        const singlePath = path.join(baseDir, fileNames[0]);
        return res.download(singlePath, fileNames[0]);
    }

    // Otherwise, stream a ZIP containing all requested files
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="Generate_UTDs.zip"');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', err => {
        console.error('Archive error', err);
        res.status(500).json({ error: 'Error creating archive' });
    });

    archive.pipe(res);

    fileNames.forEach(name => {
        const filePath = path.join(baseDir, name);
        archive.file(filePath, { name });
    });

    archive.finalize();
});

module.exports = generateRouter;