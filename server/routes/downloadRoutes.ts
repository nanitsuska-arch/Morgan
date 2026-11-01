import { Router, Request, Response } from 'express';
import axios from 'axios';
import { spawn } from 'child_process';
import { isSafeMediaUrl } from '../utils/validator.js';
import { verifyMediaUrlAlive } from '../services/tikwmService.js';

const router = Router();

/**
 * Sanitizes filename to prevent header injection or directory traversal
 */
function sanitizeFilename(name?: string, defaultExt = 'mp4'): string {
  if (!name || typeof name !== 'string') {
    return `snaptok_${Date.now()}.${defaultExt}`;
  }
  let clean = name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, 60);
  if (!clean.endsWith(`.${defaultExt}`)) {
    clean += `.${defaultExt}`;
  }
  return clean;
}

/**
 * GET /api/download
 * Streams media file directly to user with attachment disposition and fallback failover
 */
router.get('/', async (req: Request, res: Response) => {
  const mediaUrl = req.query.url as string;
  const fallbackUrl = req.query.fallbackUrl as string | undefined;
  const rawFilename = req.query.filename as string | undefined;
  const format = ((req.query.format as string) || 'mp4').toLowerCase();
  const convertMp3 = req.query.convertMp3 === 'true' || format === 'mp3';

  if (!mediaUrl) {
    return res.status(400).json({ success: false, error: 'Media URL parameter is required.' });
  }

  if (!isSafeMediaUrl(mediaUrl)) {
    return res.status(403).json({ success: false, error: 'Access to this media URL domain is not permitted.' });
  }

  const safeFilename = sanitizeFilename(rawFilename, format === 'mp3' ? 'mp3' : 'mp4');

  // Candidate URLs in priority order
  const candidates: string[] = [mediaUrl];
  if (fallbackUrl && isSafeMediaUrl(fallbackUrl) && fallbackUrl !== mediaUrl) {
    candidates.push(fallbackUrl);
  }

  // If format is MP3 and URL is a video or needs conversion, convert via ffmpeg
  const isVideoSource = mediaUrl.includes('.mp4') || mediaUrl.includes('/video/') || mediaUrl.includes('mime_type=video');

  if (convertMp3 && isVideoSource) {
    console.log(`[SnapTok] Converting video audio to genuine MP3 for: ${safeFilename}`);

    try {
      // Fetch the video stream via secure Axios with anti-SSRF redirect validation
      const videoSourceRes = await axios({
        method: 'GET',
        url: mediaUrl,
        responseType: 'stream',
        timeout: 30000,
        maxRedirects: 5,
        beforeRedirect: (options: any, responseDetails: any) => {
          const nextUrl = responseDetails.headers?.location;
          if (nextUrl) {
            const resolved = new URL(nextUrl, options.href || options.url).toString();
            if (!isSafeMediaUrl(resolved)) {
              throw new Error('SSRF blocked: Redirect to untrusted host rejected.');
            }
          }
        },
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Referer: 'https://www.tiktok.com/',
          Accept: '*/*',
        },
      });

      // Set headers for MP3 download
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');

      // Spawn ffmpeg to transcode audio from stdin stream to 192kbps MP3
      const ffmpeg = spawn('ffmpeg', [
        '-i', 'pipe:0',
        '-vn',
        '-acodec', 'libmp3lame',
        '-b:a', '192k',
        '-f', 'mp3',
        'pipe:1',
      ]);

      videoSourceRes.data.pipe(ffmpeg.stdin);
      ffmpeg.stdout.pipe(res);

      videoSourceRes.data.on('error', (err: any) => {
        console.error('[SnapTok] Video source stream error for MP3 conversion:', err?.message);
        try { ffmpeg.stdin.destroy(); } catch {}
      });

      ffmpeg.on('error', (err) => {
        console.error('[SnapTok] ffmpeg process error:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: 'Audio extraction failed' });
        }
      });

      req.on('close', () => {
        try { ffmpeg.kill('SIGKILL'); } catch {}
      });

      return;
    } catch (ffmpegErr: any) {
      console.warn('[SnapTok] Direct ffmpeg conversion failed, will attempt fallback stream:', ffmpegErr?.message);
      // Fall through to regular stream if conversion setup fails
    }
  }

  // Standard Direct Stream (MP4 video or direct audio stream)
  let streamed = false;

  for (const targetUrl of candidates) {
    try {
      const response = await axios({
        method: 'GET',
        url: targetUrl,
        responseType: 'stream',
        timeout: 25000,
        maxRedirects: 5,
        beforeRedirect: (options: any, responseDetails: any) => {
          const nextUrl = responseDetails.headers?.location;
          if (nextUrl) {
            const resolved = new URL(nextUrl, options.href || options.url).toString();
            if (!isSafeMediaUrl(resolved)) {
              throw new Error('SSRF blocked: Redirect to untrusted host rejected.');
            }
          }
        },
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Referer: 'https://www.tiktok.com/',
          Accept: '*/*',
        },
      });

      if (response.status < 200 || response.status >= 400) {
        console.warn(`[SnapTok] Candidate URL returned status ${response.status}: ${targetUrl}`);
        continue;
      }

      // Detect Content Type
      let contentType = 'video/mp4';
      if (format === 'mp3') contentType = 'audio/mpeg';
      else if (format === 'jpg' || format === 'jpeg') contentType = 'image/jpeg';
      else if (format === 'webp') contentType = 'image/webp';

      const rawCt = response.headers['content-type'];
      if (rawCt && typeof rawCt === 'string' && !rawCt.includes('text/html') && !rawCt.includes('application/json')) {
        contentType = rawCt;
      }

      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');

      const cl = response.headers['content-length'];
      if (cl) {
        res.setHeader('Content-Length', String(cl));
      }
      res.setHeader('Cache-Control', 'public, max-age=3600');

      response.data.pipe(res);
      streamed = true;
      break;
    } catch (err: any) {
      console.warn(`[SnapTok] Stream attempt failed for URL: ${targetUrl}`, err?.message);
    }
  }

  if (!streamed && !res.headersSent) {
    return res.status(502).json({
      success: false,
      error: 'Unable to stream media from TikTok CDN. The video link may have expired or is restricted. Please try again.',
    });
  }
});

/**
 * GET /api/download/check
 * Verifies if a media URL is still active
 */
router.get('/check', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl || !isSafeMediaUrl(targetUrl)) {
    return res.status(400).json({ success: false, alive: false, error: 'Invalid or forbidden URL' });
  }

  const isAlive = await verifyMediaUrlAlive(targetUrl, 5000);
  return res.json({ success: true, alive: isAlive });
});

export default router;
