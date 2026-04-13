import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from './Select';
import { useTranslation } from 'react-i18next';

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
    <div className={`shrink-0 flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-200 bg-white z-10 w-full gap-4 ${className}`}>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-36">
          <Select
            value={pageSize}
            onChange={(e: any) => onPageSizeChange(Number(e.target.value))}
            className="!py-2 !px-3 font-medium bg-slate-50"
            placement="top"
            options={pageSizeOptions.map(size => ({
              value: size,
              label: t('common.pagination.size', { size })
            }))}
          />
        </div>
        <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
          {t(infoKey, {
            start: currentPage * pageSize + 1,
            end: Math.min((currentPage + 1) * pageSize, totalElements),
            total: totalElements
          })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-2">
            <input
              type="text"
              value={inputPage}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-10 h-10 rounded-lg border border-slate-200 text-center text-sm font-bold text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-slate-300"
            />
            <span className="text-sm text-slate-400 font-medium">/ {totalPages || 1}</span>
          </div>

          <button
            disabled={currentPage >= totalPages - 1 || totalPages === 0}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
