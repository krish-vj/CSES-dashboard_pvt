// Add this to your content script where the submit page logic is


// Function to create the text area for code input
function createCodeInputArea(): void {
  const codeInputArea = document.createElement("textarea");
  codeInputArea.id = "code";
  codeInputArea.style.width = "500px";
  codeInputArea.style.height = "300px";
  codeInputArea.placeholder = "Paste your code here...";
  
  const form = document.querySelector("form");
  if (!form) return;
  
  // Insert before the submit button paragraph
  const submitParagraph = form.querySelector('input[type="submit"]')?.parentElement;
  if (submitParagraph) {
    form.insertBefore(codeInputArea, submitParagraph);
  }
}

// Function to submit code file
function submitCodeFile(fileData: File | Blob): void {
  const formData = new FormData();
  const languageSelector = document.getElementById("lang") as HTMLSelectElement | null;
  const languageOption = document.getElementById("option") as HTMLSelectElement | null;
  const csrfTokenInput = document.querySelector("input[name='csrf_token']") as HTMLInputElement | null;
  const taskInput = document.querySelector("input[name='task']") as HTMLInputElement | null;
  
  if (!languageSelector || !csrfTokenInput || !taskInput) {
    console.error("Required form elements not found");
    return;
  }
  
  formData.append('csrf_token', csrfTokenInput.value);
  formData.append('task', taskInput.value);
  formData.append('lang', languageSelector.value);
  
  if (languageOption && !languageOption.disabled) {
    formData.append('option', languageOption.value);
  }
  
  formData.append('target', 'problemset');
  formData.append('type', 'course');
  
  // Determine file extension based on language
  const extension = getFileExtension(languageSelector.value);
  formData.append('file', fileData, `code${extension}`);
  
  fetch('/course/send.php', {
    method: 'POST',
    body: formData
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = response.url;
      } else {
        console.error('Submission failed:', response.statusText);
      }
    })
    .catch((error) => {
      console.error('Error submitting code:', error);
    });
}

// Helper function to get file extension based on language
function getFileExtension(language: string): string {
  const extensions: { [key: string]: string } = {
    'Assembly': '.asm',
    'C': '.c',
    'C++': '.cpp',
    'Haskell': '.hs',
    'Java': '.java',
    'Make': '.zip',
    'Node.js': '.js',
    'Pascal': '.pas',
    'Python2': '.py',
    'Python3': '.py',
    'Ruby': '.rb',
    'Rust': '.rs',
    'Scala': '.scala'
  };
  return extensions[language] || '.txt';
}

// Function to modify submit button behavior
function modifySubmitButton(): void {
  const submitButton = document.querySelector("input[type='submit']") as HTMLInputElement | null;
  
  if (!submitButton) return;
  
  submitButton.addEventListener("click", (event: MouseEvent) => {
    const codeTextarea = document.getElementById("code") as HTMLTextAreaElement | null;
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement | null;
    
    if (!codeTextarea) return;
    
    const code = codeTextarea.value.trim();
    
    if (code === "") {
      // If no code in textarea, use file input (default behavior)
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        event.preventDefault();
        submitCodeFile(fileInput.files[0]);
      }
      // Otherwise let the form submit normally
      return;
    }
    
    // Submit code from textarea
    event.preventDefault();
    submitCodeFile(new Blob([code], { type: 'text/plain' }));
  });
}

// Function to load language selector from cache
function loadLanguageSelectorCache(): void {
  const languageSelector = document.getElementById("lang") as HTMLSelectElement | null;
  const languageOption = document.getElementById("option") as HTMLSelectElement | null;
  
  if (!languageSelector) return;
  
  chrome.storage.local.get(["language", "option"]).then((result) => {
    setTimeout(() => {
      if (result.language) {
        languageSelector.value = result.language;
      }
      languageSelector.dispatchEvent(new Event('change'));
      
      setTimeout(() => {
        if (result.option && languageOption) {
          languageOption.value = result.option;
        }
        languageSelector.dispatchEvent(new Event('change'));
      }, 300);
    }, 300);
  });
}

// Function to create language selector cache
function createLanguageSelectorCache(): void {
  const languageSelector = document.getElementById("lang") as HTMLSelectElement | null;
  const languageOption = document.getElementById("option") as HTMLSelectElement | null;
  
  if (!languageSelector) return;
  
  languageSelector.addEventListener("change", () => {
    chrome.storage.local.set({ language: languageSelector.value });
  });
  
  if (languageOption) {
    languageOption.addEventListener("change", () => {
      chrome.storage.local.set({ option: languageOption.value });
    });
  }
}

// Main function to set up the text box submission feature
function setupTextBoxSubmission(): void {
  loadLanguageSelectorCache();
  createLanguageSelectorCache();
  createCodeInputArea();
  modifySubmitButton();
}

// ========================================
// Integration with your main.tsx
// ========================================

// Replace the addTextBox() and submit logic in your main.tsx with:

// function addTextBox(){
//   setupTextBoxSubmission();
// }

// logic for submit via text
// if (window.location.href.startsWith('https://cses.fi/problemset/submit/')) {
//   setupTextBoxSubmission();
// }

export { setupTextBoxSubmission };