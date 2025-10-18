// src/content-script/SearchButton.tsx

import React, { useState } from 'react';

const SearchButton: React.FC = () => {
  const [solvedCount, setSolvedCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [attCount, setAttCount] = useState<number | null>(null);
  const [visible, setVisible] = useState<boolean>(false); // Starts hidden
  const solved = "task-score icon full";
  const total = "problemset/task";
  const attemp = "task-score icon zero";

  const findRamenOccurrences = () => {
    // 1. **Toggle Visibility** state immediately
    setVisible((prevVisible) => !prevVisible); 

    // If counts haven't been calculated yet, calculate them.
    // We only calculate if the button is clicked, regardless of visibility.
    // To optimize, you might only calculate if solvedCount is null,
    // but for simplicity, we'll keep the calculation here to run on every click.
    if (solvedCount === null) {
        let solc = 0; let totalc = 0; let attmpc = 0;
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_ALL,
          null
        );

        let currentNode = walker.nextNode();
        while (currentNode) {
          // ... (Your counting logic remains the same)
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
              if (attr.value.toLowerCase().includes(total)) {
                totalc++;
              }
              if (attr.value.toLowerCase().includes(attemp)) {
                attmpc++;
              }
            }
          }

          // Check text content (if it's a text node or contains text)
          if (currentNode.nodeType === Node.TEXT_NODE && currentNode.textContent) {
            const text = currentNode.textContent.toLowerCase();
            const matches = text.match(new RegExp(solved, 'g'));
            if (matches) {
              solc += matches.length;
            }
          }
          // ... (end of counting logic)

          currentNode = walker.nextNode();
        }
        setAttCount(attmpc);
        setTotalCount(totalc);
        setSolvedCount(solc);
    }
  };

  // We are using a simple check here: if solvedCount is null,
  // the calculation hasn't run yet, so we only display the stats 
  // *after* the button has been clicked for the first time.
  const statsCalculated = solvedCount !== null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <button
        onClick={findRamenOccurrences}
        style={{
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
      
      {/* The stats container only renders after the first calculation.
        The visibility is controlled by the `visible` state using the 
        ternary operator inside the style attribute.
      */}
      {statsCalculated && (
        <div 
          style={{
            // 2. **Ternary Operator:** Set 'display' based on 'visible'
            display: visible ? 'block' : 'none', 
            // The rest of the styling can go here if you want to group them
            marginLeft: '5px',
            fontWeight: 'bold',
            fontSize: '14px',
            // Color logic for the overall block is omitted for simplicity, 
            // but can be added back if desired.
            color: solvedCount! > 0 ? 'green' : 'red',
          }}
        >
            {/* The individual stats */}
            <div>SOLVED: {solvedCount}</div>
            <div style={{ color: 'red' }}>WRONG: {attCount}</div>
            <div style={{ color: 'blue' }}>TOTAL: {totalCount}</div>
        </div>
      )}
    </div>
  );
};

export default SearchButton;