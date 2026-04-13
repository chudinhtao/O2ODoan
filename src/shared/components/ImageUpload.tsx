import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cloudinaryService } from '@/shared/services/cloudinary.service';
import { Button } from './ui/Button';
import { toast } from 'sonner';
import { CloudUpload, Pencil, Trash2 } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onPublicIdGenerated?: (publicId: string) => void;
  className?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, onPublicIdGenerated, className = '', label }: ImageUploadProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('common.error.invalidImage'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('common.error.imageTooLarge'));
      return;
    }

    try {
      setIsUploading(true);
      const response = await cloudinaryService.uploadImage(file);
      onChange(response.secure_url);
      if (onPublicIdGenerated) {
        onPublicIdGenerated(response.public_id);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('common.error.uploadFailed');
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}

      <div
        className={`relative group border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300 min-h-[160px] flex flex-col items-center justify-center p-4 bg-slate-50
          ${dragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-slate-200 hover:border-slate-300'}
          ${value ? 'border-solid' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onFileSelect}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500 animate-pulse">{t('common.imageUpload.uploading')}</p>
          </div>
        ) : value ? (
          <div className="relative w-full flex flex-col items-center justify-center">
            <div className="relative group/preview rounded-lg overflow-hidden border border-slate-100 shadow-sm">
              <img
                src={cloudinaryService.getOptimizedUrl(value, { width: 600 })}
                alt="Preview"
                className="max-h-[140px] rounded-lg object-contain bg-white transition-transform group-hover/preview:scale-[1.05] duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
                }}
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover/preview:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                <Button 
                  type="button"
                  variant="primary" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  className="!py-1.5 !px-3 shadow-xl flex items-center gap-1.5 hover:scale-105 transition-transform"
                >
                  <Pencil size={14} />
                  <span className="text-xs font-bold">{t('common.action.change')}</span>
                </Button>
                <Button 
                  type="button"
                  variant="danger" 
                  size="sm" 
                  onClick={clearImage}
                  className="!p-2 shadow-xl hover:scale-110 transition-transform"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center cursor-pointer space-y-2" onClick={() => fileInputRef.current?.click()}>
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all border border-slate-100 group-hover:border-primary/20">
              <CloudUpload size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{t('common.imageUpload.uploadTitle')}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t('common.imageUpload.imageConstraint')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
