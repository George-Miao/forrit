import { type HTMLProps, useEffect, useState } from 'react'

interface BlurryLoadingImageProps
  extends Omit<HTMLProps<HTMLImageElement>, 'src'> {
  poster_path: string
  background?: string
  width: string | number
  height: string | number
}

export function Poster({
  background = 'transparent',
  poster_path,
  style,
  width,
  height,
  ...props
}: BlurryLoadingImageProps) {
  const preview = `https://image.tmdb.org/t/p/w92${poster_path}`
  const src = `https://image.tmdb.org/t/p/original${poster_path}`

  const [currentImage, setCurrentImage] = useState(preview)
  const [loading, setLoading] = useState(true)

  const fetchImage = (src: string) => {
    const loadingImage = new Image()
    loadingImage.src = src
    loadingImage.onload = () => {
      setCurrentImage(loadingImage.src)
      setLoading(false)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: image loading should only run once
  useEffect(() => {
    fetchImage(src)
  }, [])

  return (
    <div style={{ height, width, overflow: 'hidden' }}>
      {/* biome-ignore lint/a11y/useAltText: Passed in via props */}
      <img
        style={{
          filter: `${loading ? 'blur(20px)' : ''}`,
          transition: '.2s filter ease',
          width: '100%',
          height: '100%',
          background: background,
          ...style,
        }}
        src={currentImage}
        {...props}
      />
    </div>
  )
}

export default Poster
