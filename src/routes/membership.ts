import * as express from 'express';
import * as userController from '../controllers/userController';
const router = express.Router();

// admin or member
router.get('/:membership', userController.membershipGET);
router.post('/:membership', userController.membershipPOST);

export default router;
