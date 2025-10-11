// src/content-script/main.tsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import SearchButton from './SearchButton.tsx';

console.log("Ramen Finder Content Script Loaded!");

// Find the target <ul> with class "nav"
const targetUl = document.querySelector('ul.nav');

if (targetUl) {
  console.log("Target <ul>.nav found, injecting React button.");

  // Create a new <li> element
  const listItem = document.createElement('li');
  listItem.id = 'ramen-finder-root'; // Give it a unique ID for React to mount to
  
  // Optional: Add some styling to the list item if desired
  // listItem.style.padding = '5px'; 
  // listItem.style.border = '1px solid #ccc';

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