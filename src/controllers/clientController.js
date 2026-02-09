const db = require('../config/database');

exports.getAllClients = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Cliente');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getClientById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Cliente WHERE chr_cliecodigo = :id', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createClient = async (req, res) => {
    const { codigo, paterno, materno, nombre, dni, ciudad, direccion, telefono, email } = req.body;
    try {
        await db.query(
            'INSERT INTO Cliente (chr_cliecodigo, vch_cliepaterno, vch_cliematerno, vch_clienombre, chr_cliedni, vch_clieciudad, vch_cliedireccion, vch_clietelefono, vch_clieemail) VALUES (:codigo, :paterno, :materno, :nombre, :dni, :ciudad, :direccion, :telefono, :email)',
            { codigo, paterno, materno, nombre, dni, ciudad, direccion, telefono, email }
        );
        res.status(201).json({ message: 'Client created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateClient = async (req, res) => {
    const { id } = req.params;
    const { paterno, materno, nombre, dni, ciudad, direccion, telefono, email } = req.body;
    try {
        await db.query(
            'UPDATE Cliente SET vch_cliepaterno = :paterno, vch_cliematerno = :materno, vch_clienombre = :nombre, chr_cliedni = :dni, vch_clieciudad = :ciudad, vch_cliedireccion = :direccion, vch_clietelefono = :telefono, vch_clieemail = :email WHERE chr_cliecodigo = :id',
            { paterno, materno, nombre, dni, ciudad, direccion, telefono, email, id }
        );
        res.json({ message: 'Client updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteClient = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM Cliente WHERE chr_cliecodigo = :id', { id });
        res.json({ message: 'Client deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
