import { useState, useEffect, Fragment } from "react"
import { Search, ChevronDown, ChevronRight } from "lucide-react"
import { useDebounce } from "../../hooks/useDebounce"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/Table"
import { Input } from "../ui/Input"

import { Pagination } from "../ui/Pagination"
import { SkeletonTable } from "../ui/Skeleton"
import { DataTableProps } from "./types"
import clsx from "clsx"
import { useTranslation } from "react-i18next"

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading,
  searchPlaceholder = "Tìm kiếm...",
  searchValue,
  onSearchChange,
  pagination,
  actions,
  filters,
  leftToolbar,
  advancedFilters,
  onRowClick,
  renderExpansion,
  emptyState
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [expandedRows, setExpandedRows] = useState<Record<string | number, boolean>>({})

  // Implement local debounce logic for the search input
  const [localSearchValue, setLocalSearchValue] = useState(searchValue || "")
  const debouncedSearch = useDebounce(localSearchValue, 500)

  // Sync external searchValue down to local if it changes from outside
  useEffect(() => {
    if (searchValue !== undefined && searchValue !== localSearchValue) {
      setLocalSearchValue(searchValue)
    }
  }, [searchValue])

  // Sync debounced internal value up to parent
  useEffect(() => {
    if (onSearchChange && debouncedSearch !== searchValue) {
      onSearchChange(debouncedSearch)
    }
  }, [debouncedSearch])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchValue(e.target.value)
  }

  const toggleRow = (id: string | number) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div className="flex flex-col gap-0 flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Integrated Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border-b border-slate-100 shrink-0">
        {leftToolbar && (
          <div className="flex items-center gap-2">
            {leftToolbar}
          </div>
        )}
        <div className="flex items-center gap-2 flex-1 justify-end ml-auto">
          {onSearchChange && (
            <div className="relative group w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <Input
                value={localSearchValue}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="!h-9 !pl-9 !text-sm !bg-slate-50 !border-transparent hover:!bg-slate-100 focus:!bg-white focus:!border-primary/30 focus:!ring-0 transition-all w-full"
              />
            </div>
          )}
          {filters}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
      {advancedFilters && (
        <div className="px-3 pb-3 bg-white border-b border-slate-100 shrink-0 animate-in slide-in-from-top-2">
          {advancedFilters}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-50 shadow-sm shadow-slate-200/50">
            <TableRow className="!border-b-2 !border-slate-200">
              {renderExpansion && <TableHead className="w-10 !h-9 !py-2 !px-3"></TableHead>}
              {columns.map((col, idx) => (
                <TableHead 
                  key={idx} 
                  className={clsx(
                    "!h-9 !py-2 !px-3 text-slate-500 font-bold uppercase tracking-wider text-[11px]",
                    col.className,
                    col.align === 'right' && "!text-right",
                    col.align === 'center' && "!text-center"
                  )}
                  style={col.width ? { width: col.width, minWidth: col.width, maxWidth: col.width } : undefined}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (renderExpansion ? 1 : 0)} className="!p-0 border-none hover:bg-transparent">
                  <SkeletonTable rows={8} cols={columns.length + (renderExpansion ? 1 : 0)} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (renderExpansion ? 1 : 0)} className="border-none hover:bg-transparent h-64 align-middle">
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <p className="text-sm">{t('common.emptyData', 'Không có dữ liệu hiển thị')}</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIdx) => {
                const id = item.id || rowIdx
                const isExpanded = expandedRows[id]
                
                return (
                  <Fragment key={id}>
                    <TableRow 
                      className={clsx(
                        onRowClick ? "cursor-pointer" : "",
                        isExpanded && "bg-slate-50/50"
                      )}
                      onClick={() => onRowClick?.(item)}
                    >
                      {renderExpansion && (
                        <TableCell>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleRow(id)
                            }}
                            className="p-1 hover:bg-slate-200 rounded-md transition-colors"
                          >
                            {isExpanded ? <ChevronDown className="size-4 text-slate-500" /> : <ChevronRight className="size-4 text-slate-500" />}
                          </button>
                        </TableCell>
                      )}
                      {columns.map((col, colIdx) => (
                        <TableCell 
                          key={colIdx} 
                          className={clsx(
                            "!py-1.5 !px-3 text-slate-700 text-[13px] border-b border-slate-100/50",
                            col.className,
                            col.align === 'right' && "!text-right",
                            col.align === 'center' && "!text-center"
                          )}
                        >
                          {col.cell ? col.cell(item, rowIdx) : (col.accessorKey ? String(item[col.accessorKey] ?? '') : null)}
                        </TableCell>
                      ))}
                    </TableRow>
                    {renderExpansion && isExpanded && (
                      <TableRow className="!border-none !bg-slate-50/30">
                        <TableCell colSpan={columns.length + 1} className="!p-0">
                          <div className="p-4 border-l-4 border-primary/20 animate-in slide-in-from-left-2 duration-200">
                            {renderExpansion(item)}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="shrink-0 pt-2 border-t border-slate-100">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            pageSize={pagination.pageSize}
            totalElements={pagination.totalElements}
            onPageSizeChange={pagination.onPageSizeChange || (() => {})}
          />
        </div>
      )}
    </div>
  )
}
