import * as express from 'express';
import * as messageController from '../controllers/messageController';

const router = express.Router();

router.get('/new', messageController.messageGET);
router.post('/new', messageController.messagePOST);

export default router;
