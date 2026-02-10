
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

exports.listBackups = (req, res) => {
    const peerBackupsDir = path.join(__dirname, '../../peer_backups');
    if (!fs.existsSync(peerBackupsDir)) {
        return res.json([]);
    }
    const files = fs.readdirSync(peerBackupsDir);
    res.json(files);
};

exports.restoreBackup = async (req, res) => {
    const { filename, type } = req.body; 

    let baseDir;
    if (type === 'local') {
        baseDir = path.join(__dirname, '../../backups');
    } else {
        baseDir = path.join(__dirname, '../../peer_backups');
    }

    const filepath = path.join(baseDir, filename);

    if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: `Backup file not found in ${type} storage` });
    }

    let connection;
    try {
        const fileContent = fs.readFileSync(filepath, 'utf8');
        const backup = JSON.parse(fileContent);
        const data = backup.data; 

        console.log(`♻️ Restoring backup: ${filename} from branch ${backup.metadata ? backup.metadata.branchId : 'unknown'}`);

        connection = await db.getConnection();

        console.log('  🗑️ Cleaning existing data...');
        await connection.execute('DELETE FROM Movimiento');
        await connection.execute('DELETE FROM Cuenta');
        await connection.execute('DELETE FROM Cliente');
        await connection.execute('DELETE FROM Cliente');
        console.log('  💾 Inserting data...');

        if (data.Sucursal) {
            for (const row of data.Sucursal) {
                const check = await connection.execute('SELECT 1 FROM Sucursal WHERE chr_sucucodigo = :id', [row.CHR_SUCUCODIGO]);
                if (check.rows.length === 0) {
                    await connection.execute(
                        `INSERT INTO Sucursal (chr_sucucodigo, vch_sucunombre, vch_sucuciudad, vch_sucudireccion, int_sucucontcuenta) 
                        VALUES (:1, :2, :3, :4, :5)`,
                        [row.CHR_SUCUCODIGO, row.VCH_SUCUNOMBRE, row.VCH_SUCUCIUDAD, row.VCH_SUCUDIRECCION, row.INT_SUCUCONTCUENTA],
                        { autoCommit: true }
                    );
                }
            }
        }

        if (data.Empleado) {
            for (const row of data.Empleado) {
                const check = await connection.execute('SELECT 1 FROM Empleado WHERE chr_emplcodigo = :id', [row.CHR_EMPLCODIGO]);
                if (check.rows.length === 0) {
                    await connection.execute(
                        `INSERT INTO Empleado (chr_emplcodigo, vch_emplpaterno, vch_emplmaterno, vch_emplnombre, vch_emplciudad, vch_empldireccion, vch_emplusuario, vch_emplclave)
                         VALUES (:1, :2, :3, :4, :5, :6, :7, :8)`,
                        [row.CHR_EMPLCODIGO, row.VCH_EMPLPATERNO, row.VCH_EMPLMATERNO, row.VCH_EMPLNOMBRE, row.VCH_EMPLCIUDAD, row.VCH_EMPLDIRECCION, row.VCH_EMPLUSUARIO, row.VCH_EMPLCLAVE],
                        { autoCommit: true }
                    );
                }
            }
        }

        if (data.Cliente) {
            for (const row of data.Cliente) {
                await connection.execute(
                    `INSERT INTO Cliente (chr_cliecodigo, vch_cliepaterno, vch_cliematerno, vch_clienombre, chr_cliedni, vch_clieciudad, vch_cliedireccion, vch_clietelefono, vch_clieemail)
                     VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9)`,
                    [row.CHR_CLIECODIGO, row.VCH_CLIEPATERNO, row.VCH_CLIEMATERNO, row.VCH_CLIENOMBRE, row.CHR_CLIEDNI, row.VCH_CLIECIUDAD, row.VCH_CLIEDIRECCION, row.VCH_CLIETELEFONO, row.VCH_CLIEEMAIL],
                    { autoCommit: true }
                );
            }
        }

        if (data.Cuenta) {
            for (const row of data.Cuenta) {
                await connection.execute(
                    `INSERT INTO Cuenta (chr_cuencodigo, chr_monecodigo, chr_sucucodigo, chr_emplcreacuenta, chr_cliecodigo, dec_cuensaldo, dtt_cuenfechacreacion, vch_cuenestado, int_cuencontmov, chr_cuenclave)
                     VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10)`,
                    [row.CHR_CUENCODIGO, row.CHR_MONECODIGO, row.CHR_SUCUCODIGO, row.CHR_EMPLCREACUENTA, row.CHR_CLIECODIGO, row.DEC_CUENSALDO, new Date(row.DTT_CUENFECHACREACION), row.VCH_CUENESTADO, row.INT_CUENCONTMOV, row.CHR_CUENCLAVE],
                    { autoCommit: true }
                );
            }
        }

        if (data.Movimiento) {
            for (const row of data.Movimiento) {
                await connection.execute(
                    `INSERT INTO Movimiento (chr_cuencodigo, int_movinumero, dtt_movifecha, chr_emplcodigo, chr_tipocodigo, dec_moviimporte, chr_cuenreferencia)
                     VALUES (:1, :2, :3, :4, :5, :6, :7)`,
                    [row.CHR_CUENCODIGO, row.INT_MOVINUMERO, new Date(row.DTT_MOVIFECHA), row.CHR_EMPLCODIGO, row.CHR_TIPOCODIGO, row.DEC_MOVIIMPORTE, row.CHR_CUENREFERENCIA],
                    { autoCommit: true }
                );
            }
        }

        console.log('✅ Restore completed successfully.');
        res.json({ success: true, message: 'Database restored successfully from backup.' });

    } catch (error) {
        console.error('❌ Restore Error:', error);
        res.status(500).json({ error: 'Restore failed: ' + error.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (e) { console.error('Error closing connection', e); }
        }
    }
};

exports.nukeDatabase = async (req, res) => {
    const { currentUserId } = req.body;

    if (!currentUserId) {
        return res.status(400).json({ error: 'Current User ID is required' });
    }

    let connection;
    try {
        console.log(`☢️ NUKING DATABASE (Except user ${currentUserId})...`);
        connection = await db.getConnection();

        // 1. DELETE Transactional Data
        await connection.execute('DELETE FROM Movimiento');
        await connection.execute('DELETE FROM Cuenta');

        // 2. DELETE Clients
        await connection.execute('DELETE FROM Cliente');

        // 3. DELETE Asignado
        await connection.execute('DELETE FROM Asignado');

        // 4. DELETE Employees (Except current)
        await connection.execute('DELETE FROM Empleado WHERE chr_emplcodigo != :id', [currentUserId]);

        // 5. DELETE Sucursales
        await connection.execute('DELETE FROM Sucursal');

        console.log('✅ Database nuked successfully.');
        res.json({ success: true, message: 'DATABASE ERASED. Only your user remains.' });

    } catch (error) {
        console.error('❌ Nuke Error:', error);
        res.status(500).json({ error: 'Nuke failed: ' + error.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (e) { console.error('Error closing connection', e); }
        }
    }
};
