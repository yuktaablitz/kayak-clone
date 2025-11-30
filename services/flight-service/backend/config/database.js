require('dotenv').config();

const mysql = require('mysql2/promise');
const mongoose = require('mongoose');

const {
  MYSQL_HOST = 'localhost',
  MYSQL_PORT = 3306,
  MYSQL_USER = 'root',
  MYSQL_PASSWORD = '',
  MYSQL_DATABASE = 'kayak_flights',
  MONGO_URI = 'mongodb://localhost:27017/kayak_flights',
} = process.env;

let mysqlPool;

async function getMySqlPool() {
  if (!mysqlPool) {
    mysqlPool = await mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return mysqlPool;
}

async function connectMongo() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return mongoose.connection;
}

module.exports = {
  getMySqlPool,
  connectMongo,
};
