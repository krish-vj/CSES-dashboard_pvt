// src/content-script/SearchButton.tsx

import React, { useState } from 'react';

const SearchButton: React.FC = () => {
  const [solvedCount, setSolvedCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [attCount, setAttCount] = useState<number | null>(null);
  const solved = "task-score icon full"; // The word we are looking for
  const total= "problemset/task";
  const attemp= "task-score icon zero";
  const findRamenOccurrences = () => {
    let solc = 0; let totalc=0; let attmpc=0;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ALL, // Look at all nodes
      null // No custom filter function
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      // Check node name (e.g., tag names, class names, IDs)
      if (currentNode.nodeName.toLowerCase().includes(solved)) {
       solc++;
      }
      
      // Check attributes (class, id, href, src, data-* etc.)
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as Element;
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          if (attr.value.toLowerCase().includes(solved)) {
           solc++;
          }
          if (attr.value.toLowerCase().includes(total)){
            totalc++;
          }
          if (attr.value.toLowerCase().includes(attemp)){
            attmpc++;
          }
        }
      }

      // Check text content (if it's a text node or contains text)
      if (currentNode.nodeType === Node.TEXT_NODE && currentNode.textContent) {
        const text = currentNode.textContent.toLowerCase();
        // Use a regex to find all occurrences, not just one per node
        const matches = text.match(new RegExp(solved, 'g'));
        if (matches) {
         solc += matches.length;
        }
      }

      currentNode = walker.nextNode();
    }
    setAttCount(attmpc);
    setTotalCount(totalc);
    setSolvedCount(solc);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <button
        onClick={findRamenOccurrences}
        style={{ //style copied from that cses 
          textTransform: 'uppercase',
        fontSize: '0.88rem',
        textDecoration: 'none',
        color: '#5cafff',
        padding: '3px 9.6px',
        outline: 'none',
        }}
      >
        MyStats:
      </button>
      {solvedCount !== null && (
        <span
          style={{
            marginLeft: '5px',
            fontWeight: 'bold',
            color: solvedCount > 0 ? 'green' : 'red',
            fontSize: '14px'
          }}
        >
          SOLVED: {solvedCount} <div style={{color: 'red'}}>WRONG: {attCount}</div> <div style={{color: 'blue'}}>TOTAL: {totalCount}  </div>
        </span>
      )}
    </div>
  );
};

export default SearchButton;