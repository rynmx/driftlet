import { Pool } from 'pg';

declare global {
  // This allows us to use a global variable for the database pool in development
  // to prevent creating a new pool on every hot reload.
  var dbPool: Pool | undefined;
}
