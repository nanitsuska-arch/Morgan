import { Router, Request, Response } from 'express';
import { isValidTikTokUrl } from '../utils/validator.js';
import { fetchTikTokData } from '../services/tikwmService.js';

const router = Router();

/**
 * POST /api/tiktok/info
 * Fetch metadata and download options for a single TikTok video URL
 */
router.post('/info', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    const validation = isValidTikTokUrl(url);
    if (!validation.valid || !validation.normalizedUrl) {
      return res.status(400).json({
        success: false,
        error: validation.error || 'Please provide a valid TikTok video URL.',
      });
    }

    const videoData = await fetchTikTokData(validation.normalizedUrl);

    return res.json({
      success: true,
      data: videoData,
    });
  } catch (error: any) {
    console.error('Error fetching TikTok video:', error?.message || error);
    const message = error?.message || 'Failed to retrieve TikTok video. Please check the URL and try again.';
    return res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * POST /api/tiktok/batch-info
 * Process multiple TikTok URLs in bulk
 */
router.post('/batch-info', async (req: Request, res: Response) => {
  try {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of TikTok URLs to process.',
      });
    }

    // Limit batch size to 25 items to protect resources
    const safeUrls = urls.slice(0, 25);

    // Process in parallel with concurrency limit or map
    const results = await Promise.all(
      safeUrls.map(async (rawUrl: string) => {
        const validation = isValidTikTokUrl(rawUrl);
        if (!validation.valid || !validation.normalizedUrl) {
          return {
            url: rawUrl,
            success: false,
            error: validation.error || 'Invalid TikTok URL format',
          };
        }

        try {
          const data = await fetchTikTokData(validation.normalizedUrl);
          return {
            url: validation.normalizedUrl,
            success: true,
            data,
          };
        } catch (err: any) {
          return {
            url: rawUrl,
            success: false,
            error: err?.message || 'Failed to retrieve video information',
          };
        }
      })
    );

    return res.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Batch processing error:', error);
    return res.status(500).json({
      success: false,
      error: 'Batch processing encountered an internal error.',
    });
  }
});

export default router;
