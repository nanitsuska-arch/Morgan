import { useState, useEffect, useCallback, useRef } from 'react';

const TIKTOK_PATTERN = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.|m\.|t\.)?(?:tiktok\.com|douyin\.com)\/[^\s]+/i;

export function useClipboardWatcher(onUrlDetected?: (url: string) => void) {
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const lastCheckedTextRef = useRef<string>('');
  const dismissedUrlsRef = useRef<Set<string>>(new Set());

  const checkClipboard = useCallback(async () => {
    // Only attempt if page is focused and clipboard API is supported
    if (!navigator?.clipboard?.readText || !document.hasFocus()) {
      return;
    }

    try {
      // Query permission if supported in Permissions API to prevent intrusive prompts
      if (navigator.permissions && (navigator.permissions as any).query) {
        try {
          const status = await (navigator.permissions as any).query({ name: 'clipboard-read' });
          if (status.state === 'denied') return;
        } catch {
          // Some browsers throw on querying clipboard-read; continue gently
        }
      }

      const text = (await navigator.clipboard.readText()).trim();
      if (!text || text === lastCheckedTextRef.current) return;
      lastCheckedTextRef.current = text;

      if (TIKTOK_PATTERN.test(text) && !dismissedUrlsRef.current.has(text)) {
        setDetectedUrl(text);
        if (onUrlDetected) {
          onUrlDetected(text);
        }
      }
    } catch {
      // User hasn't granted clipboard permission yet or browser blocked background read.
      // This is expected and shouldn't trigger an error popup.
    }
  }, [onUrlDetected]);

  useEffect(() => {
    const handleFocus = () => {
      // Slight delay to allow system clipboard to settle
      setTimeout(checkClipboard, 300);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        setTimeout(checkClipboard, 300);
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkClipboard]);

  const dismiss = useCallback(() => {
    if (detectedUrl) {
      dismissedUrlsRef.current.add(detectedUrl);
    }
    setDetectedUrl(null);
  }, [detectedUrl]);

  const accept = useCallback(() => {
    const url = detectedUrl;
    if (url) {
      dismissedUrlsRef.current.add(url);
    }
    setDetectedUrl(null);
    return url;
  }, [detectedUrl]);

  /**
   * Directly read clipboard on user gesture (e.g. clicking "Paste" button)
   */
  const readClipboardDirectly = useCallback(async (): Promise<string | null> => {
    try {
      if (!navigator?.clipboard?.readText) {
        return null;
      }
      const text = await navigator.clipboard.readText();
      return text.trim();
    } catch (err) {
      console.warn('Clipboard read failed:', err);
      return null;
    }
  }, []);

  return {
    detectedUrl,
    dismiss,
    accept,
    readClipboardDirectly,
  };
}
