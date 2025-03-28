"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { python } from "@codemirror/lang-python"
import { javascript } from "@codemirror/lang-javascript"
import { java } from "@codemirror/lang-java"
import { cpp } from "@codemirror/lang-cpp"
import { lineNumbers, highlightActiveLineGutter } from "@codemirror/view"
import { highlightSpecialChars, highlightActiveLine } from "@codemirror/view"
import { Compartment } from "@codemirror/state"

interface CodeEditorProps {
  value: string
  onChange: (code: string) => void
  language: string
  currentLine?: number
}

const CodeEditor = ({ value, onChange, language, currentLine }: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<EditorView | null>(null)
  const languageCompartment = useRef(new Compartment())

  useEffect(() => {
    if (!editorRef.current) return

    // Clean up previous editor instance
    if (editorViewRef.current) {
      editorViewRef.current.destroy()
    }

    // Get language extension
    const getLangExtension = () => {
      switch (language) {
        case "python":
          return python()
        case "javascript":
          return javascript()
        case "java":
          return java()
        case "c":
          return cpp()
        default:
          return python()
      }
    }

    // Create editor state
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        highlightActiveLine(),
        languageCompartment.current.of(getLangExtension()),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
      ],
    })

    // Create editor view
    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    editorViewRef.current = view

    return () => {
      view.destroy()
    }
  }, [])

  // Update language when it changes
  useEffect(() => {
    if (!editorViewRef.current) return

    const getLangExtension = () => {
      switch (language) {
        case "python":
          return python()
        case "javascript":
          return javascript()
        case "java":
          return java()
        case "c":
          return cpp()
        default:
          return python()
      }
    }

    editorViewRef.current.dispatch({
      effects: languageCompartment.current.reconfigure(getLangExtension()),
    })
  }, [language])

  // Update content when value changes externally
  useEffect(() => {
    if (!editorViewRef.current) return

    const currentContent = editorViewRef.current.state.doc.toString()
    if (currentContent !== value) {
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: value,
        },
      })
    }
  }, [value])

  // Highlight current line
  useEffect(() => {
    if (!editorViewRef.current || currentLine === undefined) return

    // Find the position of the current line
    const doc = editorViewRef.current.state.doc
    const lineStart = doc.line(Math.min(currentLine + 1, doc.lines)).from

    // Scroll to the current line
    editorViewRef.current.dispatch({
      effects: EditorView.scrollIntoView(lineStart, { y: "center" }),
    })

    // Add a custom class to highlight the current line
    const lineElement = editorViewRef.current.dom.querySelector(`.cm-line:nth-child(${currentLine + 1})`)
    if (lineElement) {
      lineElement.classList.add("current-execution-line")
    }

    return () => {
      // Remove highlight from all lines
      const lines = editorViewRef.current?.dom.querySelectorAll(".cm-line")
      lines?.forEach((line) => line.classList.remove("current-execution-line"))
    }
  }, [currentLine])

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 bg-secondary text-secondary-foreground font-medium">Code Editor ({language})</div>
      <div
        ref={editorRef}
        className="flex-grow overflow-auto"
        style={
          {
            height: "calc(100% - 40px)",
            "--active-line-bg": "rgba(59, 130, 246, 0.1)",
          } as React.CSSProperties
        }
      />
      <style jsx global>{`
        .cm-editor {
          height: 100%;
        }
        .current-execution-line {
          background-color: rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  )
}

export default CodeEditor

