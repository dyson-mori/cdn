import { Request, Response } from 'express';

import fs from 'fs';
import path from 'path';

const previewFolder = path.join(__dirname, '..', '..', 'uploads', 'preview');
const previewBlurFolder = path.join(__dirname, '..', '..', 'uploads', 'blur');

export async function handlePreview(request: Request, response: Response) {
  const { isPrivate, fileName } = request.params;

  const folder = isPrivate === 'true' ? previewBlurFolder : previewFolder;
  const filePath = path.join(folder, fileName);

  if (!fs.existsSync(filePath)) {
    response.status(404).json({ error: 'Arquivo não encontrado.' });
    return
  };

  // if (isPrivate) {
  //   // response.status(401).send('🔒 Acesso negado ao vídeo privado.');
  //   response.status(404).json({ error: 'Arquivo não encontrado.' });
  //   return 
  // };

  response.setHeader('Content-Type', 'video/mp4');
  fs.createReadStream(filePath).pipe(response);
}