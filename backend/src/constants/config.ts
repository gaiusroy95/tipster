import * as dotenv from 'dotenv';

dotenv.config();

export const X_API_KEY = process.env.X_API_KEY ?? '';
