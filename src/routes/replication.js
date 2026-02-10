const express = require('express');
const router = express.Router();
const multer = require('multer');
const replicationService = require('../services/replicationService');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }
});

router.get('/branches', (req, res) => {
    res.json({
        current: replicationService.getCurrentBranch(),
        branches: replicationService.getAllBranches()
    });
});

router.post('/replicate/:filename', async (req, res) => {
    try {
        const result = await replicationService.replicateBackup(req.params.filename);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/receive-backup', upload.single('backup'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file' });

        const result = await replicationService.receiveBackup(
            req.file.buffer,
            req.body.sourceBranch,
            req.body.sourceName
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/peer-backups', async (req, res) => {
    const backups = await replicationService.listPeerBackups();
    res.json({ backups });
});

router.get('/health', (req, res) => {
    res.json({ status: 'ok', branch: replicationService.getCurrentBranch() });
});

module.exports = router;
