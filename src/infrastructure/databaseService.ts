import mysqlp, { FieldPacket, RowDataPacket } from 'mysql2/promise';
import SecretsManagerServiceInterface from '../interfaces/SecretsManagerService';
import DatabaseServiceInterface from '../interfaces/DatabaseService';

export default class DatabaseService implements DatabaseServiceInterface {
  secretsManager: SecretsManagerServiceInterface;

  mysql: typeof mysqlp;

  constructor(secretsManager: SecretsManagerServiceInterface, mysql: typeof mysqlp) {
    this.secretsManager = secretsManager;
    this.mysql = mysql;
  }

  async get(query: string, params: string[] | undefined): Promise<[RowDataPacket[], FieldPacket[]]> {
    const dbConnectionDetailsString = await this.secretsManager.getSecret(process.env.SECRET);
    const dbConnectionDetails = JSON.parse(dbConnectionDetailsString) as StoredConnectionDetails;

    try {
      console.info('Creating database connection');
      const connection = await this.mysql.createConnection({
        user: dbConnectionDetails.username,
        password: dbConnectionDetails.password,
        host: dbConnectionDetails.host,
        port: dbConnectionDetails.port,
        database: process.env.SCHEMA_NAME,
      });

      console.info(`Executing query ${query} with params ${params.join(', ')}`);
      const result = await connection.execute<RowDataPacket[]>(query, params);

      return result;
    } catch (e) {
      // Type checking because the type of e can't be specified in the params
      if (e instanceof Error) {
        e.message = `Database error: ${e.message}`;
      }

      throw e;
    }
  }
}

type StoredConnectionDetails = {
  username: string;
  password: string;
  engine: string;
  host: string;
  port: number;
  dbname: string;
  dbClusterIdentifier: string;
};
