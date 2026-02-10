const express = require('express');
const cors = require('cors');
require('dotenv').config();

const compression = require('compression');
const helmet = require('helmet');
const db = require('./config/database');
const backupService = require('./services/backupService');
const replicationService = require('./services/replicationService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

app.get('/api', (req, res) => {
    res.json({
        message: 'Banco Pacifico Core Banking System - DR Enabled',
        branch: replicationService.getCurrentBranch(),
        status: 'Online',
        features: ['Backup Automático', 'Replicación Multi-Sucursal', 'Disaster Recovery']
    });
});

const apiRoutes = require('./routes/api');
const replicationRoutes = require('./routes/replication');

app.use('/api', apiRoutes);
app.use('/api', replicationRoutes);

    async function startServer() {
    try {
        console.log('=================================');
        console.log('🏦 BANCO PACÍFICO - SISTEMA DR');
        console.log('=================================');

        console.log('🔌 Conectando a Oracle...');
        await db.initialize();
        console.log('✅ Conexión a Oracle establecida');

        console.log('💾 Iniciando Servicios de Backup...');
        await backupService.initialize();

        const branch = replicationService.getCurrentBranch();

        app.listen(PORT, '0.0.0.0', () => {
            console.log('=================================');
            console.log(`🚀 SERVIDOR INICIADO`);
            console.log(`📍 Sucursal: ${branch.name} (ID: ${branch.id})`);
            console.log(`🌐 IP: http://${branch.ip}:${PORT}`);
            console.log(`🌐 Local: http://localhost:${PORT}`);
            console.log('=================================');
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();
