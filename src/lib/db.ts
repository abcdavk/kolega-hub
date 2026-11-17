import mysql, { type Pool } from "mysql2/promise";

const globalForMySql = globalThis as typeof globalThis & {
  mysqlPool?: Pool;
};

export function getDb() {
  if (globalForMySql.mysqlPool) return globalForMySql.mysqlPool;

  const required = ["DB_HOST", "DB_USER", "DB_NAME"] as const;
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? "3306"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4",
  });
  globalForMySql.mysqlPool = pool;
  return pool;
}
