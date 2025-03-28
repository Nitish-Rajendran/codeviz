// This is a simplified code tracer for demonstration purposes
// In a real application, you would need a more sophisticated parser and interpreter
import { aiService, ExecutionStep } from './ai-service';

// Mock function to simulate code execution and generate trace
export function parseAndTraceExecution(code: string, language: string): ExecutionStep[] {
  // First try to use AI service if API key is set
  if (aiService.hasApiKey()) {
    try {
      // This is async, but we're returning a promise that will resolve with the trace
      return aiService.generateExecutionTrace(code, language) as any;
    } catch (error) {
      console.error("Error using AI service for code tracing:", error);
      // Fall back to mock implementation
    }
  }

  // For demonstration, we'll create a simplified trace for Python code
  const lines = code.split("\n")
  const trace: ExecutionStep[] = []
  let output = ""

  // Simple variable tracking for demo
  const variables: Record<string, any> = {}
  const callStack: string[] = []

  // For demo purposes, we'll simulate the factorial function execution
  if (language === "python" && code.includes("calculate_factorial")) {
    // Initial state - entering main program
    trace.push({
      line: lines.findIndex((line) => line.includes("result =")),
      code: lines.find((line) => line.includes("result =")) || "",
      variables: { ...variables },
      callStack: ["main"],
      output,
    })

    // Call factorial(5)
    callStack.push("calculate_factorial(5)")
    trace.push({
      line: 1, // Line of function definition
      code: lines[1],
      variables: { ...variables, n: 5 },
      callStack: [...callStack],
      output,
    })

    // Check if n <= 1
    trace.push({
      line: 2,
      code: lines[2],
      variables: { ...variables, n: 5 },
      callStack: [...callStack],
      output,
    })

    // Recursive call factorial(4)
    callStack.push("calculate_factorial(4)")
    trace.push({
      line: 4,
      code: lines[4],
      variables: { ...variables, n: 5 },
      callStack: [...callStack],
      output,
    })

    // Check if n <= 1 for n=4
    trace.push({
      line: 2,
      code: lines[2],
      variables: { ...variables, n: 4 },
      callStack: [...callStack],
      output,
    })

    // Recursive call factorial(3)
    callStack.push("calculate_factorial(3)")
    trace.push({
      line: 4,
      code: lines[4],
      variables: { ...variables, n: 4 },
      callStack: [...callStack],
      output,
    })

    // Check if n <= 1 for n=3
    trace.push({
      line: 2,
      code: lines[2],
      variables: { ...variables, n: 3 },
      callStack: [...callStack],
      output,
    })

    // Recursive call factorial(2)
    callStack.push("calculate_factorial(2)")
    trace.push({
      line: 4,
      code: lines[4],
      variables: { ...variables, n: 3 },
      callStack: [...callStack],
      output,
    })

    // Check if n <= 1 for n=2
    trace.push({
      line: 2,
      code: lines[2],
      variables: { ...variables, n: 2 },
      callStack: [...callStack],
      output,
    })

    // Recursive call factorial(1)
    callStack.push("calculate_factorial(1)")
    trace.push({
      line: 4,
      code: lines[4],
      variables: { ...variables, n: 2 },
      callStack: [...callStack],
      output,
    })

    // Check if n <= 1 for n=1
    trace.push({
      line: 2,
      code: lines[2],
      variables: { ...variables, n: 1 },
      callStack: [...callStack],
      output,
    })

    // Base case return 1
    trace.push({
      line: 3,
      code: lines[3],
      variables: { ...variables, n: 1 },
      callStack: [...callStack],
      output,
    })

    // Return from factorial(1)
    callStack.pop()
    trace.push({
      line: 4,
      code: lines[4],
      variables: { ...variables, n: 2 },
      callStack: [...callStack],
      output,
    })

    // Calculate 2 * factorial(1) = 2 * 1 = 2
    trace.push({
      line: 4,
      code: lines[4],
      variables: { ...variables, n: 2 },
      callStack: [...callStack],
      output,
    })

    // Return from factorial(2)
    callStack.pop()
    trace.push({
      line: 4,
      code: lines[4],
      variables: { ...variables, n: 3 },
      callStack: [...callStack],
      output,
    })

    // Calculate 3 * factorial(2) = 3 * 2 = 6
    trace.push({
      line: 4,
      code: lines[4],
      variables: { ...variables, n: 3 },
      callStack: [...callStack],
      output,
    })

    // Return from factorial(3)
    callStack.pop()
    trace.push({
      line: 4,
      code: lines[4],
      variables: { ...variables, n: 4 },
      callStack: [...callStack],
      output,
    })

    // Calculate 4 * factorial(3) = 4 * 6 = 24
    trace.push({
      line: 4,
      code: lines[4],
      variables: { ...variables, n: 4 },
      callStack: [...callStack],
      output,
    })

    // Return from factorial(4)
    callStack.pop()
    trace.push({
      line: 4,
      code: lines[4],
      variables: { ...variables, n: 5 },
      callStack: [...callStack],
      output,
    })

    // Calculate 5 * factorial(4) = 5 * 24 = 120
    trace.push({
      line: 4,
      code: lines[4],
      variables: { ...variables, n: 5 },
      callStack: [...callStack],
      output,
    })

    // Return from factorial(5)
    callStack.pop()
    trace.push({
      line: lines.findIndex((line) => line.includes("result =")),
      code: lines.find((line) => line.includes("result =")) || "",
      variables: { ...variables, result: 120 },
      callStack: ["main"],
      output,
    })

    // Print result
    const printLine = lines.findIndex((line) => line.includes("print"))
    output = "Factorial of 5 is 120"
    trace.push({
      line: printLine,
      code: lines[printLine],
      variables: { ...variables, result: 120 },
      callStack: ["main"],
      output,
    })
  } else {
    // For other languages or code, create a simple trace
    lines.forEach((line, index) => {
      if (line.trim() && !line.trim().startsWith("#")) {
        // Simple variable assignment detection (for demo)
        const assignmentMatch = line.match(/(\w+)\s*=\s*(.+)/)
        if (assignmentMatch) {
          const [, varName, varValue] = assignmentMatch
          // Very simplified evaluation
          let value: any = varValue.trim()
          if (value.match(/^\d+$/)) {
            value = Number.parseInt(value)
          } else if (value.match(/^\d*\.\d+$/)) {
            value = Number.parseFloat(value)
          } else if (value === "True") {
            value = true
          } else if (value === "False") {
            value = false
          }
          variables[varName] = value
        }

        // Simple print detection (for demo)
        const printMatch = line.match(/print$$(.*)$$/)
        if (printMatch) {
          const printContent = printMatch[1]
          output += printContent.replace(/['"]/g, "") + "\n"
        }

        // Simple function call detection (for demo)
        const functionCallMatch = line.match(/(\w+)$$(.*)$$/)
        if (functionCallMatch && !line.includes("print")) {
          const [, funcName, args] = functionCallMatch
          callStack.push(`${funcName}(${args})`)
        }

        trace.push({
          line: index,
          code: line,
          variables: { ...variables },
          callStack: [...callStack],
          output,
        })
      }
    })
  }

  return trace
}

// New function to analyze code using AI
export async function analyzeCode(code: string, language: string) {
  if (!aiService.hasApiKey()) {
    throw new Error("API key not set. Please configure your OpenAI API key in settings.");
  }
  
  return aiService.analyzeCode(code, language);
}

// New function to get code explanation
export async function explainCode(code: string, language: string) {
  if (!aiService.hasApiKey()) {
    throw new Error("API key not set. Please configure your OpenAI API key in settings.");
  }
  
  return aiService.explainCode(code, language);
}

// New function to answer questions about code
export async function answerCodeQuestion(code: string, language: string, question: string) {
  if (!aiService.hasApiKey()) {
    throw new Error("API key not set. Please configure your OpenAI API key in settings.");
  }
  
  return aiService.answerCodeQuestion(code, language, question);
}
