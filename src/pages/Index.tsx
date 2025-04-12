
import React, { useState, useEffect } from "react";
import CodeEditor from "../components/CodeEditor";
import MarkdownParser from "../components/MarkdownParser";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useToast } from "../components/ui/use-toast";
import { ChevronRight, Code2, Loader2, HelpCircle, AlertCircle } from "lucide-react";
import { executeCode, explainError, callGeminiAPI } from "../services/api";

const Index = () => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [autoExplain, setAutoExplain] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Empty Code",
        description: "Please enter some Python code first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setOutput(null);
    setError(null);
    setExplanation(null);
    setAutoExplain(null);

    try {
      const result = await executeCode(code);
      
      if (result.success) {
        setOutput(result.output || "Code executed successfully with no output.");
        setError(null);
      } else {
        setOutput(null);
        setError(result.error || "An unknown error occurred.");
        
        // Automatically fetch error explanation
        try {
          let explanation;
          try {
            // Try to use Gemini API first
            explanation = await callGeminiAPI(result.error || "Unknown error");
          } catch (geminiError) {
            // Fall back to mock explanations
            console.error("Gemini API call failed, using fallback explanation", geminiError);
            const fallbackResult = await explainError(result.error || "Unknown error");
            explanation = fallbackResult.explanation;
          }
          setAutoExplain(explanation);
        } catch (explainErr) {
          console.error("Error getting auto explanation:", explainErr);
        }
      }
    } catch (err) {
      console.error("Error running code:", err);
      setOutput(null);
      setError("Failed to execute code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainError = async () => {
    if (!error) return;
    
    setIsExplaining(true);
    
    try {
      // In a real implementation, this would call the actual Gemini API
      // For now, we'll use our mock service
      try {
        // Try the real Gemini API first (for demo purposes)
        const realExplanation = await callGeminiAPI(error);
        setExplanation(realExplanation);
      } catch (geminiError) {
        // Fall back to our mock explanations if the API call fails
        console.error("Gemini API call failed, using fallback explanation", geminiError);
        const result = await explainError(error);
        setExplanation(result.explanation);
      }
    } catch (err) {
      console.error("Error explaining code:", err);
      setExplanation("Failed to get explanation. Please try again.");
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
          <Code2 className="mr-2" />
          Code Compass
        </h1>
        <p className="text-muted-foreground">
          Run Python code and get AI-powered explanations for errors
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Python Code</CardTitle>
              <CardDescription>
                Write your Python code and click Run to execute
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeEditor onChange={handleCodeChange} />
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                onClick={handleRunCode} 
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ChevronRight className="mr-2 h-4 w-4" />
                )}
                Run Code
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {error ? "Error" : "Output"}
              </CardTitle>
              <CardDescription>
                {error 
                  ? "Your code produced an error" 
                  : "Results of your Python code execution"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`border rounded-md p-4 h-[288px] overflow-auto ${error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : error ? (
                  <pre className="text-red-600 font-mono text-sm whitespace-pre-wrap">{error}</pre>
                ) : output ? (
                  <pre className="text-green-700 font-mono text-sm whitespace-pre-wrap">{output}</pre>
                ) : (
                  <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                    <p>Run your code to see output here</p>
                  </div>
                )}
              </div>
            </CardContent>
            {error && !autoExplain && (
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleExplainError} 
                  variant="outline"
                  disabled={isExplaining}
                  className="flex items-center"
                >
                  {isExplaining ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <HelpCircle className="mr-2 h-4 w-4" />
                  )}
                  Help Me Understand
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Auto Explanation section appears immediately when there's an error */}
          {autoExplain && (
            <Card className="mt-6 animate-fade-in bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-purple-900">
                  <AlertCircle className="mr-2 h-5 w-5 text-purple-700" />
                  Error Explanation
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Understanding what went wrong
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <MarkdownParser markdown={autoExplain} className="text-purple-950" />
                </div>
              </CardContent>
            </Card>
          )}

          {explanation && !autoExplain && (
            <Card className="mt-6 animate-fade-in">
              <CardHeader>
                <CardTitle>Error Explanation</CardTitle>
                <CardDescription>
                  AI-powered explanation of your error
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <MarkdownParser markdown={explanation} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <Separator className="mb-4" />
        <p>© 2025 Code Compass • Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

export default Index;
