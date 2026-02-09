const oracledb = require('oracledb');
const dotenv = require('dotenv');

dotenv.config();

// Enable AutoCommit for simplicity in this demo, though manual is better for transactions
oracledb.autoCommit = true;

const dbConfig = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`,
};

async function initialize() {
    try {
        await oracledb.createPool({
            ...dbConfig,
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 2
        });
        console.log('Oracle Database pool created');
    } catch (err) {
        console.error('Error creating Oracle pool:', err);
        process.exit(1);
    }
}

// Wrapper for executing queries (simulates mysql2 format roughly for easier refactoring)
async function query(sql, params = [], options = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection();

        // Oracle uses :0, :1, :2 or :name for binds.
        // If params is an array, we execute as-is assuming the SQL uses :0, :1 styles
        // or we need to convert ? to :n.

        // Simple regex to convert ? to :0, :1, :2...
        if (Array.isArray(params) && sql.includes('?')) {
            let i = 0;
            sql = sql.replace(/\?/g, () => `:${i++}`);
        }

        const result = await connection.execute(sql, params, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            autoCommit: options.autoCommit !== undefined ? options.autoCommit : true, // Default autocommit
            ...options
        });

        return [result.rows, result]; // Return tuple to match [rows, fields] signature of mysql2 roughly
    } catch (err) {
        console.error('Query Error:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

// Transaction helper
async function getConnection() {
    return await oracledb.getConnection();
}

module.exports = {
    initialize,
    query,
    getConnection
};
