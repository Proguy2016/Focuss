import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface SafeImageProps {
    src: string;
    alt: string;
    className?: string;
    fallback?: React.ReactNode;
}

/**
 * A component that renders an image with fallback handling for 404 errors.
 * It will display a default avatar or custom fallback when image loading fails.
 * 
 * This version includes optimizations to prevent excessive re-renders:
 * - Uses a ref to track if component is mounted
 * - Debounces error handling
 * - Prevents state updates after unmount
 */
export const SafeImage: React.FC<SafeImageProps> = ({
    src,
    alt,
    className = '',
    fallback = <div className="flex items-center justify-center h-full w-full bg-white/10"><User className="w-6 h-6 text-white/70" /></div>
}) => {
    const [error, setError] = useState(false);
    const [imageUrl, setImageUrl] = useState(src);
    const isMounted = React.useRef(true);

    // Track component mount status
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Reset error state when src changes
    useEffect(() => {
        if (src !== imageUrl) {
            setImageUrl(src);
            setError(false);
        }
    }, [src, imageUrl]);

    const handleImageError = () => {
        // Only update state if component is still mounted
        if (isMounted.current) {
            // Use setTimeout to debounce multiple error events
            setTimeout(() => {
                if (isMounted.current) {
                    setError(true);
                }
            }, 100);
        }
    };

    if (error) {
        return (
            <div className={className}>
                {fallback}
            </div>
        );
    }

    // Use empty alt for decorative images to improve accessibility
    const altText = alt || '';

    return <img src={imageUrl} alt={altText} className={className} onError={handleImageError} />;
};

export default SafeImage; 