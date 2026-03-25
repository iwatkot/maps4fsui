'use client';

import { useEffect, useState } from 'react';

export default function TopVideoPromo({
  isVisible = true,
  onClose,
  onDontShowAgain,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setIsAnimatingIn(false);
      const hideTimer = setTimeout(() => {
        setIsMounted(false);
      }, 300);

      return () => clearTimeout(hideTimer);
    }

    setIsMounted(true);

    const showTimer = setTimeout(() => {
      setIsAnimatingIn(true);
    }, 400);

    return () => clearTimeout(showTimer);
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimatingIn(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const handleDontShowAgain = () => {
    setIsAnimatingIn(false);
    setTimeout(() => {
      onDontShowAgain?.();
    }, 300);
  };

  if (!isMounted) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div
        className={`mx-auto mt-3 w-[min(96vw,760px)] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl pointer-events-auto transition-transform duration-300 ease-out ${
          isAnimatingIn ? 'translate-y-0' : '-translate-y-[120%]'
        }`}
      >
        <div className="p-3 md:p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
                Check out new trailer!
              </h3>
              <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                The Electricity Update arrives 31.03.26 with poles, towers, automatic powerlines, and island generation in fields.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="shrink-0 rounded-md p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close trailer promo"
              title="Close"
            >
              <i className="zmdi zmdi-close text-lg"></i>
            </button>
          </div>

          <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-black">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/ofhVbKV8r7A?autoplay=1&mute=1&playsinline=1&rel=0"
              title="Maps4FS Electricity Update Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDontShowAgain}
              className="px-3 py-1.5 text-xs md:text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Don&apos;t show again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
