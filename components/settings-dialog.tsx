"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import { aiService } from "@/lib/ai-service"

export function SettingsDialog() {
  const [apiKey, setApiKey] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [open, setOpen] = useState(false)

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("groq-api-key")
    if (savedApiKey) {
      setApiKey(savedApiKey)
      aiService.setApiKey(savedApiKey)
    }
  }, [])

  const handleSaveApiKey = () => {
    if (apiKey) {
      localStorage.setItem("groq-api-key", apiKey)
      aiService.setApiKey(apiKey)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Groq API Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="api-key">Groq API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="gsk_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and never sent to our servers.
              Get your API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Groq Console</a>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSaveApiKey}>Save API Key</Button>
            {isSaved && <span className="text-green-500 text-sm">Saved!</span>}
          </div>
          
          <div className="pt-2">
            <p className="text-sm">
              Note: If you don't have a Groq API key, the visualizer will still work with Fibonacci code using a built-in mock implementation.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
