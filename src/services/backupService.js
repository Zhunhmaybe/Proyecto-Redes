const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const db = require('../config/database');
const replicationService = require('./replicationService');

dotenv.config();

class BackupService {
    constructor() {
        this.backupDir = path.join(__dirname, '../../backups');
        this.branchId = process.env.BRANCH_ID || '001';
        this.autoReplicate = process.env.AUTO_REPLICATE === 'true';
        this.backupInterval = parseInt(process.env.BACKUP_INTERVAL_MINUTES) || 5;
    }

    async initialize() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
            await replicationService.initialize();
            this.scheduleAutomaticBackups();
            console.log('✅ Servicio de Backup Inicializado');
            console.log(`⏰ Backups automáticos cada ${this.backupInterval} minutos`);
            console.log(`🔄 Auto-replicación: ${this.autoReplicate ? 'ACTIVADA' : 'DESACTIVADA'}`);
        } catch (error) {
            console.error('❌ Error inicializando backup service:', error);
        }
    }

    async createFullBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${this.branchId}-${timestamp}.json`;
        const filepath = path.join(this.backupDir, filename);

        try {
            console.log('🔄 Iniciando backup local...');

            // Lista de tablas a respaldar
            const tables = ['Sucursal', 'Empleado', 'Cliente', 'Cuenta', 'Movimiento'];
            const backupData = {
                metadata: {
                    branchId: this.branchId,
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                },
                data: {}
            };

            for (const table of tables) {
                try {
                    // Consulta simple a Oracle
                    const result = await db.query(`SELECT * FROM ${table}`);
                    backupData.data[table] = result[0] || []; // result[0] contiene las rows
                    console.log(`  ✓ Tabla ${table} respaldada (${backupData.data[table].length} registros)`);
                } catch (e) {
                    console.error(`  ⚠️ Error leyendo tabla ${table}: ${e.message}`);
                    backupData.data[table] = [];
                }
            }

            await fs.writeFile(filepath, JSON.stringify(backupData, null, 2));
            const stats = await fs.stat(filepath);
            console.log(`✅ Backup local creado: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);

            // AUTO-REPLICACIÓN
            if (this.autoReplicate) {
                console.log('🚀 Iniciando auto-replicación...');
                replicationService.replicateBackup(filename)
                    .then(result => {
                        const successful = result.results.filter(r => r.status === 'success').length;
                        console.log(`📤 Replicación completada: ${successful}/${result.total} sucursales alcanzadas`);
                    })
                    .catch(e => console.error('❌ Error en auto-replicación:', e.message));
            }

            return { success: true, filename, size: stats.size };

        } catch (error) {
            console.error('❌ Error fatal en backup:', error);
            throw error;
        }
    }

    async listBackups() {
        try {
            const files = await fs.readdir(this.backupDir);
            const backups = await Promise.all(
                files
                    .filter(f => f.endsWith('.json') && f.startsWith('backup-'))
                    .map(async (filename) => {
                        const stats = await fs.stat(path.join(this.backupDir, filename));
                        return {
                            filename,
                            size: stats.size,
                            created: stats.birthtime
                        };
                    })
            );
            return backups.sort((a, b) => b.created - a.created);
        } catch (e) {
            return [];
        }
    }

    scheduleAutomaticBackups() {
        // Schedule backup every X minutes
        cron.schedule(`*/${this.backupInterval} * * * *`, async () => {
            console.log(`⏰ [CRON] Ejecutando backup automático programado...`);
            await this.createFullBackup();
        });
    }
}

module.exports = new BackupService();
