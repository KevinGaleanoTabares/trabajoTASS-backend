
import express from 'express';
import { authRouter } from '../routes/auth.routes.js';
import { companyRouter } from '../routes/company.routes.js';
import authorizedPersonRoutes from '../routes/authorized-person.routes.js';

 const app = express();


app.use('/api/auth', authRouter);
app.use('/api/authorized-persons', authorizedPersonRoutes);
app.use('/api/company', companyRouter);


export default  app;