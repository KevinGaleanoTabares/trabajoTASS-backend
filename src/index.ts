import { startServer } from './server.js';

startServer().catch((error: unknown) => {
    console.error('Was not possible to start the server:', error);
    process.exit(1);
});