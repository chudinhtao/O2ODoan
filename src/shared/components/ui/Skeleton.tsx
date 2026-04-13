interface SkeletonProps {
  className?: string
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div
    className={`animate-pulse rounded-md bg-surface-container ${className}`}
    aria-hidden="true"
  />
)

interface SkeletonTableProps {
  rows?: number
  cols?: number
}

export const SkeletonTable = ({ rows = 5, cols = 8 }: SkeletonTableProps) => (
  <div className="w-full" aria-busy="true" aria-label="Đang tải...">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-slate-200">
        {[...Array(cols)].map((_, j) => (
          <Skeleton
            key={j}
            className={`h-4 flex-1 ${j === 0 ? 'max-w-[80px]' : j === cols - 1 ? 'max-w-[60px]' : ''}`}
          />
        ))}
      </div>
    ))}
  </div>
)
