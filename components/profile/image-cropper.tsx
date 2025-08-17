'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Crop,
  RotateCw,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ImageCropperProps {
  imageUrl: string
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number // width/height ratio (default 1:1 for circular avatars)
}

export function ImageCropper({ 
  imageUrl, 
  onCropComplete, 
  onCancel,
  aspectRatio = 1 
}: ImageCropperProps) {
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 })
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    
    // Initialize crop area to center of image
    const size = Math.min(img.clientWidth, img.clientHeight) * 0.7
    setCropArea({
      x: (img.clientWidth - size) / 2,
      y: (img.clientHeight - size) / 2,
      width: size,
      height: aspectRatio === 1 ? size : size / aspectRatio
    })
  }, [aspectRatio])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    dragStart.current = { x: e.clientX - cropArea.x, y: e.clientY - cropArea.y }
    e.preventDefault()
  }, [cropArea])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !imageRef.current) return

    const imageRect = imageRef.current.getBoundingClientRect()
    const newX = Math.max(0, Math.min(e.clientX - dragStart.current.x, imageRect.width - cropArea.width))
    const newY = Math.max(0, Math.min(e.clientY - dragStart.current.y, imageRect.height - cropArea.height))

    setCropArea(prev => ({ ...prev, x: newX, y: newY }))
  }, [cropArea.width, cropArea.height])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScale(parseFloat(e.target.value))
  }

  const cropImage = async () => {
    if (!imageRef.current || !canvasRef.current) return

    setIsProcessing(true)
    setError(null)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      const img = imageRef.current
      const scaleX = imageDimensions.width / img.clientWidth
      const scaleY = imageDimensions.height / img.clientHeight

      // Set canvas size to crop area
      canvas.width = cropArea.width * scaleX
      canvas.height = cropArea.height * scaleY

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Save context state
      ctx.save()

      // Apply transformations
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(scale, scale)

      // Draw the cropped portion of the image
      ctx.drawImage(
        img,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        canvas.width,
        canvas.height,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      )

      // Restore context state
      ctx.restore()

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCropComplete(blob)
          } else {
            throw new Error('Failed to create cropped image')
          }
        },
        'image/jpeg',
        0.9
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to crop image')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Crop Your Profile Image</h3>
          <p className="text-sm text-muted-foreground">
            Drag the crop area to select the portion of your image you want to use.
          </p>
        </div>

        {/* Image Cropping Area */}
        <div className="relative inline-block max-w-full">
          <div 
            className="relative overflow-hidden rounded-lg"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <Image
              ref={imageRef}
              src={imageUrl}
              alt="Image to crop"
              width={500}
              height={500}
              className={cn(
                "max-w-full h-auto transition-transform duration-200",
                `rotate-${rotation} scale-${Math.floor(scale * 100)}`
              )}
              style={{
                transform: `rotate(${rotation}deg) scale(${scale})`
              }}
              onLoad={handleImageLoad}
              priority
            />
            
            {/* Crop Overlay */}
            <div
              className="absolute border-2 border-white shadow-lg cursor-move"
              style={{
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(1px)'
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-300 rounded-full cursor-nw-resize" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-300 rounded-full cursor-ne-resize" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-300 rounded-full cursor-sw-resize" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-300 rounded-full cursor-se-resize" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              disabled={isProcessing}
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Rotate
            </Button>
            
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-muted-foreground">Zoom:</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scale}
                onChange={handleScaleChange}
                disabled={isProcessing}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">
                {Math.round(scale * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={cropImage}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Apply Crop
              </>
            )}
          </Button>
        </div>

        {/* Hidden canvas for processing */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}