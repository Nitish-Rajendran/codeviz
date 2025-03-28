'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { 
  generateOptimizedVersion, 
  generateTypeSafeVersion, 
  generateAlternativeVersion 
} from '../lib/code-analysis'

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
  const [originalCode, setOriginalCode] = useState('')
  const [codeOptions, setCodeOptions] = useState<CodeOption[]>([])
  const router = useRouter()

  useEffect(() => {
    const code = localStorage.getItem('codeToAnalyze')
    if (code) {
      setOriginalCode(code)
      generateCodeOptions(code)
    }
  }, [])

  const generateCodeOptions = (code: string) => {
    const options: CodeOption[] = [
      {
        title: "Current Implementation",
        description: "Your current code with analysis",
        code: code,
        pros: ["Current working solution", "Familiar to team"],
        cons: ["May have room for optimization"],
        performance: 7,
        readability: 7,
        difficulty: "Intermediate"
      },
      {
        title: "Optimized Version",
        description: "Performance-focused implementation",
        code: generateOptimizedVersion(code),
        pros: ["Better performance", "Efficient memory usage"],
        cons: ["More complex implementation"],
        performance: 9,
        readability: 7,
        difficulty: "Advanced"
      },
      {
        title: "Type-Safe Version",
        description: "Implementation with robust error handling",
        code: generateTypeSafeVersion(code),
        pros: ["Type safety", "Error handling", "Production ready"],
        cons: ["More verbose", "Additional overhead"],
        performance: 8,
        readability: 8,
        difficulty: "Intermediate"
      },
      {
        title: "Alternative Approach",
        description: "Different implementation strategy",
        code: generateAlternativeVersion(code),
        pros: ["Different perspective", "May be better for specific cases"],
        cons: ["May not be optimal for all scenarios"],
        performance: 8,
        readability: 8,
        difficulty: "Intermediate"
      }
    ]
    setCodeOptions(options)
  }

  const handleApplyCode = (code: string) => {
    localStorage.setItem('selectedCode', code)
    router.push('/')
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
      <p className="text-gray-600 mb-8">Choose the implementation that best fits your needs.</p>

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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                option.difficulty === 'Beginner' ? 'text-green-600' :
                option.difficulty === 'Intermediate' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
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