import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageViewerProps {
  images: { src: string; alt?: string }[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageViewer = ({ images, initialIndex = 0, isOpen, onClose }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastTap = useRef(0);
  const dragStart = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const touchStartY = useRef(0);

  const resetZoom = useCallback(() => { setScale(1); setPosition({ x: 0, y: 0 }); }, []);

  const handleDoubleTap = () => {
    if (scale > 1) { resetZoom(); } else { setScale(2.5); }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) { handleDoubleTap(); lastTap.current = 0; return; }
      lastTap.current = now;
      touchStartY.current = e.touches[0].clientY;
      if (scale > 1) {
        setIsDragging(true);
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        startPos.current = { ...position };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      setPosition({ x: startPos.current.x + dx, y: startPos.current.y + dy });
    }
    if (scale <= 1 && e.touches.length === 1) {
      const dy = e.touches[0].clientY - touchStartY.current;
      if (dy > 80) onClose();
    }
  };

  const handleTouchEnd = () => { setIsDragging(false); };

  const goNext = () => { if (currentIndex < images.length - 1) { setCurrentIndex(currentIndex + 1); resetZoom(); } };
  const goPrev = () => { if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); resetZoom(); } };

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-foreground/90 flex flex-col items-center justify-center"
        onClick={(e) => { if (e.target === e.currentTarget && scale <= 1) onClose(); }}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-[101] p-2 rounded-full bg-background/20 backdrop-blur-sm">
          <X size={24} className="text-background" />
        </button>

        {/* Nav arrows */}
        {images.length > 1 && currentIndex > 0 && (
          <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-[101] p-2 rounded-full bg-background/20 backdrop-blur-sm">
            <ChevronLeft size={24} className="text-background" />
          </button>
        )}
        {images.length > 1 && currentIndex < images.length - 1 && (
          <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 z-[101] p-2 rounded-full bg-background/20 backdrop-blur-sm">
            <ChevronRight size={24} className="text-background" />
          </button>
        )}

        {/* Image */}
        <div
          className="w-full h-full flex items-center justify-center overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          <img
            src={images[currentIndex].src}
            alt={images[currentIndex].alt || ''}
            className="max-w-full max-h-[80vh] object-contain select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.2s ease',
            }}
            draggable={false}
          />
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-8 flex gap-2">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-background' : 'bg-background/40'}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageViewer;

// Hook for easy use
export const useImageViewer = () => {
  const [viewerState, setViewerState] = useState<{ isOpen: boolean; images: { src: string; alt?: string }[]; index: number }>({
    isOpen: false, images: [], index: 0,
  });

  const openViewer = (images: { src: string; alt?: string }[], index = 0) => {
    setViewerState({ isOpen: true, images, index });
  };

  const closeViewer = () => {
    setViewerState(prev => ({ ...prev, isOpen: false }));
  };

  return { viewerState, openViewer, closeViewer };
};
