const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

class ReplicationService {
    constructor() {
        // Configuración de TODAS las sucursales
        // MODIFICA ESTAS IPs SEGÚN TU RED REAL
        this.branches = {
            '001': { name: 'Sucursal Quito', ip: '192.168.2.100', port: 3000 },
            '002': { name: 'Sucursal Guayaquil', ip: '192.168.2.101', port: 3000 },
            '003': { name: 'Sucursal Cuenca', ip: '192.168.5.1', port: 3000 },
            '004': { name: 'Sucursal Manta', ip: '192.168.4.1', port: 3000 },
            '005': { name: 'Sucursal Ambato', ip: '192.168.1.1', port: 3000 }
        };

        // Identifica quién soy yo (lee del .env)
        this.currentBranchId = process.env.BRANCH_ID || '001';

        // Directorios
        this.backupsDir = path.join(__dirname, '../../backups');
        this.peerBackupsDir = path.join(__dirname, '../../peer_backups');
    }

    async initialize() {
        try {
            await fs.mkdir(this.peerBackupsDir, { recursive: true });
            console.log('✅ Directorio peer_backups verificado');
        } catch (error) {
            console.error('❌ Error creando directorios:', error);
        }
    }

    // Enviar backup a TODAS las demás sucursales
    async replicateBackup(backupFilename) {
        const backupPath = path.join(this.backupsDir, backupFilename);

        try {
            await fs.access(backupPath);
            const otherBranches = Object.keys(this.branches).filter(id => id !== this.currentBranchId);

            console.log(`📤 Replicando ${backupFilename} a ${otherBranches.length} sucursales...`);

            const promises = otherBranches.map(branchId =>
                this.sendBackupToBranch(branchId, backupPath, backupFilename)
            );

            const responses = await Promise.allSettled(promises);
            const results = [];

            responses.forEach((result, index) => {
                const branchId = otherBranches[index];
                const branch = this.branches[branchId];
                if (result.status === 'fulfilled') {
                    console.log(`✅ Enviado a ${branch.name}`);
                    results.push({ branch: branchId, status: 'success' });
                } else {
                    console.error(`❌ Falló envío a ${branch.name}: ${result.reason.message}`);
                    results.push({ branch: branchId, status: 'failed', error: result.reason.message });
                }
            });

            return { success: true, total: otherBranches.length, results };

        } catch (error) {
            console.error('❌ Error general de replicación:', error);
            throw error;
        }
    }

    // Enviar a una sucursal específica
    async sendBackupToBranch(branchId, backupPath, backupFilename) {
        const branch = this.branches[branchId];
        const url = `http://${branch.ip}:${branch.port}/api/receive-backup`;

        const formData = new FormData();
        const fileBuffer = await fs.readFile(backupPath);

        formData.append('backup', fileBuffer, { filename: backupFilename });
        formData.append('sourceBranch', this.currentBranchId);
        formData.append('sourceName', this.branches[this.currentBranchId].name);

        const response = await axios.post(url, formData, {
            headers: formData.getHeaders(),
            timeout: 10000, // 10 segundos timeout
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        return response.data;
    }

    // Recibir y guardar backup de otro
    async receiveBackup(fileBuffer, sourceBranch, sourceName) {
        try {
            const filename = `backup-${sourceBranch}-${Date.now()}.json`;
            const filepath = path.join(this.peerBackupsDir, filename);

            await fs.writeFile(filepath, fileBuffer);
            console.log(`📥 Backup recibido de ${sourceName}`);

            return { success: true, filename };
        } catch (error) {
            console.error('❌ Error guardando backup recibido:', error);
            throw error;
        }
    }

    // Listar backups recibidos
    async listPeerBackups() {
        try {
            const files = await fs.readdir(this.peerBackupsDir);
            const backups = await Promise.all(files.map(async (filename) => {
                const stat = await fs.stat(path.join(this.peerBackupsDir, filename));
                return { filename, size: stat.size, created: stat.birthtime };
            }));
            return backups.sort((a, b) => b.created - a.created);
        } catch (error) {
            return [];
        }
    }

    getCurrentBranch() {
        return { id: this.currentBranchId, ...this.branches[this.currentBranchId] };
    }

    getAllBranches() {
        return Object.keys(this.branches).map(id => ({
            id, ...this.branches[id], isCurrent: id === this.currentBranchId
        }));
    }
}

module.exports = new ReplicationService();
