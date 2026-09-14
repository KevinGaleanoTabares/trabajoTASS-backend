
import express from 'express';
import { authRouter } from '../routes/auth.routes.js';
import { companyRouter } from '../routes/company.routes.js';
import authorizedPersonRoutes from '../routes/authorized-person.routes.js';
import conflictRoutes from '../routes/conflict.routes.js';
import familyDeclarationRoutes from './family-declaration.routes.js';

 const app = express();


app.use('/api/auth', authRouter);
app.use('/api/conflicts', conflictRoutes);
app.use('/api/authorized-persons', authorizedPersonRoutes);
app.use('/api/company', companyRouter);
app.use('/api/family-declarations', familyDeclarationRoutes);

export default  app;