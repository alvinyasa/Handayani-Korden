import { useEffect } from 'react';

/**
 * iOS and Android safe scroll lock that completely prevents background scrolling
 * when a modal or lightbox is open, while preserving scroll position.
 */
export function useLockBodyScroll(lock = true) {
  useEffect(() => {
    if (!lock) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    const originalBodyPosition = body.style.position;
    const originalBodyTop = body.style.top;
    const originalBodyLeft = body.style.left;
    const originalBodyRight = body.style.right;
    const originalBodyWidth = body.style.width;
    const originalBodyOverflow = body.style.overflow;
    const originalHtmlOverflow = html.style.overflow;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';

    return () => {
      body.style.position = originalBodyPosition;
      body.style.top = originalBodyTop;
      body.style.left = originalBodyLeft;
      body.style.right = originalBodyRight;
      body.style.width = originalBodyWidth;
      body.style.overflow = originalBodyOverflow;
      html.style.overflow = originalHtmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [lock]);
}

