export function SkeletonCard() {
  return (
    <div className="bg-s2 border border-b1 rounded-[2px] overflow-hidden animate-pulse">
      <div className="h-24 bg-s3"></div>
      <div className="p-4 space-y-4">
        <div className="h-3 bg-s3 rounded w-3/4"></div>
        <div className="h-4 bg-s3 rounded w-full"></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-3 bg-s3 rounded"></div>
          <div className="h-3 bg-s3 rounded"></div>
          <div className="h-3 bg-s3 rounded"></div>
        </div>
        <div className="h-2 bg-s3 rounded w-full mt-4"></div>
      </div>
    </div>
  )
}

export function SkeletonListItem() {
  return (
    <div className="bg-s2 border border-b1 rounded-[2px] p-5 animate-pulse">
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-s3 rounded w-1/3"></div>
          <div className="h-4 bg-s3 rounded w-1/4"></div>
        </div>
        <div className="h-3 bg-s3 rounded w-2/3"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-3 bg-s3 rounded"></div>
          <div className="h-3 bg-s3 rounded"></div>
          <div className="h-3 bg-s3 rounded"></div>
          <div className="h-3 bg-s3 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonStatBox() {
  return (
    <div className="bg-s2 px-6 py-5 border border-b1 animate-pulse">
      <div className="h-8 bg-s3 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-s3 rounded w-2/3"></div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-s2 border border-b1 rounded-[2px] p-5 animate-pulse">
      <div className="h-4 bg-s3 rounded w-1/3 mb-4"></div>
      <div className="h-48 bg-s3 rounded"></div>
    </div>
  )
}
