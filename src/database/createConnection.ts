import { createConnection, Connection } from "typeorm";

const createDBConnection = (): Promise<Connection> => createConnection();

export default createDBConnection;
