// src/content-script/find.tsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import SearchButton from './SearchButton.tsx';
import NotesModal from './NotesModal.tsx';

console.log("item Finder Content Script Loaded!");
console.log("finding if we have logged in or not?")

const currUrl = window.location.href;
const loginUrl = 'https://cses.fi/login';
let need= true;
const darkcolor= '#181818';
if (currUrl === loginUrl) {
    console.log("we are on login Page!");
    need=false;
    // Retrieve credentials asynchronously
    chrome.storage.local.get(['username', 'pwd', 'mode']).then((items) => {   
        const myUsername = items.username;
        const myPws = items.pwd;
        const mode= items.mode;
        console.log(document.body.style.backgroundColor.toString());
        if (mode==='d' && document.body.style.backgroundColor.toString()!= darkcolor){
          const modebtn= document.querySelector('a[href="/darkmode"]');
          (modebtn as HTMLAnchorElement)!.click();
        }
        console.log("username from extension storage: " + myUsername);
        console.log("pwd from extension storage: " + myPws);

        const username = document.getElementById('nick');
        const pwd = document.querySelector('input[name="pass"]');

        if (username && pwd && myUsername && myPws && 'value' in username) {
            (username as HTMLInputElement).value = myUsername;
            (pwd as HTMLInputElement).value = myPws;
            
            console.log("submitting the username and password");
            const submitbtn = document.querySelector('input[type="submit"]');
            
            if (submitbtn && 'click' in submitbtn) {
                // Ensure you only click after setting the values
                (submitbtn as HTMLElement).click();
            }
        }
    }).catch(error => {
        console.error("Error retrieving from storage:", error);
    });
}

const login= document.querySelector('a[href="/login"]');
if (need && login && login.innerHTML==='Login' &&'click' in login){
  console.log("we have not logged in yet!");
  need=false;
  (login as HTMLElement).click();
  console.log("redirected");
}
// Find the target <ul> with class "nav"
//maybe we should do regex instead but for now we'll let this one stay
if (window.location.href ==='https://cses.fi/problemset/list' ||
   window.location.href ==='https://cses.fi/problemset/list/' ||
   window.location.href ==='https://cses.fi/problemset/' ||
   window.location.href ==='https://cses.fi/problemset' 
){
  console.log(window.location.href);
  const targetUl = document.querySelector('ul.nav');
  if (targetUl) {
    console.log("Target <ul>.nav found, injecting React button.");

    const listItem = document.createElement('li');
    listItem.id = 'item-finder-root'; // Give it a unique ID for React to mount to

    targetUl.appendChild(listItem);

    const root = createRoot(listItem);
    root.render(
      <React.StrictMode>
        <SearchButton />
      </React.StrictMode>
    );
  }

  // Add notes functionality to problem list
  setTimeout(() => {
    addNotesIcons();
  }, 500);
}

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

//logic for copy button 
if (window.location.href.startsWith('https://cses.fi/problemset/task/')) {
  let allps= document.getElementsByTagName('p');
  for (const curr of allps){
    if (curr.innerText === 'Input:' || 
      curr.innerText === 'Output:'){
        curr.style.display= 'inline-block';
    }
  }
  document.querySelectorAll('pre').forEach((pre) => {
    const btn = document.createElement('button');

    btn.textContent = 'copy';
    btn.style.padding = '0.3em 0.6em';
    btn.style.width = 'fit-content';
    btn.style.fontSize = '0.8em';
    btn.style.height='fit-content';

    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(pre.innerText)
        .then(() => {
          btn.textContent = 'copied!';
          setTimeout(() => btn.textContent = 'copy', 2500);
        })
        .catch(err => {console.error('copy failed:', err); alert("error: "+err);});
    });

    pre.insertAdjacentElement('beforebegin', btn);
  });

  // Add notes button on individual task page
  setTimeout(() => {
    addNotesButtonToTaskPage();
  }, 500);
}

function addNotesButtonToTaskPage() {
  // Extract task ID from URL
  const match = window.location.pathname.match(/\/problemset\/task\/(\d+)/);
  if (!match) return;
  
  const taskId = match[1];
  const taskNameElement = document.querySelector('h1');
  const taskName = taskNameElement?.textContent?.trim() || 'Task ' + taskId;
  
  // Check if button already exists
  if (document.getElementById('task-notes-button')) return;
  
  // Find a good place to add the button (after the h1)
  if (taskNameElement) {
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'task-notes-button';
    buttonContainer.style.marginTop = '10px';
    buttonContainer.style.marginBottom = '10px';
    
    const button = document.createElement('button');
    button.textContent = '📝 View/Edit Notes';
    button.style.padding = '8px 16px';
    button.style.fontSize = '0.9rem';
    button.style.cursor = 'pointer';
    button.style.borderRadius = '4px';
    button.style.border = '1px solid rgba(128, 128, 128, 0.3)';
    
    // Check if notes exist and update button text
    chrome.storage.local.get([`notes_${taskId}`]).then((result) => {
      if (result[`notes_${taskId}`] && result[`notes_${taskId}`].trim()) {
        button.textContent = '📝 View/Edit Notes (saved)';
      }
    });
    
    button.addEventListener('click', () => {
      openNotesModal(taskId, taskName);
    });
    
    buttonContainer.appendChild(button);
    taskNameElement.insertAdjacentElement('afterend', buttonContainer);
  }
}