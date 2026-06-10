import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Select } from './Select';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  infoKey?: string;
}

export function Pagination({
  currentPage,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
  infoKey = 'common.pagination.info',
}: PaginationProps) {
  const { t } = useTranslation();
  const [inputPage, setInputPage] = useState((currentPage + 1).toString());

  useEffect(() => {
    setInputPage((currentPage + 1).toString());
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handleInputBlur = () => {
    const page = parseInt(inputPage);
    if (!isNaN(page) && page > 0 && page <= totalPages) {
      onPageChange(page - 1);
    } else {
      setInputPage((currentPage + 1).toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  return (
    <div className={`shrink-0 flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-slate-100 bg-white z-10 w-full gap-4 ${className}`}>
      <div className="flex items-center text-sm text-slate-500">
        <span className="whitespace-nowrap">
          {t(infoKey, {
            start: totalElements === 0 ? 0 : currentPage * pageSize + 1,
            end: Math.min((currentPage + 1) * pageSize, totalElements),
            total: totalElements
          })}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="whitespace-nowrap text-xs">{t('common.pagination.showLabel', 'Hiển thị:')}</span>
          <div className="w-24">
            <Select 
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              placement="top"
              className="!py-1 !px-2 !pr-8 !text-xs font-semibold shadow-sm"
              options={pageSizeOptions.map(size => ({
                label: t('common.pagination.size', { size, defaultValue: `${size} dòng` }),
                value: size
              }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-1">
            <input
              type="text"
              value={inputPage}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-9 h-7 rounded-lg border border-slate-200 text-center text-sm font-semibold text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all hover:border-slate-300"
            />
            <span className="text-sm text-slate-400 font-medium">/ {totalPages || 1}</span>
          </div>

          <button
            disabled={currentPage >= totalPages - 1 || totalPages === 0}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
