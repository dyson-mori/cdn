import { Request, Response } from 'express';

import { generateHLS, generatePreview, getVideoSize, generatePreviewBlur } from '../utils/ffmpeg';

export async function handleUpload(req: Request, res: Response) {
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: 'Arquivo não enviado.' });
    return;
  };

  const timestamp = Date.now().toString();

  // console.log({ timestamp: `tag: ${timestamp}, type: ${typeof timestamp}` });
  // console.log({ file });

  try {
    const previewName = `${timestamp}.mp4`;
    await generatePreview(file.path, previewName);
    await generatePreviewBlur(file.path, previewName)

    const hlsFolder = `${timestamp}`;
    await generateHLS(file.path, hlsFolder);

    const size = await getVideoSize(file.path);

    res.status(201).json({
      cdn_id: timestamp,
      preview: `http://localhost:3030/cdn/preview/true/${previewName}`,
      url: `/uploads/hls/${hlsFolder}/index.m3u8`,
      ...size
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar vídeo.' });
  }
};
