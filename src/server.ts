import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';

export async function startServer(): Promise<void> {
    await mongoose.connect(env.mongoUri);

    console.log('Connection to MongoDB succeeded')

    app.listen(env.port, () => {
        console.log(`Server running on http://localhost:${env.port}`);
    });
}
