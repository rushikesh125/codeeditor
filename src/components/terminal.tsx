"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
    output: string[];
    onInputCommand: (command: string) => void;
}

export default function Terminal({ output, onInputCommand }: TerminalProps) {
    const [inputValue, setInputValue] = useState('');
    const outputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            onInputCommand(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#252526] text-white font-code">
            <div className="flex items-center p-2 bg-[#333333] border-b border-black/20">
                <TerminalIcon className="h-4 w-4 mr-2" />
                <span className="text-sm">Terminal</span>
            </div>
            <div ref={outputRef} className="flex-grow p-2 overflow-y-auto text-sm">
                {output.map((line, index) => (
                    <div key={index} className="whitespace-pre-wrap">{line}</div>
                ))}
            </div>
            <div className="flex p-1 border-t border-black/20">
                <span className="text-green-400 pl-1 pr-2">&gt;</span>
                <Input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    className="w-full bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-6 text-sm"
                    placeholder="Type 'run' to execute JS file, or 'clear' to clear console..."
                    autoComplete="off"
                />
            </div>
        </div>
    );
}
