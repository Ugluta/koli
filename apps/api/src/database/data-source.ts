import 'reflect-metadata';
import { DataSource } from 'typeorm';

// Standalone DataSource used by the TypeORM CLI (migration generate/run).
// The running app configures TypeORM separately in app.module.ts.
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgresql://koli:koli@localhost:5432/koli',
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
