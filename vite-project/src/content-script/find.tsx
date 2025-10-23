
import React from 'react';
import { createRoot } from 'react-dom/client';
import SearchButton from './SearchButton.tsx';
import { setupTextBoxSubmission } from './submitTextBox';
import CategoryStatsButton from './CategoryStatsButton.tsx';
import SortButton from './SortButton.tsx';
import NotesModal from './NotesModal.tsx';

// Define the shape of your settings for clarity and type safety
interface Settings {
  tagsEnabled: boolean;
  timeEnabled: boolean;
  notesEnabled: boolean;
  hintsEnabled: boolean;
  globalStatsEnabled: boolean;
  categoryStatsEnabled: boolean;
  sortEnabled: boolean;
  autoLoginEnabled: boolean;
  autoModeEnabled: boolean;
  submitByTextEnabled: boolean;
  username: string;
  pwd: string;
  mode: string;
  
}
function extractProblemId(url: string) {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? match[1] : null;
}
function createCollapsibleSection(title: string, items: string[]) {
  const section = document.createElement('div');
  section.style.marginTop = '10px';

  const header = document.createElement('h4');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.cursor = 'pointer';
  header.innerHTML = `${title} <span style="margin-left:5px;">▼</span>`;

  const content = document.createElement('div');
  content.style.display = 'none';
  content.style.marginLeft = '10px';

  if (Array.isArray(items)) {
    content.innerHTML = items.map(x => `<div>• ${x}</div>`).join('');
  } else {
    content.innerText = items;
  }

  // Toggle visibility on click
  header.addEventListener('click', () => {
    const isVisible = content.style.display === 'block';
    content.style.display = isVisible ? 'none' : 'block';
    header.querySelector('span')!.textContent = isVisible ? '▼' : '▲';
  });

  const hr = document.createElement('hr');
  section.appendChild(hr);
  section.appendChild(header);
  section.appendChild(content);

  return section;
}
interface ProblemInfo {
  tags?: string[];
  time?: string[];
  hints?: string[];
}
const problemData: Record<string, ProblemInfo> = {
  "1671": {
    tags: ["graph-theory", "shortest-path", "basic-math"],
    time: ["O((n+m)log(n))"],
    hints: ["Use Dijkstra's Algorithm", "Implement with a priority queue"]
  }
};
const currUrl = window.location.href;
const loginUrl = 'https://cses.fi/login';


// Default settings based on your initial storage setup, for fallback
const DEFAULT_SETTINGS: Settings = {
  tagsEnabled: true,
  timeEnabled: true,
  notesEnabled: true,
  hintsEnabled: true,
  globalStatsEnabled: true,
  categoryStatsEnabled: true,
  sortEnabled: true,
  autoLoginEnabled: false,
  autoModeEnabled: false,
  submitByTextEnabled: true,
  username: '',
  pwd: '',
  mode: 'd',
  
};

function addNotesIcons() {
  // Find all task links
  const taskLinks = document.querySelectorAll('a[href^="/problemset/task/"]');
  
  taskLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Extract task ID from href
    const taskId = href.replace('/problemset/task/', '');
    const taskName = link.textContent?.trim() || 'Unknown Task';
    
    // Check if pencil icon already exists
    const parent = link.parentElement;
    if (!parent || parent.querySelector('.notes-icon-wrapper')) return;
    
    // Create wrapper for the icon
    const iconWrapper = document.createElement('span');
    iconWrapper.className = 'notes-icon-wrapper';
    iconWrapper.style.marginLeft = '8px';
    iconWrapper.style.display = 'inline-block';
    iconWrapper.style.cursor = 'pointer';
    iconWrapper.style.opacity = '0.6';
    iconWrapper.style.transition = 'opacity 0.2s';
    
    // Create pencil icon (using unicode character)
    iconWrapper.innerHTML = '✏️';
    iconWrapper.title = 'Add/Edit notes';
    
    iconWrapper.addEventListener('mouseenter', () => {
      iconWrapper.style.opacity = '1';
    });
    
    iconWrapper.addEventListener('mouseleave', () => {
      iconWrapper.style.opacity = '0.6';
    });
    
    // Check if there are existing notes and show indicator
    chrome.storage.local.get([`notes_${taskId}`]).then((result) => {
      if (result[`notes_${taskId}`] && result[`notes_${taskId}`].trim()) {
        iconWrapper.style.opacity = '1';
        iconWrapper.style.filter = 'brightness(1.2)';
      }
    });
    
    iconWrapper.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openNotesModal(taskId, taskName);
    });
    
    // Insert after the link
    link.insertAdjacentElement('afterend', iconWrapper);
  });
}

function openNotesModal(taskId: string, taskName: string) {
  // Create modal container if it doesn't exist
  let modalContainer = document.getElementById('cses-notes-modal-root');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'cses-notes-modal-root';
    document.body.appendChild(modalContainer);
  }
  
  // Create root and render modal
  const root = createRoot(modalContainer);
  
  const handleClose = () => {
    root.unmount();
    // Re-add icons to update the indicator
    addNotesIcons();
  };
  
  root.render(
    <React.StrictMode>
      <NotesModal 
        taskId={taskId} 
        taskName={taskName} 
        isOpen={true} 
        onClose={handleClose} 
      />
    </React.StrictMode>
  );
}


// Keys to fetch from storage
const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];

/**
 * Fetches settings from chrome.storage.local and applies default values.
 * @returns A promise that resolves with the complete settings object.
 */
async function getSettings(): Promise<Settings> {
  if (chrome.storage && chrome.storage.local) {
    try {
      const items = await chrome.storage.local.get(SETTING_KEYS);
      
      // Map the retrieved items, applying fallbacks (coalescing operator `??`)
      return {
        tagsEnabled: items.tagsEnabled ?? DEFAULT_SETTINGS.tagsEnabled,
        timeEnabled: items.timeEnabled ?? DEFAULT_SETTINGS.timeEnabled,
        notesEnabled: items.notesEnabled?? DEFAULT_SETTINGS.notesEnabled,
        hintsEnabled: items.hintsEnabled ?? DEFAULT_SETTINGS.hintsEnabled,
        globalStatsEnabled: items.globalStatsEnabled ?? DEFAULT_SETTINGS.globalStatsEnabled,
        categoryStatsEnabled: items.categoryStatsEnabled ?? DEFAULT_SETTINGS.categoryStatsEnabled,
        sortEnabled: items.sortEnabled ?? DEFAULT_SETTINGS.sortEnabled,
        autoLoginEnabled: items.autoLoginEnabled ?? DEFAULT_SETTINGS.autoLoginEnabled,
        autoModeEnabled: items.autoModeEnabled ?? DEFAULT_SETTINGS.autoModeEnabled,
        submitByTextEnabled: items.submitByTextEnabled ?? DEFAULT_SETTINGS.submitByTextEnabled,
        // For strings, use `|| ''` or `|| DEFAULT_SETTINGS.username` if you want to explicitly handle empty string vs undefined
        username: items.username || DEFAULT_SETTINGS.username, 
        pwd: items.pwd || DEFAULT_SETTINGS.pwd, 
        mode: items.mode || DEFAULT_SETTINGS.mode,
       
      };
    } catch (error) {
      console.error("Error retrieving settings from storage, using defaults:", error);
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

/**
 * Main logic function, executes after settings are loaded.
 */
async function main() {
  const settings = await getSettings();
  
  let need = true; // Flag to check if we should try to navigate to login

  // --- Auto Login and Dark Mode Logic ---

  if (currUrl === loginUrl) {
    // //console.log("We are on the login page.");
    need = false;

    // Auto Dark Mode


    // Auto Login
    if (settings.autoLoginEnabled && settings.username && settings.pwd) {
      // //console.log("Attempting auto-login.");
      const usernameInput = document.getElementById('nick');
      const pwdInput = document.querySelector('input[name="pass"]');

      if (usernameInput && pwdInput && 'value' in usernameInput && 'value' in pwdInput) {
        (usernameInput as HTMLInputElement).value = settings.username;
        (pwdInput as HTMLInputElement).value = settings.pwd;

        const submitbtn = document.querySelector('input[type="submit"]');

        if (submitbtn && 'click' in submitbtn) {
          (submitbtn as HTMLElement).click();
          // //console.log("Submitted credentials for auto-login.");
        }
      }
    }

  }

  // --- Auto Navigate to Login ---
  
  const login = document.querySelector('a[href="/login"]');
  // Check if we haven't handled login on the login page, the button exists, and it says 'Login'
  if (need && login && login.innerHTML === 'Login' && 'click' in login) {
    //console.log("Not logged in, navigating to login page.");
    need = false;
    // Only auto-click if auto-login is enabled, otherwise, let the user manually click.
    if (settings.autoLoginEnabled) { 
        (login as HTMLElement).click();
        //console.log("Redirected to login page for auto-login.");
    }
  }

if (settings.autoModeEnabled) {
    const darkColorRgb = 'rgb(24, 24, 24)';
  
    const currentBgColor = window.getComputedStyle(document.body).backgroundColor;
    
    const isCurrentlyDark = currentBgColor === darkColorRgb;
    const isDesiredDark = settings.mode === 'd';

    // //console.log(`AutoMode: Desired dark? ${isDesiredDark}, Currently dark? ${isCurrentlyDark} (color: ${currentBgColor})`);

    // If the desired state and current state don't match, click the button
    if (isDesiredDark !== isCurrentlyDark) {
        const modebtn = document.querySelector('a[href="/darkmode"]');
        if (modebtn) {
            //console.log("AutoMode: Mismatch detected, clicking mode switch button.");
            (modebtn as HTMLAnchorElement).click();
        } else {
            console.log("AutoMode: Mismatch detected, but couldn't find mode switch button.");
        }
    }
}

  // --- Problemset List Enhancements (Search, Sort, Category Stats) ---

  const isProblemsetList = currUrl === 'https://cses.fi/problemset/list' ||
    currUrl === 'https://cses.fi/problemset/list/' ||
    currUrl === 'https://cses.fi/problemset/' ||
    currUrl === 'https://cses.fi/problemset';

  if (isProblemsetList) {
    //console.log(`On problemset list page. Settings: tagsEnabled=${settings.tagsEnabled}, sortEnabled=${settings.sortEnabled}, categoryStatsEnabled=${settings.categoryStatsEnabled}.`);
    
    
    if (settings.globalStatsEnabled) {
      const targetUl = document.querySelector('ul.nav');
      if (targetUl) {
        const listItem = document.createElement('li');
        listItem.id = 'item-finder-root';
        targetUl.appendChild(listItem);
        const root = createRoot(listItem);
        root.render(
          <React.StrictMode>
            <SearchButton />
          </React.StrictMode>
        );
      }
    }
    
    // Inject Category Stats and Sort Buttons
    if (settings.categoryStatsEnabled || settings.sortEnabled || settings.notesEnabled) {
      // Use a timeout to ensure all DOM elements are fully rendered/settled
      setTimeout(() => {

    if (settings.notesEnabled){
    addNotesIcons();}
    


        const h2Elements = document.querySelectorAll('h2');

        h2Elements.forEach((h2, index) => {
          if (index !== 0) {
            let nextElement = h2.nextElementSibling;
            let taskList: Element | null = null;

            while (nextElement) {
              if (nextElement.classList.contains('task-list')) {
                taskList = nextElement;
                break;
              }
              nextElement = nextElement.nextElementSibling;
            }

            if (taskList) {
              (h2 as HTMLElement).style.position = 'relative';
              const taskListWidth = (taskList as HTMLElement).offsetWidth;
              (h2 as HTMLElement).style.width = `${taskListWidth}px`;

              // Sort Button Logic
              if (settings.sortEnabled) {
                const sortContainer = document.createElement('span');
                sortContainer.id = `category-sort-${index}`;
                sortContainer.style.display = 'inline-block';
                h2.appendChild(sortContainer);
                const sortRoot = createRoot(sortContainer);
                sortRoot.render(
                  <React.StrictMode>
                    <SortButton taskListElement={taskList} />
                  </React.StrictMode>
                );
              }

              // Category Stats Button Logic
              if (settings.categoryStatsEnabled) {
                const statsContainer = document.createElement('span');
                statsContainer.id = `category-stats-${index}`;
                h2.appendChild(statsContainer);
                const statsRoot = createRoot(statsContainer);
                statsRoot.render(
                  <React.StrictMode>
                    <CategoryStatsButton taskListElement={taskList} />
                  </React.StrictMode>
                );
              }
            }
          }
        });
      }, 350);
    }
  }


  const problemId=extractProblemId(currUrl);
  if (currUrl.startsWith('https://cses.fi/problemset/') && problemId) {
  const sidebar = document.querySelector('div.nav.sidebar');
  if (sidebar) {
    const data = problemData[problemId] || {};

    // TAGS
    if (settings.tagsEnabled) {
      let section;
      if (data.tags) section = createCollapsibleSection('Tags', data.tags);
      else section = createCollapsibleSection('Tags', ['Will upload tags if there is sufficient demand.']);
      sidebar.appendChild(section);
    }

    // HINTS
    if (settings.hintsEnabled) {
      let section;
      if (data.hints) section = createCollapsibleSection('Hints', data.hints);
      else section = createCollapsibleSection('Hints', ['Will upload hints if there is sufficient demand.']);
      sidebar.appendChild(section);
    }

    // TIME COMPLEXITY
    if (settings.timeEnabled) {
      let section;
      if (data.time) section = createCollapsibleSection('Time Complexity', data.time);
      else section = createCollapsibleSection('Time Complexity', ['Will upload time complexity if there is sufficient demand.']);
      sidebar.appendChild(section);
    }
  }
}

  // --- Copy Button Logic on Problem/Task Page ---

  if (currUrl.startsWith('https://cses.fi/problemset/task/')) {
    // Styling for 'Input:' / 'Output:' headings
    let allps = document.getElementsByTagName('p');
    for (const curr of allps) {
      if (curr.innerText === 'Input:' || curr.innerText === 'Output:') {
        curr.style.display = 'inline-block';
      }
    }

    // Add Copy buttons to <pre> tags
    document.querySelectorAll('pre').forEach((pre) => {
      const btn = document.createElement('button');
      btn.textContent = 'copy';
      btn.style.padding = '0.3em 0.6em';
      btn.style.width = 'fit-content';
      btn.style.fontSize = '0.8em';
      btn.style.height = 'fit-content';

      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(pre.innerText)
          .then(() => {
            btn.textContent = 'copied!';
            setTimeout(() => btn.textContent = 'copy', 2500);
          })
          .catch(err => { console.error('copy failed:', err); alert("error: " + err); });
      });

      pre.insertAdjacentElement('beforebegin', btn);
    });
  }

  // --- Submit via Text Logic ---
  if (currUrl.startsWith('https://cses.fi/problemset/submit/')) {
    if (settings.submitByTextEnabled) {
        //console.log("Setting up text box submission.");
        setupTextBoxSubmission();
    }
  }
  
  // --- Copy Code from Result Page Logic ---
  if (currUrl.startsWith('https://cses.fi/problemset/result')) {
    const codePre = document.querySelector("pre");
    const header = document.querySelector("h3.caption.close-trigger");

    if (codePre && header) {
        const codeText = codePre.innerText;
        const btn = document.createElement("button");
        btn.textContent = 'copy';
        btn.style.padding = '0.3em 0.6em';
        btn.style.margin = '0.3em 0.6em';
        btn.style.width = 'fit-content';
        btn.style.fontSize = '0.8em';
        btn.style.height = 'fit-content';

        btn.addEventListener("click", () => {
            navigator.clipboard.writeText(codeText).then(() => {
                btn.textContent = "copied!";
                setTimeout(() => btn.textContent = "copy", 1500);
            }).catch(err => {
                console.error("Failed to copy text: ", err);
            });
        });

        // Insert the button after the header
        header.appendChild(btn);
    }
  }
}


main();