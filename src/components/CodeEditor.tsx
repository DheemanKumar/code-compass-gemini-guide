
import React, { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";

interface CodeEditorProps {
  defaultValue?: string;
  onChange: (value: string) => void;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  defaultValue = '', 
  onChange,
  className
}) => {
  const [value, setValue] = useState(defaultValue);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  // Simple tab handling to improve coding experience
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      setValue(newValue);
      
      // Set cursor position after the inserted tab
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = start + 4;
          editorRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };
  
  return (
    <div className={cn(
      "relative border rounded-md shadow-sm overflow-hidden",
      className
    )}>
      <textarea
        ref={editorRef}
        className="code-editor w-full h-full p-4 resize-none bg-editor-background text-editor-text focus:outline-none focus:ring-2 focus:ring-primary"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder="# Enter your Python code here
# Example:
print('Hello, world!')"
        rows={15}
      />
    </div>
  );
};

export default CodeEditor;
