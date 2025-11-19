export default function MenuTreeSkeleton() {
  return (
    <>
      {/* Container skeleton */}
      <div className="border-l border-gray-300 pl-4 text-gray-700 space-y-2">
        {/* Placeholder for tree items */}
        <div className="h-5 bg-gray-100 w-40 rounded"></div>
        <div className="h-5 bg-gray-100 w-56 rounded"></div>
        <div className="h-5 bg-gray-100 w-32 rounded"></div>
        <div className="h-5 bg-gray-100 w-48 rounded"></div>
      </div>
    </>
  );
}
