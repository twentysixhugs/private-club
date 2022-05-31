import * as express from 'express';
import * as messageController from '../controllers/messageController';

const router = express.Router();

router.get('/new', messageController.messageFormGET);
router.post('/new', messageController.messageCreatePOST);

router.post('/delete/:id', messageController.messageDeletePOST);

export default router;
