import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config.js'; // Carga el .env automáticamente

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false, // Las migraciones reemplazan el synchronize
  logging: true,
  entities: [join(__dirname, '**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  subscribers: [],
});
