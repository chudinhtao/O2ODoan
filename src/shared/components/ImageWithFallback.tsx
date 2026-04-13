import { useState } from 'react'

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback: string
}

export function ImageWithFallback({ src, fallback, alt, ...props }: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src || fallback)

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      loading="lazy"
      onError={() => setImgSrc(fallback)}
    />
  )
}
