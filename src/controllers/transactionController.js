const db = require('../config/database');

const getNextMovementNumber = async (accountId) => {
    const [rows] = await db.query('SELECT MAX(int_movinumero) as maxNum FROM Movimiento WHERE chr_cuencodigo = ?', [accountId]);
    return (rows[0].maxNum || 0) + 1;
};

exports.deposit = async (req, res) => {
    const { accountId, amount, employeeId } = req.body;
    let connection;
    try {
        connection = await db.getConnection();

        await connection.execute(
            'UPDATE Cuenta SET dec_cuensaldo = dec_cuensaldo + :amount, int_cuencontmov = int_cuencontmov + 1 WHERE chr_cuencodigo = :accountId',
            { amount, accountId },
            { autoCommit: false }
        );

        const result = await connection.execute(
            'SELECT MAX(int_movinumero) as maxNum FROM Movimiento WHERE chr_cuencodigo = :accountId',
            [accountId]
        );
        const nextMovNum = (result.rows[0].MAXNUM || result.rows[0].maxNum || 0) + 1;

        await connection.execute(
            'INSERT INTO Movimiento (chr_cuencodigo, int_movinumero, dtt_movifecha, chr_emplcodigo, chr_tipocodigo, dec_moviimporte, chr_cuenreferencia) VALUES (:accountId, :nextMovNum, SYSDATE, :employeeId, \'003\', :amount, NULL)',
            { accountId, nextMovNum, employeeId, amount },
            { autoCommit: false }
        );

        await connection.commit();
        res.json({ message: 'Deposit successful' });
    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
};

exports.withdraw = async (req, res) => {
    const { accountId, amount, employeeId, accountPassword } = req.body;
    let connection;

    try {
        connection = await db.getConnection();

        const result = await connection.execute(
            'SELECT dec_cuensaldo, chr_cuenclave FROM Cuenta WHERE chr_cuencodigo = :accountId',
            [accountId]
        );

        if (result.rows.length === 0) throw new Error('Account not found');
        const account = result.rows[0];

        const saldo = account.DEC_CUENSALDO;
        const clave = account.CHR_CUENCLAVE;

        if (clave !== accountPassword) throw new Error('Invalid password');
        if (saldo < amount) throw new Error('Insufficient funds');

        await connection.execute(
            'UPDATE Cuenta SET dec_cuensaldo = dec_cuensaldo - :amount, int_cuencontmov = int_cuencontmov + 1 WHERE chr_cuencodigo = :accountId',
            { amount, accountId },
            { autoCommit: false }
        );

        const resMov = await connection.execute('SELECT MAX(int_movinumero) as maxNum FROM Movimiento WHERE chr_cuencodigo = :id', [accountId]);
        const nextMovNum = (resMov.rows[0].MAXNUM || 0) + 1;

        await connection.execute(
            'INSERT INTO Movimiento (chr_cuencodigo, int_movinumero, dtt_movifecha, chr_emplcodigo, chr_tipocodigo, dec_moviimporte, chr_cuenreferencia) VALUES (:id, :num, SYSDATE, :emp, \'004\', :amt, NULL)',
            { id: accountId, num: nextMovNum, emp: employeeId, amt: amount },
            { autoCommit: false }
        );

        await connection.commit();
        res.json({ message: 'Withdrawal successful' });
    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
};

exports.transfer = async (req, res) => {
    const { sourceAccountId, targetAccountId, amount, employeeId, accountPassword } = req.body;
    let connection;

    try {
        connection = await db.getConnection();

        const sourceRes = await connection.execute('SELECT dec_cuensaldo, chr_cuenclave FROM Cuenta WHERE chr_cuencodigo = :id', [sourceAccountId]);
        if (sourceRes.rows.length === 0) throw new Error('Source account not found');

        const source = sourceRes.rows[0];
        if (source.CHR_CUENCLAVE !== accountPassword) throw new Error('Invalid password');
        if (source.DEC_CUENSALDO < amount) throw new Error('Insufficient funds');

        const targetRes = await connection.execute('SELECT chr_cuencodigo FROM Cuenta WHERE chr_cuencodigo = :id', [targetAccountId]);
        if (targetRes.rows.length === 0) throw new Error('Target account not found');

        await connection.execute(
            'UPDATE Cuenta SET dec_cuensaldo = dec_cuensaldo - :amt, int_cuencontmov = int_cuencontmov + 1 WHERE chr_cuencodigo = :id',
            { amt: amount, id: sourceAccountId },
            { autoCommit: false }
        );

        const sMovRes = await connection.execute('SELECT MAX(int_movinumero) as maxNum FROM Movimiento WHERE chr_cuencodigo = :id', [sourceAccountId]);
        const sNextMov = (sMovRes.rows[0].MAXNUM || 0) + 1;

        await connection.execute(
            'INSERT INTO Movimiento (chr_cuencodigo, int_movinumero, dtt_movifecha, chr_emplcodigo, chr_tipocodigo, dec_moviimporte, chr_cuenreferencia) VALUES (:id, :num, SYSDATE, :emp, \'009\', :amt, :ref)',
            { id: sourceAccountId, num: sNextMov, emp: employeeId, amt: amount, ref: targetAccountId },
            { autoCommit: false }
        );

        await connection.execute(
            'UPDATE Cuenta SET dec_cuensaldo = dec_cuensaldo + :amt, int_cuencontmov = int_cuencontmov + 1 WHERE chr_cuencodigo = :id',
            { amt: amount, id: targetAccountId },
            { autoCommit: false }
        );

        const tMovRes = await connection.execute('SELECT MAX(int_movinumero) as maxNum FROM Movimiento WHERE chr_cuencodigo = :id', [targetAccountId]);
        const tNextMov = (tMovRes.rows[0].MAXNUM || 0) + 1;

        await connection.execute(
            'INSERT INTO Movimiento (chr_cuencodigo, int_movinumero, dtt_movifecha, chr_emplcodigo, chr_tipocodigo, dec_moviimporte, chr_cuenreferencia) VALUES (:id, :num, SYSDATE, :emp, \'008\', :amt, :ref)',
            { id: targetAccountId, num: tNextMov, emp: employeeId, amt: amount, ref: sourceAccountId },
            { autoCommit: false }
        );

        await connection.commit();
        res.json({ message: 'Transfer successful' });
    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
};
