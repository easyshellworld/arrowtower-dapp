export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
          🗼
        </div>
      </div>
      <p className="text-emerald-700 font-bold text-lg animate-pulse">Loading ArrowTower...</p>
    </div>
  );
}

