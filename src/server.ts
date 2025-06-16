import express from 'express';
import path from 'path';

import { route } from './routes'

const app = express();

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/cdn', route);

app.listen(3030, () => {
  console.log(`🚀 CDN rodando em http://localhost:${3030}`);
});