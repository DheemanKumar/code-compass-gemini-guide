
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
      // Simulate successful execution
      const match = code.match(/print\(['"](.+)['"]\)/);
      if (match) {
        return { 
          success: true,
          output: match[1]
        };
      }
      
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
      
      // Generic success case
      return {
        success: true,
        output: "Program executed successfully!"
      };
    }
    
    // Simulate a syntax error for demo purposes
    return {
      success: false,
      error: "SyntaxError: Expected an indented block after function definition"
    };
    
  } catch (error) {
    console.error("Error executing code:", error);
    return {
      success: false,
      error: "An unexpected error occurred while executing the code."
    };
  }
};

// Simulated backend for getting AI explanations
export const explainError = async (errorMessage: string): Promise<ExplanationResponse> => {
  try {
    // In a real app, this would call the Gemini API
    // For demo purposes, we'll return predefined responses based on error types

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

    if (errorMessage.includes("SyntaxError")) {
      return {
        explanation: `
## Syntax Error

**What happened:**
Your code has a syntax mistake that Python cannot understand.

**Why it's a problem:**
Python has specific rules for how code must be written. When these rules are broken, Python can't interpret what you're trying to do.

**Common syntax issues:**
1. Missing parentheses or quotes
2. Incorrect indentation
3. Missing colons after if/for/while statements
4. Using a Python keyword incorrectly

**How to fix it:**
Look carefully at the line mentioned in the error message and check for:
- Matching pairs of parentheses, brackets, and quotes
- Proper indentation (especially after functions, loops, and conditionals)
- Required colons at the end of statements like if, for, while
- Correct spelling of function names and variables

**Example solution:**
\`\`\`python
# Incorrect: print(Hello World)
# Correct:
print("Hello World")
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
  } catch (error) {
    console.error("Error explaining code:", error);
    return {
      explanation: "An error occurred while trying to explain the error. Please try again."
    };
  }
};

// This would be an actual API call to the Gemini AI in a real implementation
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
