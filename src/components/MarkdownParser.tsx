
import React from "react";
import { cn } from "../lib/utils";

interface MarkdownParserProps {
  markdown: string;
  className?: string;
}

const MarkdownParser: React.FC<MarkdownParserProps> = ({ markdown, className }) => {
  if (!markdown) return null;
  
  // Split the markdown into lines for processing
  const lines = markdown.split('\n');
  
  // Process the markdown line by line
  const processedLines = lines.map((line, index) => {
    // Process headings (## Heading)
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="text-xl font-bold mt-4 mb-2">
          {line.substring(3)}
        </h2>
      );
    }
    
    // Process headings (# Heading)
    if (line.startsWith('# ')) {
      return (
        <h1 key={index} className="text-2xl font-bold mt-4 mb-2">
          {line.substring(2)}
        </h1>
      );
    }
    
    // Process bold text (**text**)
    if (line.includes('**')) {
      const parts = line.split('**');
      const processed = parts.map((part, partIndex) => {
        // Every even index is outside bold markers
        if (partIndex % 2 === 0) {
          return <span key={partIndex}>{part}</span>;
        } else {
          // Every odd index is inside bold markers
          return <strong key={partIndex}>{part}</strong>;
        }
      });
      
      return <p key={index} className="my-2">{processed}</p>;
    }
    
    // Process list items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <li key={index} className="ml-6 list-disc my-1">
          {line.substring(2)}
        </li>
      );
    }
    
    // Process numbered list items
    if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '');
      return (
        <li key={index} className="ml-6 list-decimal my-1">
          {content}
        </li>
      );
    }
    
    // Process empty lines as spacing
    if (line.trim() === '') {
      return <div key={index} className="h-2"></div>;
    }
    
    // Default paragraph
    return <p key={index} className="my-2">{line}</p>;
  });
  
  // Process code blocks
  const finalOutput: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeBlockIndex = 0;
  
  processedLines.forEach((element, index) => {
    const textContent = lines[index];
    
    // Start of a code block
    if (textContent.startsWith('```') && !inCodeBlock) {
      inCodeBlock = true;
      codeContent = [];
      return;
    }
    
    // End of a code block
    if (textContent.startsWith('```') && inCodeBlock) {
      inCodeBlock = false;
      finalOutput.push(
        <pre key={`code-${codeBlockIndex}`} className="font-mono text-sm bg-slate-100 p-3 rounded-md my-3 overflow-x-auto">
          {codeContent.join('\n')}
        </pre>
      );
      codeBlockIndex++;
      return;
    }
    
    // Inside a code block
    if (inCodeBlock) {
      codeContent.push(textContent);
    } else {
      // Not in a code block, add the processed element
      finalOutput.push(element);
    }
  });
  
  return <div className={cn("markdown-content", className)}>{finalOutput}</div>;
};

export default MarkdownParser;
