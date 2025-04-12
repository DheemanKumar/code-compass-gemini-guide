
import React, { useState, useEffect } from "react";
import CodeEditor from "../components/CodeEditor";
import MarkdownParser from "../components/MarkdownParser";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useToast } from "../components/ui/use-toast";
import { ChevronRight, Code2, Loader2, HelpCircle, AlertCircle, Sparkles, Terminal, MessageSquareHeart } from "lucide-react";
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
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <header className="mb-8 text-center animate-fade-in">
        <div className="inline-block relative">
          <div className="absolute -z-10 w-full h-full blur-3xl opacity-20 bg-gradient-purple rounded-full"></div>
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center">
            <Code2 className="mr-3 text-primary" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              Code Compass
            </span>
            <Sparkles className="ml-3 text-yellow-500 animate-pulse-slow" size={24} />
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Run Python code and get AI-powered explanations for errors
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="animate-bounce-in">
          <Card className="glass-card card-gradient h-full border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl text-primary">
                <Terminal className="mr-2 h-5 w-5" />
                Python Code
              </CardTitle>
              <CardDescription>
                Write your Python code and click Run to execute
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeEditor onChange={handleCodeChange} />
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 pt-2">
              <Button 
                onClick={handleRunCode} 
                disabled={isLoading}
                className="btn-glow flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
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

        <div className="space-y-6 animate-bounce-in" style={{ animationDelay: "150ms" }}>
          <Card className={`glass-card h-full transition-all duration-500 ${error ? 'border-error/30' : output ? 'border-success/30' : 'border-primary/10'}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`flex items-center text-xl ${error ? 'text-error' : 'text-success'}`}>
                {error ? "Error" : "Output"}
              </CardTitle>
              <CardDescription>
                {error 
                  ? "Your code produced an error" 
                  : "Results of your Python code execution"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`border rounded-lg p-4 h-[288px] overflow-auto ${error ? 'output-error' : output ? 'output-success' : 'bg-muted/30 border-border'}`}>
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <pre className="font-mono text-sm whitespace-pre-wrap">{error}</pre>
                ) : output ? (
                  <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
                ) : (
                  <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                    <p>Run your code to see output here</p>
                  </div>
                )}
              </div>
            </CardContent>
            {error && !autoExplain && (
              <CardFooter className="flex justify-end pt-2">
                <Button 
                  onClick={handleExplainError} 
                  variant="outline"
                  disabled={isExplaining}
                  className="flex items-center border-primary/20 hover:bg-primary/10"
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
            <Card className="animate-fade-in bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl text-purple-700">
                  <MessageSquareHeart className="mr-2 h-5 w-5 text-purple-600" />
                  Error Explanation
                </CardTitle>
                <CardDescription className="text-purple-700/80">
                  Understanding what went wrong
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <MarkdownParser markdown={autoExplain} className="text-purple-900" />
                </div>
              </CardContent>
            </Card>
          )}

          {explanation && !autoExplain && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquareHeart className="mr-2 h-5 w-5" />
                  Error Explanation
                </CardTitle>
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

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <Separator className="mb-6" />
        <div className="flex items-center justify-center gap-2">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 blur-md opacity-50 absolute"></div>
            <Sparkles className="relative text-yellow-500 h-5 w-5" />
          </div>
          <p>© 2025 Code Compass • Powered by Gemini AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
