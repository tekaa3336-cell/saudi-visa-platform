import React, { useRef, useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface DocumentUploadProps {
  label: string;
  applicantId: string;
  documentType: string;
  onUpload: (applicantId: string, documentType: string, fileData: { name: string; url: string; size: number }) => void;
  onRemove: (applicantId: string, documentType: string) => void;
  uploadedFile?: { name: string; url: string; size: number } | null;
  required?: boolean;
  lang: 'ar' | 'en';
}

export function DocumentUpload({
  label,
  applicantId,
  documentType,
  onUpload,
  onRemove,
  uploadedFile,
  required = false,
  lang,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError(lang === 'ar' ? 'صيغة الملف غير مدعومة. يرجى رفع PDF أو صورة.' : 'Unsupported file format. Please upload PDF or image.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(lang === 'ar' ? 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت.' : 'File size too large. Maximum 5MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Prepare file path - use safe naming convention
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `temp/${applicantId}_${documentType}_${Date.now()}.${fileExt}`;
      
      console.log('📤 Starting upload:', { 
        fileName, 
        fileType: file.type, 
        fileSize: file.size,
        bucket: 'visa-documents'
      });

      // Try to upload to Supabase Storage
      let uploadData;
      const { data, error: uploadError } = await supabase.storage
        .from('visa-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('❌ Supabase upload error:', uploadError);
        
        // If bucket doesn't exist, try to create it
        if (uploadError.message?.includes('Bucket not found') || uploadError.statusCode === '404') {
          console.log('🔧 Bucket not found, attempting to create...');
          const { error: createError } = await supabase.storage.createBucket('visa-documents', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
          });
          
          if (createError) {
            console.error('❌ Failed to create bucket:', createError);
            throw new Error('Storage bucket not available. Please contact support.');
          }
          
          // Retry upload after creating bucket
          console.log('✅ Bucket created, retrying upload...');
          const { data: retryData, error: retryError } = await supabase.storage
            .from('visa-documents')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type,
            });
          
          if (retryError) {
            throw retryError;
          }
          
          uploadData = retryData;
        } else {
          throw uploadError;
        }
      } else {
        uploadData = data;
      }

      console.log('✅ Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('visa-documents')
        .getPublicUrl(fileName);

      console.log('🔗 Public URL:', urlData.publicUrl);

      const fileData = {
        name: safeFileName,
        url: urlData.publicUrl,
        size: file.size,
      };

      onUpload(applicantId, documentType, fileData);
      
      // Show success message briefly
      setError(null);
    } catch (err) {
      console.error('❌ Upload error details:', err);
      
      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Provide user-friendly error messages
        if (errorMessage.includes('Bucket not found')) {
          errorMessage = lang === 'ar' 
            ? 'خدمة التخزين غير متاحة حالياً. يرجى المحاولة لاحقاً.' 
            : 'Storage service is currently unavailable. Please try again later.';
        } else if (errorMessage.includes('Permission denied') || errorMessage.includes('403')) {
          errorMessage = lang === 'ar' 
            ? 'لا توجد صلاحيات لرفع الملفات. يرجى تسجيل الدخول.' 
            : 'Permission denied. Please sign in to upload files.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = lang === 'ar' 
            ? 'خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت.' 
            : 'Network error. Please check your internet connection.';
        }
      }
      
      setError(lang === 'ar' 
        ? `فشل رفع الملف: ${errorMessage}` 
        : `Failed to upload file: ${errorMessage}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onRemove(applicantId, documentType);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ms-1">*</span>}
      </label>

      {uploadedFile ? (
        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText size={16} className="text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                {uploadedFile.name}
              </p>
              <p className="text-[10px] text-slate-500">
                {(uploadedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="ms-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            aria-label={lang === 'ar' ? 'إزالة الملف' : 'Remove file'}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            uploading
              ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed'
              : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500">
                {lang === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={24} className="text-slate-400" />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {lang === 'ar' ? 'انقر لرفع الملف' : 'Click to upload'}
              </p>
              <p className="text-[10px] text-slate-400">
                {lang === 'ar' ? 'PDF أو صورة (حد أقصى 5 ميجابايت)' : 'PDF or Image (max 5MB)'}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
