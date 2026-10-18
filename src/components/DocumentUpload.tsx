import React, { useRef, useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

/** A file already stored in the private bucket (no public URL: viewing needs a signed link) */
export interface UploadedFileData {
  name: string;
  storageKey: string;
  mimeType: string;
  size: number;
}

interface DocumentUploadProps {
  label: string;
  applicantId: string;
  documentType: string;
  onUpload: (applicantId: string, documentType: string, fileData: UploadedFileData) => void;
  onRemove: (applicantId: string, documentType: string) => void;
  uploadedFile?: UploadedFileData | null;
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
      // Files go to the PRIVATE "visa-documents" bucket under the user's own folder (<user id>/...).
      // Storage policies only allow that folder, and only the owner or a verified admin can read it back.
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id;
      if (!uid) {
        throw new Error('AUTH_REQUIRED');
      }

      const fileExt = (file.name.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'pdf';
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const random = Math.random().toString(36).slice(2, 8);
      const storageKey = `${uid}/${applicantId}_${documentType}_${Date.now()}_${random}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('visa-documents')
        .upload(storageKey, file, { cacheControl: '3600', upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;

      onUpload(applicantId, documentType, {
        name: safeFileName,
        storageKey,
        mimeType: file.type === 'image/jpg' ? 'image/jpeg' : file.type,
        size: file.size,
      });
    } catch (err) {
      const raw = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? '');
      let errorMessage = raw || 'Unknown error';
      if (raw.includes('AUTH_REQUIRED') || /permission|row-level security|403|unauthorized/i.test(raw)) {
        errorMessage = lang === 'ar' ? 'لا توجد صلاحية لرفع الملفات. يرجى تسجيل الدخول.' : 'Permission denied. Please sign in to upload files.';
      } else if (/bucket not found/i.test(raw)) {
        errorMessage = lang === 'ar' ? 'خدمة التخزين غير متاحة حالياً. يرجى المحاولة لاحقاً.' : 'Storage service is currently unavailable. Please try again later.';
      } else if (/network|fetch/i.test(raw)) {
        errorMessage = lang === 'ar' ? 'خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت.' : 'Network error. Please check your internet connection.';
      }
      setError(lang === 'ar' ? `فشل رفع الملف: ${errorMessage}` : `Failed to upload file: ${errorMessage}`);
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
