const db = require('../config/database');

exports.getAllAccounts = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.chr_cuencodigo, 
                c.dec_cuensaldo, 
                c.vch_cuenestado, 
                c.dtt_cuenfechacreacion, 
                c.int_cuencontmov,
                cli.vch_cliepaterno, 
                cli.vch_cliematerno, 
                cli.vch_clienombre,
                m.chr_monecodigo,
                m.vch_monedescripcion,
                s.vch_sucunombre,
                e.vch_emplnombre AS vch_creador_nombre
            FROM Cuenta c
            JOIN Cliente cli ON c.chr_cliecodigo = cli.chr_cliecodigo
            JOIN Moneda m ON c.chr_monecodigo = m.chr_monecodigo
            JOIN Sucursal s ON c.chr_sucucodigo = s.chr_sucucodigo
            JOIN Empleado e ON c.chr_emplcreacuenta = e.chr_emplcodigo
            ORDER BY c.dtt_cuenfechacreacion DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAccountById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Cuenta WHERE chr_cuencodigo = :id', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Account not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createAccount = async (req, res) => {
    const { codigo, moneda, sucursal, empleado, cliente, saldo, clave } = req.body;
    try {
        await db.query(
            'INSERT INTO Cuenta (chr_cuencodigo, chr_monecodigo, chr_sucucodigo, chr_emplcreacuenta, chr_cliecodigo, dec_cuensaldo, dtt_cuenfechacreacion, vch_cuenestado, int_cuencontmov, chr_cuenclave) VALUES (:codigo, :moneda, :sucursal, :empleado, :cliente, :saldo, SYSDATE, \'ACTIVO\', 0, :clave)',
            { codigo, moneda, sucursal, empleado, cliente, saldo, clave }
        );
        res.status(201).json({ message: 'Account created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
