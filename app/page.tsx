"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import CodeEditor from "@/components/code-editor"
import ExecutionVisualizer from "@/components/execution-visualizer"
import { parseAndTraceExecution } from "@/lib/code-tracer"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ChevronLeft, ChevronRight, SkipBack, SkipForward, Play, Pause } from "lucide-react"
import { SettingsDialog } from "@/components/settings-dialog"
import { AIInsights } from "@/components/ai-insights"
import { ExecutionStep } from "@/lib/ai-service"
import { ClientOnly } from "@/components/client-only"

export default function CodeVisualizerApp() {
  const [code, setCode] = useState(`# Example Python code
def calculate_factorial(n):
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)

# Main program
result = calculate_factorial(5)
print(f"Factorial of 5 is {result}")
`)
  const [language, setLanguage] = useState("python")
  const [executionTrace, setExecutionTrace] = useState<ExecutionStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const playbackRef = useRef<NodeJS.Timeout | null>(null)

  const handleRunCode = async () => {
    try {
      const trace = await parseAndTraceExecution(code, language)
      setExecutionTrace(trace)
      setCurrentStep(0)
      setIsPlaying(false)
    } catch (error) {
      console.error("Error running code:", error)
      // Handle error appropriately
    }
  }

  const handleStepForward = () => {
    if (currentStep < executionTrace.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleJumpToStart = () => {
    setCurrentStep(0)
  }

  const handleJumpToEnd = () => {
    setCurrentStep(executionTrace.length - 1)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = setInterval(() => {
        setCurrentStep((prevStep) => {
          if (prevStep >= executionTrace.length - 1) {
            setIsPlaying(false)
            return prevStep
          }
          return prevStep + 1
        })
      }, 1000 / playbackSpeed)
    } else if (playbackRef.current) {
      clearInterval(playbackRef.current)
    }

    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current)
      }
    }
  }, [isPlaying, playbackSpeed, executionTrace.length])

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Code Execution Visualizer</h1>
        <ClientOnly>
          <SettingsDialog />
        </ClientOnly>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="c">C</SelectItem>
          </SelectContent>
        </Select>

        <ClientOnly>
          <Button 
            onClick={handleRunCode} 
            className="bg-primary"
          >
            Visualize Execution
          </Button>
        </ClientOnly>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-grow border rounded-lg overflow-hidden">
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              currentLine={executionTrace[currentStep]?.line}
            />
          </div>
        </ResizablePanel>

        <ResizablePanel defaultSize={30} minSize={25}>
          <div className="h-full">
            <ClientOnly>
              <ExecutionVisualizer trace={executionTrace} currentStep={currentStep} />
            </ClientOnly>
          </div>
        </ResizablePanel>

        <ResizablePanel defaultSize={30} minSize={25}>
          <div className="h-full">
            <ClientOnly>
              <AIInsights code={code} language={language} />
            </ClientOnly>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClientOnly>
            <Button
              variant="outline"
              size="icon"
              onClick={handleJumpToStart}
              disabled={currentStep === 0 || executionTrace.length === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          </ClientOnly>

          <ClientOnly>
            <Button
              variant="outline"
              size="icon"
              onClick={handleStepBackward}
              disabled={currentStep === 0 || executionTrace.length === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </ClientOnly>

          <ClientOnly>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={togglePlayback} 
              disabled={executionTrace.length === 0}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </ClientOnly>

          <ClientOnly>
            <Button
              variant="outline"
              size="icon"
              onClick={handleStepForward}
              disabled={currentStep === executionTrace.length - 1 || executionTrace.length === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </ClientOnly>

          <ClientOnly>
            <Button
              variant="outline"
              size="icon"
              onClick={handleJumpToEnd}
              disabled={currentStep === executionTrace.length - 1 || executionTrace.length === 0}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </ClientOnly>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Speed:</span>
          <Slider
            value={[playbackSpeed]}
            min={0.5}
            max={3}
            step={0.5}
            onValueChange={(value) => setPlaybackSpeed(value[0])}
            className="w-32"
          />
          <span className="text-sm">{playbackSpeed}x</span>
        </div>

        <div className="text-sm">
          Step {executionTrace.length > 0 ? currentStep + 1 : 0} of {executionTrace.length}
        </div>
      </div>
    </div>
  )
}
