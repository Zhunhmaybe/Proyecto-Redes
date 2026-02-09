const express = require('express');
const router = express.Router();
const multer = require('multer');
const replicationService = require('../services/replicationService');

// Configuración para recibir archivos grandes en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // Límite 50MB
});

// Obtener info de sucursales
router.get('/branches', (req, res) => {
    res.json({
        current: replicationService.getCurrentBranch(),
        branches: replicationService.getAllBranches()
    });
});

// Trigger manual para replicar un archivo existente
router.post('/replicate/:filename', async (req, res) => {
    try {
        const result = await replicationService.replicateBackup(req.params.filename);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para RECIBIR archivos de otras sucursales
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

// Listar backups recibidos de otros
router.get('/peer-backups', async (req, res) => {
    const backups = await replicationService.listPeerBackups();
    res.json({ backups });
});

// Health check para ver si la sucursal está viva
router.get('/health', (req, res) => {
    res.json({ status: 'ok', branch: replicationService.getCurrentBranch() });
});

module.exports = router;
