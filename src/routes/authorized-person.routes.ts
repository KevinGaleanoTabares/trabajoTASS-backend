import { Router } from 'express';
import {
    createAuthorizedPerson,
} from '../controllers/authorized-person.controller.js';

const router = Router();

router.post('/', createAuthorizedPerson);

export default router;