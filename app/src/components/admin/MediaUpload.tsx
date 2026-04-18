'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface MediaUploadProps {
  onUploadSuccess: (url: string) => void
  type: 'image' | 'video'
  bucket?: string
  label?: string
}

export function MediaUpload({ onUploadSuccess, type, bucket = 'media', label }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setStatus('idle')

    try {
      const ext = file.name.split('.').pop()
      const path = `uploads/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
      
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

      if (error) throw error

      if (data) {
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
        onUploadSuccess(publicUrl)
        setStatus('success')
        setTimeout(() => setStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setStatus('error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="relative flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-all group">
        {uploading ? (
          <>
            <Loader2 size={16} className="animate-spin text-purple-600" />
            <span className="text-xs font-bold text-purple-600 uppercase">Mengunggah...</span>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-xs font-bold text-green-600 uppercase">Berhasil!</span>
          </>
        ) : status === 'error' ? (
          <>
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-xs font-bold text-red-600 uppercase">Gagal Upload</span>
          </>
        ) : (
          <>
            <Upload size={16} className="text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-purple-900 uppercase">{label || `Upload ${type === 'image' ? 'Gambar' : 'Video'}`}</span>
          </>
        )}
        <input 
          type="file" 
          accept={type === 'image' ? 'image/*' : 'video/*'} 
          className="hidden" 
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
    </div>
  )
}
