import * as authController from '../controllers/authController';

import * as express from 'express';
const router = express.Router();

router.get('/log-in', authController.loginGET);
router.get('/sign-up', authController.signupGET);

export default router;
