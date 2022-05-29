import * as authController from '../controllers/authController';

import * as express from 'express';
const router = express.Router();

router.get('/sign-up', authController.signupGET);
router.post('/sign-up', authController.signupPOST);

router.get('/log-in', authController.loginGET);
router.post('/log-in', authController.loginPOST);

router.post('/logout', authController.logoutPOST);

export default router;
