const db = require('../config/database');

exports.getAllAccounts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Cuenta');
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
        // Basic defaults: Active, 0 movements. Oracle uses SYSDATE.
        await db.query(
            'INSERT INTO Cuenta (chr_cuencodigo, chr_monecodigo, chr_sucucodigo, chr_emplcreacuenta, chr_cliecodigo, dec_cuensaldo, dtt_cuenfechacreacion, vch_cuenestado, int_cuencontmov, chr_cuenclave) VALUES (:codigo, :moneda, :sucursal, :empleado, :cliente, :saldo, SYSDATE, \'ACTIVO\', 0, :clave)',
            { codigo, moneda, sucursal, empleado, cliente, saldo, clave }
        );
        res.status(201).json({ message: 'Account created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
