// src/content-script/main.tsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import SearchButton from './SearchButton.tsx';

console.log("Ramen Finder Content Script Loaded!");
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

if (window.location.href.startsWith('https://cses.fi/problemset/')){
  console.log("we are inside the problem set");
const targetUl = document.querySelector('ul.nav');

if (targetUl) {
  console.log("Target <ul>.nav found, injecting React button.");

  // Create a new <li> element
  const listItem = document.createElement('li');
  listItem.id = 'ramen-finder-root'; // Give it a unique ID for React to mount to


  // Append the <li> to the <ul>
  targetUl.appendChild(listItem);

  // Mount the React component into the <li>
  const root = createRoot(listItem);
  root.render(
    <React.StrictMode>
      <SearchButton />
    </React.StrictMode>
  );
} else {
  console.warn("Target <ul> with class 'nav' not found on this page. Button not injected.");
} 
}