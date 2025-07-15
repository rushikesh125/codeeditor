"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { CodeFile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import FileExplorer from '@/components/file-explorer';
import EditorComponent from '@/components/editor';
import { useToast } from "@/hooks/use-toast";

const initialFiles: CodeFile[] = [
  {
    id: '1',
    name: 'index.js',
    language: 'javascript',
    content: `// Welcome to Code Canvas!
// You can add, rename, and delete files.

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

export default function CodeCanvas() {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, you might load this from localStorage or an API
    setFiles(initialFiles);
    setActiveFileId(initialFiles[0]?.id || null);
  }, []);

  const activeFile = useMemo(() => files.find(file => file.id === activeFileId), [files, activeFileId]);

  const handleFileSelect = (id: string) => {
    setActiveFileId(id);
  };

  const handleCodeChange = (newContent: string | undefined) => {
    if (activeFileId && newContent !== undefined) {
      setFiles(files.map(file =>
        file.id === activeFileId ? { ...file, content: newContent } : file
      ));
    }
  };

  const getLanguageFromExtension = (filename: string) => {
    const extension = filename.split('.').pop();
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


  return (
    <div className="font-code">
        <SidebarProvider>
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
            </SidebarInset>
        </SidebarProvider>
    </div>
  );
}