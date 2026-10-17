import { useState, useEffect } from 'react';

/** Viewport dimensions and mobile keyboard state consumed by the game layout. */
export interface ViewportState {
  width: number;
  height: number;
  isKeyboardOpen: boolean;
  isMobile: boolean;
}

/** Tracks visual viewport changes that are not reflected reliably by window resize alone. */
export function useVisualViewport(): ViewportState {
  const [state, setState] = useState<ViewportState>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 800;
    const h = typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 600;
    return {
      width: w,
      height: h,
      isKeyboardOpen: false,
      isMobile: w < 768,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let initialHeight = window.innerHeight;

    const updateViewport = () => {
      const vv = window.visualViewport;
      const width = vv ? vv.width : window.innerWidth;
      const height = vv ? vv.height : window.innerHeight;
      const isMobile = width < 768;

      // Detect keyboard opening: on mobile, if height shrinks by more than 150px compared to initial height
      const heightDrop = initialHeight - height;
      const isKeyboard = isMobile && (heightDrop > 140 || (vv && vv.height < window.screen.height * 0.72));

      setState({
        width,
        height,
        isKeyboardOpen: isKeyboard,
        isMobile,
      });

      // Prevent mobile browser auto-scroll from shifting the app off-screen
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        initialHeight = window.innerHeight;
        updateViewport();
      }, 200);
    };

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', updateViewport);
      vv.addEventListener('scroll', updateViewport);
    }
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Prevent touchmove bounce on root body
    const preventBounce = (e: TouchEvent) => {
      if ((e.target as HTMLElement)?.tagName !== 'INPUT') {
        // e.preventDefault();
      }
    };
    document.body.addEventListener('touchmove', preventBounce, { passive: true });

    updateViewport();

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateViewport);
        vv.removeEventListener('scroll', updateViewport);
      }
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.body.removeEventListener('touchmove', preventBounce);
    };
  }, []);

  return state;
}
