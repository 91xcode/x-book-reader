import React, { useState, useRef, useCallback } from 'react'
import clsx from 'clsx'
import { PiPlus, PiFile, PiFileText, PiFilePdf } from 'react-icons/pi'
import { MdCloudUpload, MdError } from 'react-icons/md'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  onUploadProgress?: (progress: number) => void
  accept?: string
  multiple?: boolean
  maxFileSize?: number // MB
  className?: string
  disabled?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  onUploadProgress,
  accept = '.epub,.pdf,.txt,.mobi,.azw3,.fb2,.cbz,.fbz',
  multiple = true,
  maxFileSize = 100, // 100MB
  className,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 支持的文件格式
  const supportedFormats = [
    { ext: 'epub', icon: PiFile, name: 'EPUB' },
    { ext: 'pdf', icon: PiFilePdf, name: 'PDF' },
    { ext: 'txt', icon: PiFileText, name: 'TXT' },
    { ext: 'mobi', icon: PiFile, name: 'MOBI' },
    { ext: 'azw3', icon: PiFile, name: 'AZW3' },
    { ext: 'fb2', icon: PiFile, name: 'FB2' },
    { ext: 'cbz', icon: PiFile, name: 'CBZ' },
    { ext: 'fbz', icon: PiFile, name: 'FBZ' },
  ]

  // 验证文件
  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = []
    const errors: string[] = []

    for (const file of files) {
      // 检查文件大小
      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`${file.name}: 文件大小超过 ${maxFileSize}MB`)
        continue
      }

      // 检查文件格式
      const extension = file.name.toLowerCase().split('.').pop()
      const acceptedExts = accept.split(',').map(ext => ext.trim().replace('.', ''))
      
      if (extension && !acceptedExts.includes(extension)) {
        errors.push(`${file.name}: 不支持的文件格式`)
        continue
      }

      valid.push(file)
    }

    return { valid, errors }
  }

  // 处理文件选择
  const handleFiles = useCallback(async (files: File[]) => {
    if (disabled || files.length === 0) return

    setError(null)
    const { valid, errors } = validateFiles(files)

    if (errors.length > 0) {
      setError(errors.join('\n'))
      return
    }

    if (valid.length === 0) {
      setError('没有有效的文件')
      return
    }

    try {
      setIsUploading(true)
      
      // 模拟上传进度
      if (onUploadProgress) {
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 50))
          onUploadProgress(i)
        }
      }

      onFilesSelected(valid)
    } catch (error) {
      console.error('文件处理失败:', error)
      setError(error instanceof Error ? error.message : '文件处理失败')
    } finally {
      setIsUploading(false)
      if (onUploadProgress) {
        onUploadProgress(0)
      }
    }
  }, [disabled, accept, maxFileSize, onFilesSelected, onUploadProgress])

  // 拖拽事件处理
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [disabled, handleFiles])

  // 文件选择事件处理
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
    
    // 清空input值，允许选择相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFiles])

  // 点击上传区域
  const handleClick = useCallback(() => {
    if (disabled || isUploading) return
    fileInputRef.current?.click()
  }, [disabled, isUploading])

  // 获取文件格式图标
  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop()
    const format = supportedFormats.find(f => f.ext === ext)
    return format?.icon || PiFile
  }

  return (
    <div className={clsx('file-upload-container', className)}>
      {/* 主上传区域 */}
      <div
        className={clsx(
          'file-upload-area',
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
          'hover:border-primary hover:bg-primary/5',
          {
            'border-primary bg-primary/10': isDragOver,
            'border-base-300 bg-base-50': !isDragOver && !error,
            'border-error bg-error/5': error,
            'opacity-50 cursor-not-allowed': disabled,
            'animate-pulse': isUploading,
          }
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <>
              <MdCloudUpload className="w-12 h-12 text-primary animate-bounce" />
              <div className="text-lg font-medium text-primary">处理文件中...</div>
            </>
          ) : error ? (
            <>
              <MdError className="w-12 h-12 text-error" />
              <div className="text-lg font-medium text-error">上传失败</div>
              <div className="text-sm text-error whitespace-pre-line">{error}</div>
              <button
                className="btn btn-error btn-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setError(null)
                }}
              >
                重试
              </button>
            </>
          ) : (
            <>
              <div className={clsx(
                'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
                isDragOver ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'
              )}>
                <PiPlus className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <div className="text-lg font-medium">
                  {isDragOver ? '释放文件开始导入' : '点击或拖拽文件到此处'}
                </div>
                <div className="text-sm text-base-content/70">
                  支持多选，单个文件最大 {maxFileSize}MB
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 支持格式说明 */}
      <div className="mt-4 p-4 bg-base-100 rounded-lg border border-base-200">
        <div className="text-sm font-medium text-base-content/80 mb-3">支持的格式：</div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {supportedFormats.map(({ ext, icon: Icon, name }) => (
            <div key={ext} className="flex flex-col items-center space-y-1">
              <Icon className="w-6 h-6 text-base-content/60" />
              <span className="text-xs text-base-content/60 uppercase">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-3 text-xs text-base-content/50 space-y-1">
        <div>• 支持批量导入多个文件</div>
        <div>• TXT 文件将自动转换为 EPUB 格式</div>
        <div>• 文件将保存在本地，可选择上传到云端</div>
      </div>
    </div>
  )
}

export default FileUpload 