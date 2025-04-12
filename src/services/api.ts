
// This file would normally connect to a Python Flask backend,
// but for this demo we're simulating the backend responses

interface CodeResponse {
  success: boolean;
  output?: string;
  error?: string;
}

interface ExplanationResponse {
  explanation: string;
}

// Simulated backend for executing Python code
export const executeCode = async (code: string): Promise<CodeResponse> => {
  try {
    // For demonstration purposes, we're simulating basic Python execution
    // In a real app, this would send the code to a Flask backend
    
    // Simulate different responses based on code content
    if (code.includes('print(')) {
      // Check for various error conditions first
      
      // Simulate a division by zero error
      if (code.includes('1/0')) {
        return {
          success: false,
          error: "ZeroDivisionError: division by zero"
        };
      }
      
      // Simulate a name error
      if (code.includes('undefined_variable')) {
        return {
          success: false,
          error: "NameError: name 'undefined_variable' is not defined"
        };
      }
      
      // Simulate syntax error
      if (code.includes('print(Hello)')) {
        return {
          success: false,
          error: "SyntaxError: invalid syntax. Perhaps you forgot a comma?"
        };
      }
      
      // If no errors, then it's a successful execution
      const match = code.match(/print\(['"](.+)['"]\)/);
      if (match) {
        return { 
          success: true,
          output: match[1]
        };
      }
      
      // Generic success case
      return {
        success: true,
        output: "Program executed successfully!"
      };
    }
    
    // Add more error simulations for testing
    if (code.includes('for i in range')) {
      if (code.includes('range(')) {
        return {
          success: true,
          output: "Loop executed successfully!"
        };
      } else {
        return {
          success: false,
          error: "TypeError: range expected at least 1 argument, got 0"
        };
      }
    }
    
    if (code.includes('import ')) {
      if (code.includes('import nonexistent_module')) {
        return {
          success: false,
          error: "ModuleNotFoundError: No module named 'nonexistent_module'"
        };
      }
    }
    
    // Simulate an indentation error
    if (code.includes('def ')) {
      if (!code.includes('    ')) {
        return {
          success: false,
          error: "IndentationError: Expected an indented block after function definition"
        };
      }
    }
    
    // Default case - simulate a generic syntax error
    return {
      success: false,
      error: "SyntaxError: Invalid syntax"
    };
    
  } catch (error) {
    console.error("Error executing code:", error);
    return {
      success: false,
      error: "An unexpected error occurred while executing the code."
    };
  }
};

// Use the Gemini API to get AI explanations for Python errors
export const explainError = async (errorMessage: string): Promise<ExplanationResponse> => {
  try {
    // This matches your Python function approach with the Gemini API
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCh6LWNx8l1mDMB61zQEWAX6nk8pm6ZdLc";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `Explain this Python error in simple terms:\n\n${errorMessage}` }
            ]
          }
        ]
      }),
    });
    
    const data = await response.json();
    
    // If we get an error from the API, fall back to our mock explanations
    if (data.error) {
      console.error("Error from Gemini API:", data.error);
      return getFallbackExplanation(errorMessage);
    }
    
    // Extract the explanation text from the Gemini API response
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0]) {
      return { 
        explanation: data.candidates[0].content.parts[0].text 
      };
    }
    
    // If we couldn't extract the explanation, fall back to our mock explanations
    return getFallbackExplanation(errorMessage);
  } catch (error) {
    console.error("Error explaining code:", error);
    return getFallbackExplanation(errorMessage);
  }
};

// Fallback explanations if the Gemini API call fails
function getFallbackExplanation(errorMessage: string): ExplanationResponse {
  if (errorMessage.includes("ZeroDivisionError")) {
    return {
      explanation: `
## Division by Zero Error

**What happened:**
You tried to divide a number by zero, which is mathematically undefined.

**Why it's a problem:**
In mathematics, division by zero doesn't have a defined result, so Python raises an error when you try to do this.

**How to fix it:**
1. Check if your divisor could be zero
2. Add a condition to handle the zero case separately

**Example solution:**
\`\`\`python
# Instead of directly dividing
if divisor != 0:
    result = numerator / divisor
else:
    result = "Cannot divide by zero"
\`\`\`
      `
    };
  }

  if (errorMessage.includes("NameError")) {
    return {
      explanation: `
## Name Error

**What happened:**
You're trying to use a variable that hasn't been defined yet.

**Why it's a problem:**
Python can only work with variables after you've created them and given them a value.

**How to fix it:**
1. Check for typos in your variable names
2. Make sure you define variables before using them
3. Verify variable scope (where the variable is accessible)

**Example solution:**
\`\`\`python
# First define the variable
my_variable = 10

# Then use it
print(my_variable)
\`\`\`
      `
    };
  }

  // Generic explanation for any other error
  return {
    explanation: `
## Error Analysis

**What happened:**
Your code encountered an error: \`${errorMessage}\`

**Why it's a problem:**
This error prevents your program from executing correctly.

**How to fix it:**
1. Look at the line number mentioned in the error
2. Check the syntax and logic around that area
3. Verify that all variables are properly defined
4. Ensure correct data types are being used

**Debugging tips:**
- Add print statements to track variable values
- Break complex operations into smaller steps
- Review Python documentation for correct syntax
    `
  };
}

// This is a direct implementation of the Gemini API call that matches the Python code provided
export const callGeminiAPI = async (errorText: string): Promise<string> => {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCh6LWNx8l1mDMB61zQEWAX6nk8pm6ZdLc",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: `Explain this Python error in simple terms:\n\n${errorText}` }
              ]
            }
          ]
        }),
      }
    );

    const data = await response.json();
    
    // Extract the explanation text from the Gemini API response
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    }
    
    return "Sorry, I couldn't generate an explanation for this error.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "An error occurred while trying to explain the error. Please try again.";
  }
};
