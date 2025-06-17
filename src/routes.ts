import { Router } from 'express';

import { handleUpload } from './controllers/upload';
import { handlePreview } from './controllers/preview';

import storage from "./utils/storage";

const route = Router();

route.get('/preview/:isPrivate/:fileName', handlePreview);
route.post('/upload', storage.single('file'), handleUpload);

export { route };