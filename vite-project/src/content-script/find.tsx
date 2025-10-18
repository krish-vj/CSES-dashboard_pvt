// src/content-script/main.tsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import SearchButton from './SearchButton.tsx';
import { setupTextBoxSubmission } from './submitTextBox';
import CategoryStatsButton from './CategoryStatsButton.tsx';

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
setTimeout(() => {
    const h2Elements = document.querySelectorAll('h2');
    
    h2Elements.forEach((h2, index) => {
      if (index!=0){
      // Find the next task-list element after this h2
      let nextElement = h2.nextElementSibling;
      let taskList: Element | null = null;
      
      // Search for the ul.task-list that follows this h2
      while (nextElement) {
        if (nextElement.classList.contains('task-list')) {
          taskList = nextElement;
          break;
        }
        nextElement = nextElement.nextElementSibling;
      }

      if (taskList) {
        // Make the h2 position relative so absolute positioning works inside it
        (h2 as HTMLElement).style.position = 'relative';
        
        // Get the width of the task list to match it
        const taskListWidth = (taskList as HTMLElement).offsetWidth;
        (h2 as HTMLElement).style.width = `${taskListWidth}px`;
        
        // Create a span container for the React component
        const statsContainer = document.createElement('span');
        statsContainer.id = `category-stats-${index}`;
        
        // Append to the h2 element
        h2.appendChild(statsContainer);

        // Render the CategoryStatsButton
        const categoryRoot = createRoot(statsContainer);
        categoryRoot.render(
          <React.StrictMode>
            <CategoryStatsButton 
              taskListElement={taskList}
            />
          </React.StrictMode>
        );
        
      }}
    });
  }, 500);
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

}

// logic for submit via text
if (window.location.href.startsWith('https://cses.fi/problemset/submit/')) {
  // Find the form
  setupTextBoxSubmission();
}
//logic for copying code
if (window.location.href.startsWith('https://cses.fi/problemset/result')){
  const codeText = document.querySelector("pre")!.innerText;
  
    const header = document.querySelector("h3.caption.close-trigger");
        const btn = document.createElement("button");
        btn.textContent = 'copy';
        btn.style.padding = '0.3em 0.6em';
        btn.style.margin= '0.3em 0.6em';
        btn.style.width = 'fit-content';
        btn.style.fontSize = '0.8em';
        btn.style.height='fit-content';
        btn.addEventListener("click", () => {
 
            if (codeText) {
                navigator.clipboard.writeText(codeText).then(() => {
                    btn.textContent = "copied!";
                    setTimeout(() => btn.textContent = "copy", 1500);
                }).catch(err => {
                    console.error("Failed to copy text: ", err);
                });
            }
        });

        // Insert the button after the header
        header!.appendChild(btn);
    



  }
