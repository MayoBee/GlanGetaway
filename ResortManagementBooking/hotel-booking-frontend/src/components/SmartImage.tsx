import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

interface SmartImageProps {
  src?: string | string[];
  alt: string;
  className?: string;
  fallbackText?: string;
  showLoading?: boolean;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  fallbackText = 'No Image Available',
  showLoading = true,
  onError,
  onLoad
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Process image sources
  const processImageSources = (sources: string | string[] | undefined): string[] => {
    if (!sources) return [];
    
    const sourcesArray = Array.isArray(sources) ? sources : [sources];
    return sourcesArray.map(source => {
      if (!source) return '';
      
      try {
        const url = new URL(source);
        
        // Fix common port issues
        if (url.hostname === 'localhost') {
          // Ensure we're using port 5000 for backend
          url.port = '5000';
          return url.toString();
        }
        
        return source;
      } catch (e) {
        console.warn('Invalid image URL:', source);
        return '';
      }
    }).filter(Boolean);
  };

  useEffect(() => {
    const sources = processImageSources(src);
    if (sources.length === 0) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    // Try each source until one works
    const tryNextSource = (index: number = 0) => {
      if (index >= sources.length) {
        setIsLoading(false);
        setHasError(true);
        return;
      }

      const source = sources[index];
      setCurrentSrc(source);
      setIsLoading(true);
      setHasError(false);

      // Create test image to verify it loads
      const testImg = new Image();
      
      testImg.onload = () => {
        setIsLoading(false);
        setHasError(false);
        onLoad?.();
      };
      
      testImg.onerror = () => {
        console.warn(`Failed to load image: ${source}`);
        if (index < sources.length - 1) {
          // Try next source
          tryNextSource(index + 1);
        } else {
          // All sources failed
          setIsLoading(false);
          setHasError(true);
          onError?.(new Error(`Failed to load all image sources`));
        }
      };
      
      testImg.src = source;
    };

    tryNextSource();
  }, [src, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-4">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm font-medium">{fallbackText}</p>
          <button
            onClick={handleRetry}
            className="mt-2 text-xs text-blue-500 hover:text-blue-700 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && showLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentSrc) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-4">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm font-medium">{fallbackText}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onLoad={() => {
        setIsLoading(false);
        onLoad?.();
      }}
      onError={() => {
        setHasError(true);
        setIsLoading(false);
        onError?.(new Error(`Failed to load image: ${currentSrc}`));
      }}
      style={{ display: isLoading ? 'none' : 'block' }}
    />
  );
};

export default SmartImage;
