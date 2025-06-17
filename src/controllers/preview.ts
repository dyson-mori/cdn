import { Request, Response } from 'express';

import fs from 'fs';
import path from 'path';

const videoDB = [
  {
    id: "1750172646543",
    preview: "/uploads/preview/1750172646543.mp4",
    isPrivate: true,
  },
];

export async function handlePreview(request: Request, response: Response) {
  const { id } = request.params;

  // Buscar o vídeo
  const video = videoDB.find(v => v.id === id);

  if (!video) {
    response.status(404).json({ error: 'Vídeo não encontrado' });
    return;
  };

  const filePath = path.join(__dirname, '..', video.preview);

  if (!fs.existsSync(filePath)) {
    response.status(404).json({ error: 'Arquivo não encontrado' });
    return;
  }

  // Se for privado, gerar versão com blur
  if (video.isPrivate) {
    const blurredPath = path.join(__dirname, '..', 'uploads', 'preview', `${id}_blurred.mp4`);

    // Se a versão com blur ainda não foi gerada
    if (!fs.existsSync(blurredPath)) {
      const ffmpeg = await import('fluent-ffmpeg');

      await new Promise((resolve, reject) => {
        ffmpeg.default(filePath)
          .videoFilter('boxblur=10:1') // blur forte
          .output(blurredPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
    }

    response.sendFile(blurredPath);
    return;
  }

  // Caso contrário, envia o original
  response.sendFile(filePath);
};