import { Router } from 'express';

import { handleUpload, upload } from './controllers';

const route = Router();

route.post('/upload', upload.single('file'), handleUpload);

export { route };