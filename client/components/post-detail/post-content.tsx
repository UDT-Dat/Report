'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { updateHtml } from '@/lib/utils';

interface PostContentProps {
  readonly content: string;
}

export function PostContent({ content }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const addClickListeners = () => {
      const images = container.querySelectorAll('img');
      images.forEach((img) => {
        img.classList.add('cursor-zoom-in');
        img.addEventListener('click', handleClick);
      });
    };

    const handleClick = (e: Event) => {
      const target = e.target as HTMLImageElement;
      if (target?.src) {
        setZoomImage(target.src);
      }
    };

    // Quan sát nội dung HTML được thêm
    const observer = new MutationObserver(() => {
      addClickListeners();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    // Gọi thủ công một lần đầu
    addClickListeners();

    return () => {
      observer.disconnect();
    };
  }, [content]);

  return (
    <>
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl mb-8">
        <CardContent className="p-8">
          <div
            ref={contentRef}
            className="prose prose-lg max-w-none
              prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-p:text-gray-800 dark:prose-p:text-gray-300
              prose-a:text-blue-600 dark:prose-a:text-blue-400
              prose-code:text-pink-600 dark:prose-code:text-pink-400
              prose-code:bg-gray-100 dark:prose-code:bg-gray-800
              prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
              dark"
            dangerouslySetInnerHTML={{ __html: updateHtml(content) }}
          />
        </CardContent>
      </Card>

      <Dialog open={!!zoomImage} onOpenChange={() => setZoomImage(null)}>
        <DialogContent className="max-w-fit p-0 bg-transparent border-none shadow-none">
          {zoomImage && (
            <img
              src={zoomImage}
              alt="Zoomed"
              className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl cursor-zoom-out"
              onClick={() => setZoomImage(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
