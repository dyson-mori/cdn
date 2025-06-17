import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const basePath = path.join(__dirname, '..', '..', 'uploads');
const previewPath = path.join(basePath, 'preview');
const previewBlurPath = path.join(basePath, 'blur');
const hlsPath = path.join(basePath, 'hls');

[previewPath, previewBlurPath, hlsPath].forEach(dir => fs.mkdirSync(dir, { recursive: true }));

export function generatePreview(input: string, outputName: string): Promise<string> {
  const output = path.join(previewPath, outputName);
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .setStartTime('00:00:00')
      .duration(2)
      .output(output)
      // .size('640x360')
      .on('end', () => resolve(output))
      .on('error', reject)
      .run();
  });
};

export function generatePreviewBlur(input: string, outputName: string): Promise<string> {
  const output = path.join(previewBlurPath, outputName);
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .setStartTime('00:00:00')
      .duration(2)
      .videoFilter('boxblur=10:1')
      .videoBitrate('500k')
      .outputOptions('-preset veryfast')
      .output(output)
      .on('end', () => resolve(output))
      .on('error', reject)
      .run();
  });
};

export function generateHLS(input: string, folderName: string): Promise<string> {
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

export function getVideoSize(filePath: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const stream = metadata.streams.find(s => s.width && s.height);
      if (!stream) return reject(new Error('Dimensões não encontradas no vídeo.'));
      resolve({ width: stream.width!, height: stream.height! });
    });
  });
};
