const db = require('../config/database');

exports.getAllEmployees = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Empleado');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Empleado WHERE chr_emplcodigo = :id', { id: req.params.id });
        if (rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createEmployee = async (req, res) => {
    const { codigo, paterno, materno, nombre, ciudad, direccion, usuario, clave } = req.body;
    try {
        await db.query(
            'INSERT INTO Empleado (chr_emplcodigo, vch_emplpaterno, vch_emplmaterno, vch_emplnombre, vch_emplciudad, vch_empldireccion, vch_emplusuario, vch_emplclave) VALUES (:codigo, :paterno, :materno, :nombre, :ciudad, :direccion, :usuario, :clave)',
            { codigo, paterno, materno, nombre, ciudad, direccion, usuario, clave }
        );
        res.status(201).json({ message: 'Employee created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { usuario, clave } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM Empleado WHERE vch_emplusuario = :usuario AND vch_emplclave = :clave', { usuario, clave });
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        // In a real app, generate JWT here. For now, return employee details.
        res.json({ message: 'Login successful', employee: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { paterno, materno, nombre, ciudad, direccion, usuario, clave } = req.body;
    try {
        await db.query(
            'UPDATE Empleado SET vch_emplpaterno = :paterno, vch_emplmaterno = :materno, vch_emplnombre = :nombre, vch_emplciudad = :ciudad, vch_empldireccion = :direccion, vch_emplusuario = :usuario, vch_emplclave = :clave WHERE chr_emplcodigo = :id',
            { paterno, materno, nombre, ciudad, direccion, usuario, clave, id }
        );
        res.json({ message: 'Employee updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM Empleado WHERE chr_emplcodigo = :id', { id });
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
