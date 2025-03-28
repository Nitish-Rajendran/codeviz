'use client'
import { useState, useEffect } from 'react'
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
  const [originalCode, setOriginalCode] = useState('')
  const [codeOptions, setCodeOptions] = useState<CodeOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get the original code from localStorage
    const code = localStorage.getItem('currentCode')
    if (!code) {
      setError('No code found to analyze')
      setIsLoading(false)
      return
    }
    setOriginalCode(code)
    generateCodeOptions(code)
  }, [])

  const generateCodeOptions = (code: string) => {
    try {
      // Basic code analysis to determine the type of code
      const codeType = analyzeCodeType(code)
      const options = getOptionsForCodeType(codeType, code)
      setCodeOptions(options)
      setIsLoading(false)
    } catch (err) {
      setError('Unable to analyze code. Please make sure your code is valid.')
      setIsLoading(false)
    }
  }

  const analyzeCodeType = (code: string): string => {
    const lowerCode = code.toLowerCase()
    // Check for specific sorting algorithms
    if (lowerCode.includes('merge sort') || lowerCode.includes('mergesort')) {
      return 'merge_sort'
    }
    if (lowerCode.includes('quick sort') || lowerCode.includes('quicksort')) {
      return 'quick_sort'
    }
    if (lowerCode.includes('bubble sort') || lowerCode.includes('bubblesort')) {
      return 'bubble_sort'
    }
    // Check for other algorithm types
    if (lowerCode.includes('factorial')) return 'factorial'
    if (lowerCode.includes('fibonacci')) return 'fibonacci'
    return 'generic'
  }

  const getOptionsForCodeType = (type: string, originalCode: string): CodeOption[] => {
    const baseOption: CodeOption = {
      title: "Current Implementation",
      description: "Your current implementation with analysis",
      code: originalCode,
      pros: analyzeCodePros(originalCode),
      cons: analyzeCodeCons(originalCode),
      performance: analyzePerformance(originalCode),
      readability: analyzeReadability(originalCode),
      difficulty: analyzeDifficulty(originalCode)
    }

    switch (type) {
      case 'merge_sort':
        return getMergeSortOptions(baseOption)
      case 'quick_sort':
        return getQuickSortOptions(baseOption)
      case 'bubble_sort':
        return getBubbleSortOptions(baseOption)
      case 'factorial':
        return getFactorialOptions(baseOption)
      case 'fibonacci':
        return getFibonacciOptions(baseOption)
      default:
        return getGenericOptions(baseOption)
    }
  }

  const handleApplyCode = (code: string) => {
    if (!isValidCode(code)) {
      alert('This code contains syntax errors. Please review before applying.')
      return
    }
    localStorage.setItem('selectedCode', code)
    router.push('/')
  }

  const isValidCode = (code: string): boolean => {
    // Basic syntax validation
    try {
      // You could add more sophisticated validation here
      if (code.trim() === '') return false
      // Check for basic syntax errors
      const basicErrors = [
        'undefined)',
        'undefined}',
        'undefined]',
        ';;',
        ',,',
      ]
      return !basicErrors.some(error => code.includes(error))
    } catch {
      return false
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your code...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Editor
        </button>
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <p className="mt-4 text-gray-500">Please make sure your code is valid and try again.</p>
        </div>
      </div>
    )
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

// Separate files for different code options
function getFactorialOptions(baseOption: CodeOption): CodeOption[] {
  return [
    baseOption,
    {
      title: "Simple Recursive",
      description: "Basic recursive implementation of factorial",
      code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
      pros: ["Simple to understand", "Elegant solution", "Good for learning recursion"],
      cons: ["Stack overflow for large numbers", "Not tail-recursive", "Performance issues for large n"],
      performance: 6,
      readability: 9,
      difficulty: "Beginner"
    },
    {
      title: "Iterative Approach",
      description: "Memory-efficient iterative implementation",
      code: `def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result`,
      pros: ["Memory efficient", "No recursion overhead", "Handles larger numbers"],
      cons: ["Less elegant", "More lines of code"],
      performance: 8,
      readability: 8,
      difficulty: "Beginner"
    },
    {
      title: "Production Ready",
      description: "Full-featured implementation with error handling",
      code: `def factorial(n: int) -> int:
    if not isinstance(n, int):
        raise TypeError("Input must be an integer")
    if n < 0:
        raise ValueError("Input must be non-negative")
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
      pros: ["Type checking", "Error handling", "Production safe"],
      cons: ["More verbose", "Overhead from checks"],
      performance: 7,
      readability: 9,
      difficulty: "Intermediate"
    }
  ]
}

function getFibonacciOptions(baseOption: CodeOption): CodeOption[] {
  return [
    baseOption,
    {
      title: "Dynamic Programming",
      description: "Efficient implementation using dynamic programming",
      code: `def fibonacci(n):
    if n <= 0:
        return 0
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]`,
      pros: ["Efficient for large numbers", "No recursion overhead", "Memoization built-in"],
      cons: ["Uses more memory", "Slightly more complex", "Fixed space complexity"],
      performance: 9,
      readability: 7,
      difficulty: "Intermediate"
    },
    {
      title: "Space Optimized",
      description: "Memory efficient implementation using only variables",
      code: `def fibonacci(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b`,
      pros: ["Minimal memory usage", "Fast execution", "Simple logic"],
      cons: ["No memoization", "Limited to single number"],
      performance: 9,
      readability: 8,
      difficulty: "Beginner"
    }
  ]
}

function getSortingOptions(baseOption: CodeOption): CodeOption[] {
  return [
    baseOption,
    {
      title: "Bubble Sort",
      description: "Simple sorting algorithm that repeatedly steps through the list",
      code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
      pros: ["Easy to understand", "Good for learning", "Simple implementation"],
      cons: ["Not efficient for large lists", "O(n²) time complexity", "Many swaps needed"],
      performance: 5,
      readability: 9,
      difficulty: "Beginner"
    },
    {
      title: "Quick Sort",
      description: "Efficient, in-place sorting algorithm using divide and conquer",
      code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`,
      pros: ["Efficient for large datasets", "In-place sorting", "O(n log n) average case"],
      cons: ["Complex implementation", "Not stable sort", "O(n²) worst case"],
      performance: 9,
      readability: 7,
      difficulty: "Advanced"
    }
  ]
}

function getGenericOptions(baseOption: CodeOption): CodeOption[] {
  return [
    baseOption,
    {
      title: "Optimized Version",
      description: "A more efficient implementation with better practices",
      code: improveCode(baseOption.code),
      pros: ["Better performance", "Following best practices", "More maintainable"],
      cons: ["Might be more complex", "Could require more testing"],
      performance: 8,
      readability: 8,
      difficulty: "Intermediate"
    }
  ]
}

// Helper function to improve generic code
function improveCode(originalCode: string): string {
  // Basic code improvement logic
  let improvedCode = originalCode

  // Add error handling if not present
  if (!originalCode.includes('try:')) {
    improvedCode = `def improved_function(args):
    try:
        ${originalCode.split('\n').join('\n        ')}
    except Exception as e:
        print(f"An error occurred: {e}")
        raise`
  }

  // Add type hints if Python code
  if (originalCode.includes('def ') && !originalCode.includes('->')) {
    improvedCode = improvedCode.replace(
      /def (\w+)\((.*?)\):/g,
      'def $1($2) -> Any:'
    )
    // Add type hints import
    improvedCode = 'from typing import Any\n\n' + improvedCode
  }

  return improvedCode
}

// Add helper functions for code analysis
function analyzeCodePros(code: string): string[] {
  const pros: string[] = ["Current working solution"]
  if (code.includes('try') && code.includes('except')) {
    pros.push("Has error handling")
  }
  if (code.includes('->') || code.includes(': ')) {
    pros.push("Uses type hints")
  }
  return pros
}

function analyzeCodeCons(code: string): string[] {
  const cons: string[] = []
  if (!code.includes('try')) {
    cons.push("No error handling")
  }
  if (!code.includes('->') && !code.includes(': ')) {
    cons.push("No type hints")
  }
  return cons
}

function analyzePerformance(code: string): number {
  // Basic performance analysis
  return 7 // Default score, can be made more sophisticated
}

function analyzeReadability(code: string): number {
  // Basic readability analysis
  return 7 // Default score, can be made more sophisticated
}

function analyzeDifficulty(code: string): 'Beginner' | 'Intermediate' | 'Advanced' {
  // Basic difficulty analysis
  return 'Intermediate'
}

// Example of a specific algorithm variations function
function getMergeSortOptions(baseOption: CodeOption): CodeOption[] {
  return [
    baseOption,
    {
      title: "Optimized Merge Sort",
      description: "Memory-efficient implementation with in-place merging",
      code: `def merge_sort(arr: list) -> list:
    if len(arr) <= 1:
        return arr
        
    mid = len(arr) // 2
    left = arr[:mid]
    right = arr[mid:]
    
    merge_sort(left)
    merge_sort(right)
    
    i = j = k = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            arr[k] = left[i]
            i += 1
        else:
            arr[k] = right[j]
            j += 1
        k += 1
    
    while i < len(left):
        arr[k] = left[i]
        i += 1
        k += 1
    
    while j < len(right):
        arr[k] = right[j]
        j += 1
        k += 1
        
    return arr`,
      pros: ["Optimized memory usage", "In-place merging", "Stable sort"],
      cons: ["More complex implementation", "Requires careful index management"],
      performance: 9,
      readability: 7,
      difficulty: "Advanced"
    },
    {
      title: "Merge Sort with Type Hints",
      description: "Type-safe implementation with error handling",
      code: `from typing import List, TypeVar
T = TypeVar('T', int, float, str)

def merge_sort(arr: List[T]) -> List[T]:
    try:
        if not isinstance(arr, list):
            raise TypeError("Input must be a list")
            
        if len(arr) <= 1:
            return arr
            
        mid = len(arr) // 2
        left = merge_sort(arr[:mid])
        right = merge_sort(arr[mid:])
        
        return merge(left, right)
        
    except Exception as e:
        print(f"Error in merge_sort: {e}")
        raise

def merge(left: List[T], right: List[T]) -> List[T]:
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
      pros: ["Type-safe implementation", "Robust error handling", "Clear type hints"],
      cons: ["Additional overhead from type checking", "More verbose"],
      performance: 8,
      readability: 9,
      difficulty: "Intermediate"
    },
    {
      title: "Iterative Merge Sort",
      description: "Non-recursive implementation to avoid stack overflow",
      code: `def merge_sort_iterative(arr: list) -> list:
    width = 1
    n = len(arr)
    
    while width < n:
        for i in range(0, n, 2 * width):
            left = arr[i:min(i + width, n)]
            right = arr[min(i + width, n):min(i + 2 * width, n)]
            merged = merge(left, right)
            arr[i:i + len(merged)] = merged
        width *= 2
        
    return arr

def merge(left: list, right: list) -> list:
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
      pros: ["No recursion", "Avoids stack overflow", "Better for large datasets"],
      cons: ["More complex logic", "Harder to understand"],
      performance: 8,
      readability: 6,
      difficulty: "Advanced"
    }
  ]
}

// Add more option generator functions as needed... 