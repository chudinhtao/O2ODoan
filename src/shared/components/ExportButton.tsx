import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Button } from './ui/Button';
import { exportToExcel } from '../utils/excel.utils';
import { toast } from 'react-hot-toast';

interface ExportButtonProps {
  data: any[];
  fileName: string;
  sheetName?: string;
  headers?: Record<string, string>;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon' | 'guest';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  label?: string;
  disabled?: boolean;
}

/**
 * Standardized Export Button for ERP modules
 */
export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  fileName,
  sheetName,
  headers,
  className = '',
  variant = 'outline',
  size = 'sm',
  label,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const displayLabel = label || t('common.exportFile', 'Xuất File');

  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error(t('common.exportNoData', 'Không có dữ liệu để xuất!'));
      return;
    }

    setIsExporting(true);
    try {
      exportToExcel(data, fileName, sheetName, headers);
      toast.success(t('common.exportSuccess', 'Xuất file thành công!'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('common.exportError', 'Có lỗi xảy ra khi xuất file!'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`!rounded-lg gap-2 ${className}`}
      onClick={handleExport}
      disabled={disabled || isExporting || data.length === 0}
    >
      <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
      <span>{isExporting ? t('common.loading', 'Đang tải...') : displayLabel}</span>
    </Button>
  );
};
