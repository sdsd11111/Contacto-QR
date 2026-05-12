import mysql from 'mysql2/promise';

// Configuración mínima para evitar problemas de handshake SSL en StackCP
const dbConfig: any = {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Eliminamos cualquier referencia a SSL para que el driver no intente negociar
    // Si el error persiste, el servidor podría estar configurado para REQUERIR SSL
    // pero el certificado es inválido o el driver no lo encuentra.
    // Sin embargo, el error 500 indica que el servidor NO lo soporta.
    connectTimeout: 30000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
};

const pool = mysql.createPool(dbConfig);

export default pool;
