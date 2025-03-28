'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface CodeOption {
  title: string
  description: string
  code: string
  pros: string[]
  cons: string[]
  performance: number
  readability: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

export default function CodeAnalysis() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const router = useRouter()

  const codeOptions: CodeOption[] = [
    {
      title: "Simple and Clear",
      description: "A straightforward approach that's easy to understand and maintain",
      code: `# Basic implementation
def calculate_factorial(n):
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)`,
      pros: ["Easy to understand", "Good for learning", "Simple to maintain"],
      cons: ["May not be the fastest", "Uses more memory for large numbers"],
      performance: 7,
      readability: 9,
      difficulty: "Beginner"
    },
    {
      title: "Performance Focused",
      description: "Optimized for speed and memory usage",
      code: `# Optimized implementation
def calculate_factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result`,
      pros: ["Faster execution", "Uses less memory", "Handles larger numbers better"],
      cons: ["Slightly less intuitive", "More lines of code"],
      performance: 9,
      readability: 8,
      difficulty: "Intermediate"
    },
    {
      title: "Modern Features",
      description: "Using Python's latest features for better code organization",
      code: `# Modern implementation
from functools import cache

@cache
def calculate_factorial(n: int) -> int:
    return 1 if n <= 1 else n * calculate_factorial(n - 1)`,
      pros: ["Caches results for speed", "Type hints for clarity", "Modern Python features"],
      cons: ["Requires newer Python version", "May be unfamiliar to beginners"],
      performance: 9,
      readability: 7,
      difficulty: "Advanced"
    },
    {
      title: "Production Ready",
      description: "Full-featured implementation with error handling",
      code: `# Production implementation
def calculate_factorial(n: int) -> int:
    if not isinstance(n, int):
        raise TypeError("Input must be an integer")
    if n < 0:
        raise ValueError("Input must be non-negative")
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result`,
      pros: ["Robust error handling", "Input validation", "Safe for production"],
      cons: ["More complex", "More code to maintain"],
      performance: 8,
      readability: 8,
      difficulty: "Intermediate"
    }
  ]

  const handleApplyCode = (code: string) => {
    // Store the selected code in localStorage
    localStorage.setItem('selectedCode', code)
    router.push('/')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Beginner': return 'text-green-600'
      case 'Intermediate': return 'text-yellow-600'
      case 'Advanced': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Editor
      </button>

      <h1 className="text-3xl font-bold mb-4">Code Analysis & Suggestions</h1>
      <p className="text-gray-600 mb-8">Choose the implementation that best fits your needs. Click on any card to see more details and apply the code.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {codeOptions.map((option, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl shadow-md cursor-pointer transition-all duration-200 ${
              selectedOption === index ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white'
            }`}
            onClick={() => setSelectedOption(index)}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{option.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(option.difficulty)}`}>
                {option.difficulty}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{option.description}</p>
            
            <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
              <code>{option.code}</code>
            </pre>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-green-600 mb-2">Benefits:</h3>
                <ul className="space-y-1">
                  {option.pros.map((pro, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-red-600 mb-2">Limitations:</h3>
                <ul className="space-y-1">
                  {option.cons.map((con, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-red-500">•</span>
                      <span className="text-sm">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="space-x-4">
                <span className="text-sm">
                  Performance: 
                  <span className="ml-1 text-blue-600 font-medium">{option.performance}/10</span>
                </span>
                <span className="text-sm">
                  Readability: 
                  <span className="ml-1 text-blue-600 font-medium">{option.readability}/10</span>
                </span>
              </div>
              <button
                onClick={() => handleApplyCode(option.code)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Apply This Code
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 