// src/content-script/SortButton.tsx

import React, { useState, useRef, useEffect } from 'react';

interface Problem {
  element: HTMLElement;
  name: string;
  solved: number;
  total: number;
  percentage: number;
  originalIndex: number;
}

type SortType = 'default' | 'solvers' | 'percentage';

interface SortButtonProps {
  taskListElement: Element;
}

const SortButton: React.FC<SortButtonProps> = ({ taskListElement }) => {
  const [sortType, setSortType] = useState<SortType>('default');
  const [showMenu, setShowMenu] = useState(false);
  const originalOrderRef = useRef<Problem[]>([]);

  // Store the original order on mount
  useEffect(() => {
    if (originalOrderRef.current.length === 0) {
      originalOrderRef.current = parseProblems(taskListElement);
    }
  }, [taskListElement]);

  const parseProblems = (ul: Element): Problem[] => {
    const problems: Problem[] = [];
    const listItems = ul.querySelectorAll('li.task');
    
    listItems.forEach((li, index) => {
      const detailSpan = li.querySelector('.detail');
      if (detailSpan) {
        const text = detailSpan.textContent?.trim() || '';
        const match = text.match(/(\d+)\s*\/\s*(\d+)/);
        
        if (match) {
          const solved = parseInt(match[1]);
          const total = parseInt(match[2]);
          const percentage = total > 0 ? (solved / total) * 100 : 0;
          
          problems.push({
            element: li as HTMLElement,
            name: li.querySelector('a')?.textContent || '',
            solved,
            total,
            percentage,
            originalIndex: index
          });
        }
      }
    });
    
    return problems;
  };

  const sortProblems = (problems: Problem[], type: SortType): Problem[] => {
    const sorted = [...problems];
    
    switch (type) {
      case 'solvers':
        return sorted.sort((a, b) => b.solved - a.solved);
      
      case 'percentage':
        return sorted.sort((a, b) => b.percentage - a.percentage);
      
      case 'default':
      default:
        return sorted.sort((a, b) => a.originalIndex - b.originalIndex);
    }
  };

  const applySorting = (type: SortType) => {
    // Use the stored original order for sorting
    const problems = type === 'default' ? originalOrderRef.current : parseProblems(taskListElement);
    const sortedProblems = sortProblems(problems, type);
    
    // Clear and re-append in sorted order
    sortedProblems.forEach(problem => {
      taskListElement.appendChild(problem.element);
    });
    
    setSortType(type);
    setShowMenu(false);
  };

  const getSortIcon = () => {
    switch (sortType) {
      case 'solvers':
        return '👥';
      case 'percentage':
        return '%';
      case 'default':
      default:
        return '#';
    }
  };

  return (
    <span style={{ 
      position: 'relative', 
      display: 'inline-block',
      marginLeft: '12px',
      marginRight: '8px'
    }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 8px',
          border: '1px solid #888',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 'normal',
          outline: 'none',
          transition: 'all 0.2s',
        }}
 
        title="Sort problems"
      >
        Sort {getSortIcon()}
      </button>

      {showMenu && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
            }}
            onClick={() => setShowMenu(false)}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '100%',
              marginTop: '8px',
              width: '200px',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 9999,
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '4px 0' }}>
              <button
                onClick={() => applySorting('default')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  fontWeight: sortType === 'default' ? 500 : 400,
                }}
                
              >
                {/* <span style={{ fontSize: '16px' }}>#</span> */}
                <span>Default Order #</span>
              </button>

              <button
                onClick={() => applySorting('solvers')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  fontWeight: sortType === 'solvers' ? 500 : 400,
                }}

              >
                <span>Number of Solvers 👥</span>
              </button>

              <button
                onClick={() => applySorting('percentage')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  fontWeight: sortType === 'percentage' ? 500 : 400,
                }}

              >
                {/* <span style={{ fontSize: '16px' }}>%</span> */}
                <span>Acceptance Rate %</span>
              </button>
            </div>
          </div>
        </>
      )}
    </span>
  );
};

export default SortButton;