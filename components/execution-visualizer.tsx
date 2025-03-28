"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ExecutionStep {
  line: number
  code: string
  variables: Record<string, any>
  callStack: string[]
  output?: string
}

interface ExecutionVisualizerProps {
  trace: ExecutionStep[]
  currentStep: number
}

const ExecutionVisualizer = ({ trace, currentStep }: ExecutionVisualizerProps) => {
  const [activeTab, setActiveTab] = useState("variables")
  const currentTrace = trace[currentStep] || { variables: {}, callStack: [], output: "" }

  const formatValue = (value: any): string => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value)
    }
    return String(value)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 bg-secondary text-secondary-foreground font-medium">Execution Visualization</div>

      {trace.length > 0 ? (
        <div className="flex-grow flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="callstack">Call Stack</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>

            <TabsContent value="variables" className="flex-grow">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Variable State</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-350px)]">
                    {Object.keys(currentTrace.variables).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(currentTrace.variables).map(([name, value]) => (
                          <div key={name} className="flex items-start p-2 border rounded-md">
                            <div className="font-mono font-medium w-1/3">{name}</div>
                            <div className="font-mono bg-muted p-1 rounded flex-1 overflow-x-auto">
                              {formatValue(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-center py-4">No variables at this step</div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="callstack" className="flex-grow">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Call Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-350px)]">
                    {currentTrace.callStack.length > 0 ? (
                      <div className="space-y-2">
                        {currentTrace.callStack.map((call, index) => (
                          <div
                            key={index}
                            className="p-2 border rounded-md font-mono"
                            style={{
                              marginLeft: `${index * 12}px`,
                              borderLeftWidth: "4px",
                              borderLeftColor:
                                index === currentTrace.callStack.length - 1 ? "var(--primary)" : "var(--border)",
                            }}
                          >
                            {call}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-center py-4">Call stack is empty</div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="output" className="flex-grow">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Program Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-350px)]">
                    <div className="font-mono bg-black text-green-400 p-4 rounded-md whitespace-pre-wrap">
                      {currentTrace.output || "No output yet"}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-4">
            <CardContent className="p-3">
              <div className="font-mono text-sm">
                <span className="font-semibold">Current Line:</span> {currentTrace.line + 1}
              </div>
              <div className="font-mono text-sm mt-1 bg-muted p-2 rounded">{currentTrace.code}</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-muted-foreground">
          Click "Visualize Execution" to see the code execution trace
        </div>
      )}
    </div>
  )
}

export default ExecutionVisualizer

