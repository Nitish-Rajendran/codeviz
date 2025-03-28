'use client'
import { LightBulbIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function AnalysisButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/code-analysis')
  }

  return (
    <button
      onClick={handleClick}
      className="absolute top-4 right-20 flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg shadow-lg transition-all duration-200"
      aria-label="Analyze Code"
    >
      <LightBulbIcon className="h-5 w-5 text-gray-800" />
      <span className="font-medium text-gray-800">Analyze Code</span>
    </button>
  )
} 