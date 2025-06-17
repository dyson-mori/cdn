import express from 'express';
import path from 'path';
import cors from 'cors';


import { route } from './routes'

const app = express();

const hlsFolder = path.join(__dirname, '..', 'uploads', 'hls');

app.use(cors());

app.use('/cdn/uploads/hls', express.static(hlsFolder));
app.use('/cdn', route);

app.listen(3030, () => {
  console.log(`🚀 CDN rodando em http://localhost:${3030}`);
});