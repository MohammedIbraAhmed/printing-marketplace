'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  Camera, 
  X, 
  User, 
  AlertCircle, 
  CheckCircle,
  Loader2 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ProfileImageUploadProps {
  currentImageUrl?: string | null
  onImageUpdate: (imageUrl: string) => void
  isLoading?: boolean
  className?: string
}

export function ProfileImageUpload({ 
  currentImageUrl, 
  onImageUpdate, 
  isLoading = false,
  className 
}: ProfileImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed'
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return 'Image must be less than 5MB'
    }

    return null
  }

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null)
    setSuccess(false)

    // Validate file
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    await uploadFile(file)
  }, [])

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Step 1: Get presigned upload URL
      const presignedResponse = await fetch('/api/profile/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      })

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json()
        throw new Error(errorData.error || 'Failed to get upload URL')
      }

      const { uploadUrl, cdnUrl } = await presignedResponse.json()

      // Step 2: Upload file to Cloudflare R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      setUploadProgress(100)

      // Step 3: Update user profile with new image URL
      const updateResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: cdnUrl,
        }),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile')
      }

      setSuccess(true)
      onImageUpdate(cdnUrl)
      
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
      setPreviewUrl(currentImageUrl) // Revert to original
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDropZoneClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const removeImage = () => {
    setPreviewUrl(null)
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Profile image updated successfully!</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Current/Preview Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center border-4 border-background shadow-lg">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Profile image"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
                
                {previewUrl && !isUploading && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 rounded-full w-8 h-8"
                    onClick={removeImage}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Upload Area */}
            {!isUploading && (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={handleDropZoneClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleInputChange}
                  className="hidden"
                  disabled={isLoading}
                />
                
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, or WebP (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={handleDropZoneClick}
                disabled={isLoading || isUploading}
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Choose Photo
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Your profile image helps others recognize you on the platform.
                Make sure it&apos;s a clear photo of yourself.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}