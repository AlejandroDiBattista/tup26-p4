import 'dotenv/config';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from './schema.js';

const client = createClient({
    url: process.env.DB_FILE_NAME || 'file:minicrm.db',
});

export const db = drizzle({
    client,
    schema,
});
