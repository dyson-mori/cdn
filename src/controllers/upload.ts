import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import multer from 'multer';

// 🛠 Criar pastas
const basePath = path.join(__dirname, '..', '..', 'uploads');
const originalPath = path.join(basePath, 'original');
const previewPath = path.join(basePath, 'preview');
const hlsPath = path.join(basePath, 'hls');

[originalPath, previewPath, hlsPath].forEach(dir => fs.mkdirSync(dir, { recursive: true }));

// 📁 Configurar upload
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, originalPath),
  filename: (_, file, cb) => cb(null, `${file.originalname}`),
});
export const upload = multer({ storage });

// 🎬 Gerar preview de 2 segundos
const generatePreview = (input: string, outputName: string): Promise<string> => {
  const output = path.join(previewPath, outputName);
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .setStartTime('00:00:00')
      .duration(2)
      .output(output)
      .size('640x360')
      .on('end', () => resolve(output))
      .on('error', reject)
      .run();
  });
};

// 📺 Gerar HLS (.m3u8 e .ts)
const generateHLS = (input: string, folderName: string): Promise<string> => {
  const outputDir = path.join(hlsPath, folderName);
  fs.mkdirSync(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .addOptions([
        '-profile:v baseline', // compatibilidade com players
        '-level 3.0',
        '-start_number 0',
        '-hls_time 5',
        '-hls_list_size 0',
        '-f hls',
      ])
      .output(path.join(outputDir, 'index.m3u8'))
      .on('end', () => resolve(outputDir))
      .on('error', reject)
      .run();
  });
};

// 🚀 Handler principal
export const handleUpload = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'Arquivo não enviado.' });
    return;
  }

  const timestamp = Date.now().toString();
  const filenameNoExt = path.parse(file.filename).name;

  try {
    // Preview
    const previewName = `${timestamp}.mp4`;
    await generatePreview(file.path, previewName);

    // HLS
    const hlsFolder = `${filenameNoExt}`;
    await generateHLS(file.path, hlsFolder);

    res.status(201).json({
      message: 'Upload, preview e HLS criados com sucesso!',
      original: `/uploads/original/${file.filename}`,
      preview: `/uploads/preview/${previewName}`,
      hls: `/uploads/hls/${hlsFolder}/index.m3u8`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar vídeo.' });
  }
};
