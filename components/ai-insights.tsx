"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Brain, Search, Lightbulb, Code } from "lucide-react"
import { analyzeCode, explainCode, answerCodeQuestion } from "@/lib/code-tracer"
import { AICodeAnalysis } from "@/lib/ai-service"
import { aiService } from "@/lib/ai-service"
import { ClientOnly } from "@/components/client-only"

interface AIInsightsProps {
  code: string
  language: string
}

// Define a more flexible explanation type to handle both formats
interface ExplanationResponse {
  summary?: string;
  explanation?: string;
  lineByLineExplanation?: Array<{
    line: number;
    code: string;
    explanation: string;
  }>;
}

export function AIInsights({ code, language }: AIInsightsProps) {
  const [activeTab, setActiveTab] = useState("analysis")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AICodeAnalysis | null>(null)
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<string | null>(null)

  const handleAnalyzeCode = async () => {
    if (!aiService.hasApiKey()) {
      setError("Please set your API key in settings first.")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const result = await analyzeCode(code, language)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during analysis")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExplainCode = async () => {
    if (!aiService.hasApiKey()) {
      setError("Please set your API key in settings first.")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const result = await explainCode(code, language)
      setExplanation(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during explanation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setError("Please enter a question")
      return
    }

    if (!aiService.hasApiKey()) {
      setError("Please set your API key in settings first.")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const result = await answerCodeQuestion(code, language, question)
      setAnswer(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred answering your question")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 bg-secondary text-secondary-foreground font-medium flex items-center gap-2">
        <Brain className="h-4 w-4" />
        <span>AI Insights</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="analysis" className="flex items-center gap-1">
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="explanation" className="flex items-center gap-1">
            <Code className="h-3.5 w-3.5" />
            <span>Explanation</span>
          </TabsTrigger>
          <TabsTrigger value="ask" className="flex items-center gap-1">
            <Search className="h-3.5 w-3.5" />
            <span>Ask AI</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="flex-grow flex flex-col">
          <div className="mb-3">
            <ClientOnly>
              <Button 
                onClick={handleAnalyzeCode} 
                disabled={isLoading || !code}
                suppressHydrationWarning
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Code"
                )}
              </Button>
            </ClientOnly>
          </div>

          {error && (
            <div className="text-red-500 text-sm mb-3 p-2 border border-red-200 rounded-md bg-red-50">
              {error}
            </div>
          )}

          <ScrollArea className="flex-grow">
            {analysis ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Code Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm">{analysis.explanation}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Complexity Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm">
                        <span className="font-medium">Time:</span> {analysis.complexity.time}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Space:</span> {analysis.complexity.space}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {analysis.suggestions && analysis.suggestions.length > 0 && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <ul className="list-disc pl-5 space-y-1">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm">{suggestion}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Click "Analyze Code" to get AI insights
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="explanation" className="flex-grow overflow-hidden flex flex-col p-4">
          <div className="mb-4">
            <ClientOnly>
              <Button 
                onClick={handleExplainCode} 
                disabled={isLoading || !code}
                suppressHydrationWarning
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Explain Code"
                )}
              </Button>
            </ClientOnly>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {explanation ? (
            <ScrollArea className="flex-grow overflow-auto pr-3">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Explanation</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-sm whitespace-pre-wrap">
                      {explanation.explanation || explanation.summary || "No explanation available"}
                    </div>
                  </CardContent>
                </Card>
                
                {explanation.lineByLineExplanation && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">Line-by-Line Explanation</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="space-y-3">
                        {explanation.lineByLineExplanation.map((line, index) => (
                          <div key={index} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                            <div className="font-mono bg-muted p-1 rounded mb-1">{line.code}</div>
                            <div>{line.explanation}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-grow flex items-center justify-center text-muted-foreground">
              Click "Explain Code" to get a detailed explanation
            </div>
          )}
        </TabsContent>

        <TabsContent value="ask" className="flex-grow overflow-hidden flex flex-col p-4">
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Ask a question about the code..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
              className="flex-grow"
            />
            <ClientOnly>
              <Button 
                onClick={handleAskQuestion} 
                disabled={isLoading || !question.trim() || !code}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Ask"
                )}
              </Button>
            </ClientOnly>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {answer ? (
            <ScrollArea className="flex-grow overflow-auto pr-3">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">
                    Q: {question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-sm whitespace-pre-wrap">{answer}</div>
                </CardContent>
              </Card>
            </ScrollArea>
          ) : (
            <div className="flex-grow flex items-center justify-center text-muted-foreground">
              Ask a question about your code to get AI assistance
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
