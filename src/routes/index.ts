import * as express from 'express';
import * as indexController from '../controllers/indexController';

const router = express.Router();

router.get('/', indexController.indexGET);

export default router;
