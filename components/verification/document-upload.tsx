'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  File, 
  X, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  FileText,
  FileImage
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VerificationDocument } from '@/lib/validations/verification'

interface DocumentUploadProps {
  documentType: 'business_license' | 'tax_id' | 'insurance' | 'certifications' | 'other'
  onDocumentUploaded: (document: VerificationDocument & { fileKey: string; fileUrl: string }) => void
  onDocumentRemoved?: () => void
  existingDocument?: VerificationDocument & { fileKey: string; fileUrl: string }
  isLoading?: boolean
  className?: string
}

const documentTypeLabels = {
  business_license: 'Business License',
  tax_id: 'Tax ID Documentation',
  insurance: 'Insurance Certificate',
  certifications: 'Industry Certifications',
  other: 'Other Documentation'
}

const documentTypeDescriptions = {
  business_license: 'Your business license or registration certificate',
  tax_id: 'Tax identification documents (EIN, SSN, etc.)',
  insurance: 'General liability or business insurance certificate',
  certifications: 'Industry certifications, quality standards, etc.',
  other: 'Any other relevant business documentation'
}

export function DocumentUpload({ 
  documentType,
  onDocumentUploaded,
  onDocumentRemoved,
  existingDocument,
  isLoading = false,
  className 
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF, JPEG, and PNG files are allowed'
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return 'File must be less than 10MB'
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

    // Upload file
    await uploadFile(file)
  }, [])

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Step 1: Get presigned upload URL
      const presignedResponse = await fetch('/api/verification/upload-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          type: documentType,
        }),
      })

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json()
        throw new Error(errorData.error || 'Failed to get upload URL')
      }

      const { uploadUrl, key, cdnUrl, documentInfo } = await presignedResponse.json()

      setUploadProgress(25)

      // Step 2: Upload file to Cloudflare R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      setUploadProgress(100)
      setSuccess(true)

      // Step 3: Notify parent component
      onDocumentUploaded({
        type: documentType,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileKey: key,
        fileUrl: cdnUrl,
        description: documentInfo.description
      })
      
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
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

  const removeDocument = () => {
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onDocumentRemoved?.()
  }

  const getFileIcon = (fileType?: string) => {
    if (fileType?.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />
    } else if (fileType?.includes('image')) {
      return <FileImage className="w-8 h-8 text-blue-500" />
    }
    return <File className="w-8 h-8 text-gray-500" />
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
          <AlertDescription>Document uploaded successfully!</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Document Type Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{documentTypeLabels[documentType]}</h3>
                <Badge variant="outline" className="text-xs">
                  {documentType === 'business_license' || documentType === 'tax_id' ? 'Required' : 'Optional'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {documentTypeDescriptions[documentType]}
              </p>
            </div>

            {/* Existing Document Display */}
            {existingDocument && !isUploading && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {getFileIcon(existingDocument.fileType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{existingDocument.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {(existingDocument.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeDocument}
                  disabled={isLoading}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

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
            {!existingDocument && !isUploading && (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={handleDropZoneClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
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
                      PDF, JPEG, or PNG (max 10MB)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Replace Button */}
            {existingDocument && !isUploading && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleDropZoneClick}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Replace Document
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}