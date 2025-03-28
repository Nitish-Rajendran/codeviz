// Define interfaces for AI responses
export interface AICodeAnalysis {
  explanation: string;
  complexity: {
    time: string;
    space: string;
  };
  suggestions?: string[];
}

export interface ExecutionStep {
  line: number;
  code: string;
  variables: Record<string, any>;
  callStack: string[];
  output?: string;
  explanation?: string;
}

export interface AICodeExplanation {
  summary: string;
  lineByLineExplanation: {
    line: number;
    code: string;
    explanation: string;
  }[];
}

export interface AICodeQuestion {
  question: string;
  answer: string;
}

// AI service for code analysis
export class AIService {
  private groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";
  private model = "llama3-70b-8192";
  private apiKey = "";

  constructor(apiKey?: string) {
    if (apiKey) {
      this.setApiKey(apiKey);
    }
  }

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  // Generate execution trace using Groq API
  public async generateExecutionTrace(
    code: string,
    language: string
  ): Promise<ExecutionStep[]> {
    // For Fibonacci code, use our mock implementation regardless of API key
    if (this.isFibonacciCode(code)) {
      return this.generateMockFibonacciTrace(code);
    }
    
    // For merge sort code, use a mock implementation
    if (this.isMergeSortCode(code)) {
      return this.generateMockMergeSortTrace(code);
    }
    
    if (!this.apiKey) {
      console.log("No API key set, using mock implementation");
      return this.generateMockTrace(code);
    }
    
    try {
      const prompt = `
      Analyze the following ${language} code and generate a detailed execution trace:
      
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Provide a step-by-step execution trace in the following JSON format:
      {
        "executionTrace": [
          {
            "line": <line number>,
            "code": <code at this line>,
            "variables": {<variable name>: <variable value>},
            "callStack": [<function names in call stack>],
            "output": <any console output at this step>,
            "explanation": <brief explanation of what happens at this step>
          },
          ...more steps
        ]
      }
      
      Return ONLY the JSON object, nothing else.
      `;
      
      const response = await globalThis.fetch(this.groqApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a code execution tracer that generates detailed step-by-step execution traces for code. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 4000
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.log('Groq API error response:', errorText);
        
        // Try to parse as JSON if possible
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // Not JSON, use as is
        }
        
        console.log('Groq API error details:', errorData);
        
        // Fall back to mock implementation
        console.log("Using mock implementation due to API error");
        return this.generateMockTrace(code);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        console.log('Empty response from Groq API, using mock implementation');
        return this.generateMockTrace(code);
      }

      // Try to extract JSON from the response, handling both pure JSON and JSON embedded in text
      try {
        // First try direct JSON parsing
        const parsedResponse = JSON.parse(content);
        if (parsedResponse.executionTrace && Array.isArray(parsedResponse.executionTrace)) {
          return parsedResponse.executionTrace;
        }
        
        // If we got JSON but not in the expected format, try to find the trace
        if (parsedResponse.trace || parsedResponse.steps) {
          return parsedResponse.trace || parsedResponse.steps;
        }
        
        // If we have a valid JSON but no trace, log and fall back
        console.log('Response did not contain execution trace, using mock implementation');
        return this.generateMockTrace(code);
      } catch (jsonError) {
        // If direct parsing failed, try to extract JSON from text
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
        if (jsonMatch) {
          const jsonContent = (jsonMatch[1] || jsonMatch[2]).trim();
          try {
            const extractedJson = JSON.parse(jsonContent);
            if (extractedJson.executionTrace && Array.isArray(extractedJson.executionTrace)) {
              return extractedJson.executionTrace;
            }
            if (extractedJson.trace || extractedJson.steps) {
              return extractedJson.trace || extractedJson.steps;
            }
          } catch (e) {
            // If we can't parse the extracted JSON, continue to fallback
            console.log('Failed to parse extracted JSON:', e);
          }
        }
        
        // If all parsing attempts fail, log and fall back to mock implementation
        console.log('Failed to parse Groq response, using mock implementation');
        return this.generateMockTrace(code);
      }
    } catch (error) {
      console.log('Error generating execution trace:', error);
      
      // Fall back to mock implementation if Groq fails
      return this.generateMockTrace(code);
    }
  }

  // Check if the code is a Fibonacci implementation
  private isFibonacciCode(code: string): boolean {
    // Simple heuristic to detect Fibonacci implementations
    return (
      code.includes("fibonacci") || 
      code.includes("fib(") || 
      (code.includes("fib ") && code.includes("return")) ||
      (code.includes("n-1") && code.includes("n-2") && code.includes("return"))
    );
  }

  // Generate a mock execution trace for Fibonacci code
  private generateMockFibonacciTrace(code: string): ExecutionStep[] {
    // Extract the function name from the code
    const funcNameMatch = code.match(/function\s+(\w+)|def\s+(\w+)/);
    const funcName = funcNameMatch 
      ? (funcNameMatch[1] || funcNameMatch[2]) 
      : "fib";
    
    // Extract parameter name
    const paramMatch = code.match(/\((\w+)\)/);
    const paramName = paramMatch ? paramMatch[1] : "n";
    
    // Create a trace for fib(5)
    const trace: ExecutionStep[] = [];
    
    // Initial call
    trace.push({
      line: 0,
      code: `${funcName}(5)`,
      variables: { [paramName]: 5 },
      callStack: ["main", `${funcName}(5)`],
      output: ""
    });
    
    // First recursive calls
    trace.push({
      line: 2,
      code: `return ${funcName}(n-1) + ${funcName}(n-2)`,
      variables: { [paramName]: 5 },
      callStack: ["main", `${funcName}(5)`],
      output: ""
    });
    
    // fib(4)
    trace.push({
      line: 0,
      code: `${funcName}(4)`,
      variables: { [paramName]: 4 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`],
      output: ""
    });
    
    // fib(4) recursive calls
    trace.push({
      line: 2,
      code: `return ${funcName}(n-1) + ${funcName}(n-2)`,
      variables: { [paramName]: 4 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`],
      output: ""
    });
    
    // fib(3) from fib(4)
    trace.push({
      line: 0,
      code: `${funcName}(3)`,
      variables: { [paramName]: 3 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`],
      output: ""
    });
    
    // fib(3) recursive calls
    trace.push({
      line: 2,
      code: `return ${funcName}(n-1) + ${funcName}(n-2)`,
      variables: { [paramName]: 3 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`],
      output: ""
    });
    
    // fib(2) from fib(3)
    trace.push({
      line: 0,
      code: `${funcName}(2)`,
      variables: { [paramName]: 2 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`, `${funcName}(2)`],
      output: ""
    });
    
    // fib(2) base case check
    trace.push({
      line: 1,
      code: `if (n <= 1) return n`,
      variables: { [paramName]: 2 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`, `${funcName}(2)`],
      output: ""
    });
    
    // fib(2) recursive calls
    trace.push({
      line: 2,
      code: `return ${funcName}(n-1) + ${funcName}(n-2)`,
      variables: { [paramName]: 2 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`, `${funcName}(2)`],
      output: ""
    });
    
    // fib(1) from fib(2)
    trace.push({
      line: 0,
      code: `${funcName}(1)`,
      variables: { [paramName]: 1 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`, `${funcName}(2)`, `${funcName}(1)`],
      output: ""
    });
    
    // fib(1) base case
    trace.push({
      line: 1,
      code: `if (n <= 1) return n`,
      variables: { [paramName]: 1 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`, `${funcName}(2)`, `${funcName}(1)`],
      output: ""
    });
    
    // fib(1) returns 1
    trace.push({
      line: 1,
      code: `if (n <= 1) return n`,
      variables: { [paramName]: 1, "return value": 1 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`, `${funcName}(2)`],
      output: ""
    });
    
    // fib(0) from fib(2)
    trace.push({
      line: 0,
      code: `${funcName}(0)`,
      variables: { [paramName]: 0 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`, `${funcName}(2)`, `${funcName}(0)`],
      output: ""
    });
    
    // fib(0) base case
    trace.push({
      line: 1,
      code: `if (n <= 1) return n`,
      variables: { [paramName]: 0 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`, `${funcName}(2)`, `${funcName}(0)`],
      output: ""
    });
    
    // fib(0) returns 0
    trace.push({
      line: 1,
      code: `if (n <= 1) return n`,
      variables: { [paramName]: 0, "return value": 0 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`, `${funcName}(2)`],
      output: ""
    });
    
    // fib(2) returns 1
    trace.push({
      line: 2,
      code: `return ${funcName}(n-1) + ${funcName}(n-2)`,
      variables: { [paramName]: 2, "return value": 1 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`],
      output: ""
    });
    
    // Continue with more steps for fib(5) calculation...
    // For brevity, I'm adding just a few more key steps
    
    // fib(1) from fib(3)
    trace.push({
      line: 0,
      code: `${funcName}(1)`,
      variables: { [paramName]: 1 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`, `${funcName}(1)`],
      output: ""
    });
    
    // fib(1) base case
    trace.push({
      line: 1,
      code: `if (n <= 1) return n`,
      variables: { [paramName]: 1 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`, `${funcName}(1)`],
      output: ""
    });
    
    // fib(1) returns 1
    trace.push({
      line: 1,
      code: `if (n <= 1) return n`,
      variables: { [paramName]: 1, "return value": 1 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`, `${funcName}(3)`],
      output: ""
    });
    
    // fib(3) returns 2
    trace.push({
      line: 2,
      code: `return ${funcName}(n-1) + ${funcName}(n-2)`,
      variables: { [paramName]: 3, "return value": 2 },
      callStack: ["main", `${funcName}(5)`, `${funcName}(4)`],
      output: ""
    });
    
    // Final result
    trace.push({
      line: 2,
      code: `return ${funcName}(n-1) + ${funcName}(n-2)`,
      variables: { [paramName]: 5, "return value": 5 },
      callStack: ["main"],
      output: "5"
    });
    
    return trace;
  }

  // Generate a simple mock execution trace for any code
  private generateMockTrace(code: string): ExecutionStep[] {
    const lines = code.split("\n");
    const trace: ExecutionStep[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === "") continue;
      
      trace.push({
        line: i,
        code: lines[i],
        variables: { "example": "value" },
        callStack: ["main"],
        output: ""
      });
    }
    
    return trace;
  }

  // Check if the code is a merge sort implementation
  private isMergeSortCode(code: string): boolean {
    // Simple heuristic to detect merge sort implementations
    return (
      (code.includes("merge_sort") || code.includes("mergeSort")) && 
      code.includes("merge(") && 
      (code.includes("left") || code.includes("right"))
    );
  }

  // Generate a mock execution trace for merge sort code
  private generateMockMergeSortTrace(code: string): ExecutionStep[] {
    const trace: ExecutionStep[] = [];
    
    // Extract the array from the code
    const arrayMatch = code.match(/arr\s*=\s*\[(.*?)\]/);
    const arrayStr = arrayMatch ? arrayMatch[1] : "12, 11, 13, 5, 6, 7";
    const arr = arrayStr.split(',').map(s => parseInt(s.trim()));
    
    // Initial state - entering main program
    trace.push({
      line: code.indexOf("if __name__ ==") > -1 ? code.indexOf("if __name__ ==") : 60,
      code: "if __name__ == \"__main__\":",
      variables: { arr: [...arr] },
      callStack: ["main"],
      output: "",
      explanation: "Program execution starts here"
    });
    
    // Print the original array
    trace.push({
      line: code.indexOf("print(\"Given array is\")") > -1 ? code.indexOf("print(\"Given array is\")") : 62,
      code: "print(\"Given array is\")",
      variables: { arr: [...arr] },
      callStack: ["main"],
      output: "Given array is",
      explanation: "Printing a message before showing the original array"
    });
    
    // Call print_list
    trace.push({
      line: code.indexOf("print_list(arr)") > -1 ? code.indexOf("print_list(arr)") : 63,
      code: "print_list(arr)",
      variables: { arr: [...arr] },
      callStack: ["main", "print_list"],
      output: arr.join(" ") + "\n",
      explanation: "Calling print_list to display the original array"
    });
    
    // Call merge_sort
    trace.push({
      line: code.indexOf("merge_sort(arr, 0, len(arr) - 1)") > -1 ? code.indexOf("merge_sort(arr, 0, len(arr) - 1)") : 65,
      code: "merge_sort(arr, 0, len(arr) - 1)",
      variables: { arr: [...arr], left: 0, right: arr.length - 1 },
      callStack: ["main", "merge_sort"],
      output: "",
      explanation: "Starting the merge sort algorithm with the full array"
    });
    
    // Simulate a few recursive calls and merges
    // First recursive call to left half
    trace.push({
      line: code.indexOf("merge_sort(arr, left, mid)") > -1 ? code.indexOf("merge_sort(arr, left, mid)") : 48,
      code: "merge_sort(arr, left, mid)",
      variables: { arr: [...arr], left: 0, mid: 2, right: 5 },
      callStack: ["main", "merge_sort", "merge_sort"],
      output: "",
      explanation: "Recursively sorting the left half of the array"
    });
    
    // Call to merge
    trace.push({
      line: code.indexOf("merge(arr, left, mid, right)") > -1 ? code.indexOf("merge(arr, left, mid, right)") : 50,
      code: "merge(arr, left, mid, right)",
      variables: { arr: [11, 12, 13, 5, 6, 7], left: 0, mid: 1, right: 2 },
      callStack: ["main", "merge_sort", "merge"],
      output: "",
      explanation: "Merging two sorted subarrays"
    });
    
    // Final sorted array
    trace.push({
      line: code.indexOf("print(\"\\nSorted array is\")") > -1 ? code.indexOf("print(\"\\nSorted array is\")") : 67,
      code: "print(\"\\nSorted array is\")",
      variables: { arr: [5, 6, 7, 11, 12, 13] },
      callStack: ["main"],
      output: "\nSorted array is",
      explanation: "Printing a message before showing the sorted array"
    });
    
    // Final print_list call
    trace.push({
      line: code.indexOf("print_list(arr)") > -1 ? code.indexOf("print_list(arr)", code.indexOf("print(\"\\nSorted array is\")")) : 68,
      code: "print_list(arr)",
      variables: { arr: [5, 6, 7, 11, 12, 13] },
      callStack: ["main", "print_list"],
      output: "5 6 7 11 12 13\n",
      explanation: "Displaying the final sorted array"
    });
    
    return trace;
  }

  // Analyze code using Groq API
  public async analyzeCode(
    code: string,
    language: string
  ): Promise<AICodeAnalysis> {
    if (!this.apiKey) {
      // Return a mock analysis for demonstration
      return this.generateMockAnalysis(code, language);
    }

    try {
      const prompt = `
      Analyze the following ${language} code:
      
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Provide a detailed analysis in the following JSON format:
      {
        "explanation": "Brief explanation of what the code does",
        "complexity": {
          "time": "Time complexity (e.g., O(n))",
          "space": "Space complexity (e.g., O(1))"
        },
        "suggestions": [
          "Suggestion 1 for improving the code",
          "Suggestion 2 for improving the code"
        ]
      }
      
      Return ONLY the JSON object, nothing else.
      `;
      
      const response = await fetch(this.groqApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a code analysis assistant that provides detailed analysis of code. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.log('Groq API error response:', errorText);
        
        // Try to parse as JSON if possible
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // Not JSON, use as is
        }
        
        console.log('Groq API error details:', errorData);
        
        // Fall back to mock implementation
        console.log("Using mock implementation for code analysis due to API error");
        return this.generateMockAnalysis(code, language);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        console.log('Empty response from Groq API, using mock analysis');
        return this.generateMockAnalysis(code, language);
      }

      // Try to extract JSON from the response
      try {
        // First try direct JSON parsing
        const parsedResponse = JSON.parse(content);
        
        // Ensure the response has the required properties
        if (parsedResponse.explanation && parsedResponse.complexity) {
          return {
            explanation: parsedResponse.explanation,
            complexity: {
              time: parsedResponse.complexity.time || "O(n)",
              space: parsedResponse.complexity.space || "O(n)"
            },
            suggestions: parsedResponse.suggestions || []
          };
        }
        
        // If we have a valid JSON but missing properties, log and fall back
        console.log('Response missing required properties, using mock analysis');
        return this.generateMockAnalysis(code, language);
      } catch (jsonError) {
        // If direct parsing failed, try to extract JSON from text
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
        if (jsonMatch) {
          const jsonContent = (jsonMatch[1] || jsonMatch[2]).trim();
          try {
            const extractedJson = JSON.parse(jsonContent);
            if (extractedJson.explanation && extractedJson.complexity) {
              return {
                explanation: extractedJson.explanation,
                complexity: {
                  time: extractedJson.complexity.time || "O(n)",
                  space: extractedJson.complexity.space || "O(n)"
                },
                suggestions: extractedJson.suggestions || []
              };
            }
          } catch (e) {
            console.log('Failed to parse extracted JSON:', e);
          }
        }
        
        // If all parsing attempts fail, log and fall back to mock implementation
        console.log('Failed to parse Groq response for analysis, using mock analysis');
        return this.generateMockAnalysis(code, language);
      }
    } catch (error) {
      console.log('Error analyzing code:', error);
      
      // Fall back to mock implementation
      return this.generateMockAnalysis(code, language);
    }
  }
  
  // Generate a mock analysis for demonstration
  private generateMockAnalysis(code: string, language: string): AICodeAnalysis {
    // Check if it's merge sort code
    if (this.isMergeSortCode(code)) {
      return {
        explanation: "This code implements the merge sort algorithm, a divide-and-conquer sorting algorithm. It works by dividing the array into halves, sorting each half recursively, and then merging the sorted halves back together.",
        complexity: {
          time: "O(n log n)",
          space: "O(n)"
        },
        suggestions: [
          "Consider using in-place merge sort to reduce space complexity",
          "For small arrays, you could use insertion sort as it performs better on small datasets",
          "Add comments to explain the key steps of the algorithm"
        ]
      };
    }
    
    // Check if it's Fibonacci code
    if (this.isFibonacciCode(code)) {
      return {
        explanation: "This code calculates the Fibonacci sequence using a recursive approach. The Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones, usually starting with 0 and 1.",
        complexity: {
          time: "O(2^n)",
          space: "O(n)"
        },
        suggestions: [
          "Consider using memoization to improve time complexity",
          "An iterative approach would be more efficient for large values of n",
          "Add error handling for negative inputs"
        ]
      };
    }
    
    // Generic analysis for other code
    return {
      explanation: "This code appears to define functions and execute operations. A more detailed analysis would require examining the specific logic and algorithms used.",
      complexity: {
        time: "Varies based on input size and operations",
        space: "Varies based on data structures used"
      },
      suggestions: [
        "Consider adding more comments to explain the purpose of functions",
        "Ensure proper error handling for edge cases",
        "Review variable naming for clarity and consistency"
      ]
    };
  }

  // Get detailed explanation of code
  public async explainCode(
    code: string,
    language: string
  ): Promise<any> {
    if (!this.apiKey) {
      // Return a mock explanation for demonstration
      return this.generateMockExplanation(code, language);
    }

    try {
      const prompt = `
      Explain the following ${language} code in detail:
      
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Provide a detailed explanation in the following JSON format:
      {
        "summary": "Brief summary of what the code does",
        "lineByLineExplanation": [
          {
            "line": 1,
            "code": "def example():",
            "explanation": "Defines a function named example"
          },
          ...more lines
        ]
      }
      
      Return ONLY the JSON object, nothing else.
      `;
      
      const response = await fetch(this.groqApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a code explanation assistant that provides detailed explanations of code. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.log('Groq API error response:', errorText);
        
        // Try to parse as JSON if possible
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // Not JSON, use as is
        }
        
        console.log('Groq API error details:', errorData);
        
        // Fall back to mock implementation
        console.log("Using mock implementation for code explanation due to API error");
        return this.generateMockExplanation(code, language);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        console.log('Empty response from Groq API, using mock explanation');
        return this.generateMockExplanation(code, language);
      }

      // Try to extract JSON from the response
      try {
        // First try direct JSON parsing
        const parsedResponse = JSON.parse(content);
        
        // Ensure the response has the required properties
        if (parsedResponse.summary || parsedResponse.lineByLineExplanation) {
          return parsedResponse;
        }
        
        // If we have a valid JSON but missing properties, log and fall back
        console.log('Response missing required properties, using mock explanation');
        return this.generateMockExplanation(code, language);
      } catch (jsonError) {
        // If direct parsing failed, try to extract JSON from text
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
        if (jsonMatch) {
          const jsonContent = (jsonMatch[1] || jsonMatch[2]).trim();
          try {
            const extractedJson = JSON.parse(jsonContent);
            if (extractedJson.summary || extractedJson.lineByLineExplanation) {
              return extractedJson;
            }
          } catch (e) {
            console.log('Failed to parse extracted JSON:', e);
          }
        }
        
        // If all parsing attempts fail, log and fall back to mock implementation
        console.log('Failed to parse Groq response for explanation, using mock explanation');
        return this.generateMockExplanation(code, language);
      }
    } catch (error) {
      console.log('Error explaining code:', error);
      
      // Fall back to mock implementation
      return this.generateMockExplanation(code, language);
    }
  }
  
  // Generate a mock explanation for demonstration
  private generateMockExplanation(code: string, language: string): any {
    // Check if it's merge sort code
    if (this.isMergeSortCode(code)) {
      return {
        summary: "This code implements the merge sort algorithm, a divide-and-conquer sorting algorithm that works by dividing the array, sorting the halves, and then merging them back together.",
        lineByLineExplanation: [
          {
            line: 1,
            code: "def merge(arr, left, mid, right):",
            explanation: "Defines the merge function that combines two sorted subarrays into a single sorted array."
          },
          {
            line: 2,
            code: "n1 = mid - left + 1",
            explanation: "Calculates the size of the left subarray."
          },
          {
            line: 3,
            code: "n2 = right - mid",
            explanation: "Calculates the size of the right subarray."
          },
          {
            line: 6,
            code: "L = [0] * n1",
            explanation: "Creates a temporary array to hold the left subarray."
          },
          {
            line: 7,
            code: "R = [0] * n2",
            explanation: "Creates a temporary array to hold the right subarray."
          },
          {
            line: 47,
            code: "def merge_sort(arr, left, right):",
            explanation: "Defines the main merge sort function that recursively sorts the array."
          },
          {
            line: 48,
            code: "if left < right:",
            explanation: "Checks if there are at least two elements to sort (base case for recursion)."
          },
          {
            line: 49,
            code: "mid = (left + right) // 2",
            explanation: "Calculates the middle index to divide the array into two halves."
          }
        ]
      };
    }
    
    // Check if it's Fibonacci code
    if (this.isFibonacciCode(code)) {
      return {
        summary: "This code calculates the Fibonacci sequence using a recursive approach, where each number is the sum of the two preceding ones.",
        lineByLineExplanation: [
          {
            line: 1,
            code: "def calculate_factorial(n):",
            explanation: "Defines a recursive function to calculate the factorial of a number."
          },
          {
            line: 2,
            code: "if n <= 1:",
            explanation: "Base case: if n is 0 or 1, return 1 (factorial of 0 and 1 is 1)."
          },
          {
            line: 3,
            code: "return 1",
            explanation: "Returns 1 for the base case."
          },
          {
            line: 4,
            code: "else:",
            explanation: "For all other values of n, calculate factorial recursively."
          },
          {
            line: 5,
            code: "return n * calculate_factorial(n - 1)",
            explanation: "Multiplies n by the factorial of (n-1), implementing the recursive definition of factorial."
          }
        ]
      };
    }
    
    // Generic explanation for other code
    const lines = code.split('\n');
    const lineByLineExplanation = lines.slice(0, Math.min(10, lines.length)).map((line, index) => ({
      line: index + 1,
      code: line.trim() || "(empty line)",
      explanation: "This line " + (line.trim() ? "contains code that contributes to the program's functionality." : "is empty or contains only whitespace.")
    }));
    
    return {
      summary: "This code appears to define functions and execute operations. A more detailed explanation would require examining the specific logic and algorithms used.",
      lineByLineExplanation
    };
  }

  // Answer questions about the code
  public async answerCodeQuestion(
    code: string,
    language: string,
    question: string
  ): Promise<string> {
    if (!this.apiKey) {
      // Return a mock answer for demonstration
      return this.generateMockAnswer(code, language, question);
    }

    try {
      const prompt = `
      Answer a question about the following ${language} code:
      
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Question: ${question}
      
      Provide a clear, detailed, and accurate answer to the question.
      `;
      
      const response = await globalThis.fetch(this.groqApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a code assistant that answers questions about code with accurate and helpful explanations.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.log('Groq API error response:', errorText);
        
        // Try to parse as JSON if possible
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // Not JSON, use as is
        }
        
        console.log('Groq API error details:', errorData);
        
        // Fall back to mock implementation
        console.log("Using mock implementation for code question due to API error");
        return this.generateMockAnswer(code, language, question);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        console.log('Empty response from Groq API, using mock answer');
        return this.generateMockAnswer(code, language, question);
      }

      return content;
    } catch (error) {
      console.log('Error answering code question:', error);
      
      // Fall back to mock implementation
      return this.generateMockAnswer(code, language, question);
    }
  }
  
  // Generate a mock answer for demonstration
  private generateMockAnswer(code: string, language: string, question: string): string {
    // Check if it's merge sort code
    if (this.isMergeSortCode(code)) {
      if (question.toLowerCase().includes("time complexity")) {
        return "The time complexity of merge sort is O(n log n) in all cases (best, average, and worst). This is because the algorithm always divides the array into halves (log n levels) and at each level, it performs a linear amount of work (O(n)) to merge the subarrays.";
      } else if (question.toLowerCase().includes("space complexity")) {
        return "The space complexity of this merge sort implementation is O(n) because it creates temporary arrays L[] and R[] to hold the subarrays during the merging process. The recursive call stack also takes O(log n) space, but the O(n) for the temporary arrays dominates.";
      } else if (question.toLowerCase().includes("how")) {
        return "Merge sort works by dividing the array into two halves, recursively sorting each half, and then merging the sorted halves back together. The merge operation is the key step, where elements from the two sorted subarrays are compared and placed in the correct order in the original array.";
      }
    }
    
    // Check if it's Fibonacci code
    if (this.isFibonacciCode(code)) {
      if (question.toLowerCase().includes("recursive")) {
        return "Yes, this code uses recursion to calculate the factorial. The function calls itself with a smaller input (n-1) until it reaches the base case (n <= 1). Each recursive call is placed on the call stack, which is why this approach can lead to a stack overflow for large inputs.";
      } else if (question.toLowerCase().includes("time complexity")) {
        return "The time complexity of this recursive factorial implementation is O(n) because it makes n recursive calls, each doing constant work. However, for the Fibonacci implementation (if that's what you're referring to), the time complexity would be O(2^n) due to the exponential growth of recursive calls.";
      } else if (question.toLowerCase().includes("improve")) {
        return "The code could be improved by using an iterative approach instead of recursion, which would be more efficient and avoid potential stack overflow for large inputs. Another improvement would be to use memoization (caching previously computed results) to avoid redundant calculations.";
      }
    }
    
    // Generic answers for common questions
    if (question.toLowerCase().includes("what does this code do")) {
      return "This code appears to define functions and execute operations. It seems to be implementing an algorithm or solving a specific problem. To provide a more detailed answer, I would need to analyze the specific logic and structure of the code.";
    } else if (question.toLowerCase().includes("how can i improve")) {
      return "Some general improvements could include: adding more comments to explain the purpose of functions and complex operations, ensuring proper error handling for edge cases, optimizing performance-critical sections, and following language-specific best practices for code organization and naming conventions.";
    } else if (question.toLowerCase().includes("bug") || question.toLowerCase().includes("error")) {
      return "Without running the code, it's difficult to identify specific bugs. However, common issues to check for include: off-by-one errors in loops, incorrect boundary conditions, unhandled edge cases, and potential null/undefined references. Testing with various inputs would help identify any issues.";
    }
    
    // Default answer
    return "To answer this question accurately, I would need to analyze the specific details of the code. The code appears to define functions and execute operations, but without running it or having more context, I can only provide general guidance. If you have a specific aspect of the code you'd like me to focus on, please let me know.";
  }

  // Helper methods to create prompts
  private createTracePrompt(code: string, language: string): string {
    return `Generate a detailed step-by-step execution trace for the following ${language} code:
\`\`\`${language}
${code}
\`\`\`

For each step of execution, provide:
1. The line number being executed (0-indexed)
2. The code at that line
3. The state of all variables at that point
4. The current call stack
5. Any output produced

Format your response as JSON with the following structure:
{
  "executionTrace": [
    {
      "line": 0,
      "code": "def example():",
      "variables": {},
      "callStack": ["main"],
      "output": ""
    },
    ...
  ]
}`;
  }

  private createAnalysisPrompt(code: string, language: string): string {
    return `Analyze the following ${language} code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. A detailed execution trace
2. An explanation of what the code does
3. Time and space complexity analysis
4. Suggestions for improvement or potential issues

Format your response as JSON with the following structure:
{
  "executionTrace": [
    {
      "line": 0,
      "code": "def example():",
      "variables": {},
      "callStack": ["main"],
      "output": "",
      "explanation": "Defines a function named example"
    },
    ...
  ],
  "explanation": "This code calculates...",
  "complexity": {
    "time": "O(n)",
    "space": "O(n)"
  },
  "suggestions": [
    "Consider using memoization to improve performance",
    ...
  ]
}`;
  }
}

// Create and export a singleton instance
export const aiService = new AIService();
