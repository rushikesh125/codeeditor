"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { CodeFile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import FileExplorer from '@/components/file-explorer';
import EditorComponent from '@/components/editor';
import Terminal from '@/components/terminal';
import { useToast } from "@/hooks/use-toast";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Button } from '@/components/ui/button';
import { PanelLeft, Play, Send } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

const initialFiles: CodeFile[] = [
  {
    id: '1',
    name: 'index.js',
    language: 'javascript',
    content: `// Welcome to Code Canvas!
// You can add, rename, and delete files.
// Your console.log output will appear in the terminal below.

function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
`,
  },
  {
    id: '2',
    name: 'styles.css',
    language: 'css',
    content: `/* Feel free to style your components */

body {
  font-family: 'Inter', sans-serif;
}
`,
  },
  {
    id: '3',
    name: 'README.md',
    language: 'markdown',
    content: `# Code Canvas

This is an interactive code editor built with Next.js and Monaco Editor.

## Features
- File Explorer
- Code Editing
- File CRUD Operations
`
  }
];

function CodeCanvasContent() {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const { toast } = useToast();
  const { isMobile, toggleSidebar } = useSidebar();

  const executeCode = useCallback((code: string) => {
    const newOutput: string[] = [];
    const oldLog = console.log;
    console.log = (...args: any[]) => {
      newOutput.push(args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' '));
    };

    try {
      new Function(code)();
    } catch (error: any) {
      newOutput.push(`Error: ${error.message}`);
    } finally {
      console.log = oldLog;
      setTerminalOutput(prev => [...prev, ...newOutput]);
    }
  }, []);

  useEffect(() => {
    setFiles(initialFiles);
    const firstFile = initialFiles[0];
    if (firstFile) {
      setActiveFileId(firstFile.id);
      if (firstFile.language === 'javascript') {
        setTerminalOutput([]);
        executeCode(firstFile.content);
      }
    } else {
        setActiveFileId(null);
    }
  }, [executeCode]);

  const activeFile = useMemo(() => files.find(file => file.id === activeFileId), [files, activeFileId]);

  const handleFileSelect = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file && file.language === 'javascript') {
      setTerminalOutput([]);
      executeCode(file.content);
    } else {
       setTerminalOutput([]);
    }
    setActiveFileId(id);
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleCodeChange = (newContent: string | undefined) => {
    if (activeFileId && newContent !== undefined) {
      setFiles(files.map(file =>
        file.id === activeFileId ? { ...file, content: newContent } : file
      ));
       if (activeFile?.language === 'javascript') {
        setTerminalOutput([]);
        executeCode(newContent);
      }
    }
  };

  const getLanguageFromExtension = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  }

  const handleAddFile = (name: string) => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Error", description: "File name cannot be empty." });
      return;
    }
    if (files.some(f => f.name === name)) {
      toast({ variant: "destructive", title: "Error", description: "A file with this name already exists." });
      return;
    }

    const newFile: CodeFile = {
      id: uuidv4(),
      name,
      language: getLanguageFromExtension(name),
      content: `// New file: ${name}\n`,
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
    toast({ title: "Success", description: `File "${name}" created.` });
     if (isMobile) {
      toggleSidebar();
    }
  };

  const handleDeleteFile = (id: string) => {
    const fileToDelete = files.find(f => f.id === id);
    if (!fileToDelete) return;

    const remainingFiles = files.filter(file => file.id !== id);
    setFiles(remainingFiles);

    if (activeFileId === id) {
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
    toast({ title: "Success", description: `File "${fileToDelete.name}" deleted.` });
  };

  const handleRenameFile = (id: string, newName: string) => {
    if (!newName.trim()) {
      toast({ variant: "destructive", title: "Error", description: "File name cannot be empty." });
      return;
    }
    if (files.some(f => f.name === newName && f.id !== id)) {
      toast({ variant: "destructive", title: "Error", description: "A file with this name already exists." });
      return;
    }

    const oldName = files.find(f => f.id === id)?.name;
    setFiles(files.map(file =>
      file.id === id ? { ...file, name: newName, language: getLanguageFromExtension(newName) } : file
    ));
    toast({ title: "Success", description: `Renamed "${oldName}" to "${newName}".` });
  };
  
  const handleRunCode = () => {
    if (activeFile && activeFile.language === 'javascript') {
      setTerminalOutput([]);
      executeCode(activeFile.content);
    }
  };

  const handleSubmit = () => {
    const submission = {
      files: files.map(({ id, language, ...rest }) => rest), // Omit id and language
      terminalContent: terminalOutput,
    };

    const formattedSubmission = JSON.stringify(submission, null, 2);
    
    // Log to browser console
    console.log("Submission Data:", submission);

    // Add to app terminal
    setTerminalOutput(prev => [...prev, "--- Submission ---", formattedSubmission, "------------------"]);
    toast({ title: "Submitted", description: "Project data logged to console."});
  };

  const handleCommand = (command: string) => {
    setTerminalOutput(prev => [...prev, `> ${command}`]);
    if (command.toLowerCase() === 'run' && activeFile && activeFile.language === 'javascript') {
      handleRunCode();
    } else if (command.toLowerCase() === 'clear') {
       setTerminalOutput([]);
    } else {
       setTerminalOutput(prev => [...prev, `Command not found: ${command}`]);
    }
  };


  return (
    <>
      <FileExplorer
          files={files}
          activeFileId={activeFileId}
          onFileSelect={handleFileSelect}
          onAddFile={handleAddFile}
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
      />
      <SidebarInset>
          <div className="h-screen w-full flex flex-col bg-background">
              <div className="md:hidden flex items-center p-2 border-b">
                <SidebarTrigger>
                  <PanelLeft />
                </SidebarTrigger>
                <h1 className="text-lg font-semibold ml-2">Code Canvas</h1>
              </div>
              <PanelGroup direction="vertical">
                  <Panel defaultSize={70} minSize={20}>
                    <div className="h-full flex flex-col">
                       <div className="flex items-center justify-start gap-2 p-2 border-b bg-accent/30">
                          <Button variant="secondary" size="sm" onClick={handleRunCode}>
                            <Play className="mr-2 h-4 w-4" />
                            Run
                          </Button>
                          <Button size="sm" onClick={handleSubmit}>
                            <Send className="mr-2 h-4 w-4" />
                            Submit
                          </Button>
                        </div>
                        <div className="flex-grow h-0">
                          {activeFile ? (
                              <EditorComponent
                                  key={activeFile.id}
                                  language={activeFile.language}
                                  value={activeFile.content}
                                  onChange={handleCodeChange}
                              />
                          ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                  Select a file to start editing
                              </div>
                          )}
                        </div>
                    </div>
                  </Panel>
                  <PanelResizeHandle className="h-2 bg-border data-[resize-handle-state=drag]:bg-primary transition-colors" />
                  <Panel defaultSize={30} minSize={10}>
                     <Terminal output={terminalOutput} onInputCommand={handleCommand} />
                  </Panel>
              </PanelGroup>
          </div>
      </SidebarInset>
    </>
  );
}


export default function CodeCanvas() {
  return (
    <div className="font-code">
        <SidebarProvider>
          <CodeCanvasContent />
        </SidebarProvider>
    </div>
  );
}
