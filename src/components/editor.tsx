"use client";

import React from 'react';
import Editor, { OnChange } from '@monaco-editor/react';
import { Skeleton } from '@/components/ui/skeleton';

interface EditorComponentProps {
  language: string;
  value: string;
  onChange: OnChange;
}

export default function EditorComponent({ language, value, onChange }: EditorComponentProps) {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: true },
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        fontFamily: "'Source Code Pro', monospace"
      }}
      loading={<Skeleton className="h-full w-full rounded-none" />}
    />
  );
}
