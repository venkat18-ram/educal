import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6929740f000b0b4f1db4'); // <--- PASTE YOUR PROJECT ID HERE

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// These are the IDs we created in Phase 1
export const DB_ID = 'educalcexpert_db';
export const COLLECTION_USERS = 'users';
export const COLLECTION_REQUESTS = 'requests';
export const BUCKET_FILES = 'educalc_files';