import React, { useState, useEffect } from 'react';

interface CategoryStatsProps {
  taskListElement: Element;
}

const CategoryStatsButton: React.FC<CategoryStatsProps> = ({ taskListElement }) => {
  const [solvedCount, setSolvedCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  function calculateStats() {
    let solved = 0;
    
    // Get all task items in this category's task list
    const tasks = taskListElement.querySelectorAll('li.task');
    let total = tasks.length;
    
    tasks.forEach((task) => {
      const scoreIcon = task.querySelector('.task-score');
      
      if (scoreIcon) {
        const classNames = scoreIcon.className;
        if (classNames.includes('task-score icon full')) {
          solved++;
        }
      }
    });

    setSolvedCount(solved);
    setTotalCount(total);
  }

  useEffect(() => {
    calculateStats();
  }, [taskListElement]);
  
  return (
    <span
      style={{
        position: 'absolute',
        right: '0',
        fontSize: '0.9em',
        color: '#888',
        fontWeight: 'normal',
      }}
    >
      {solvedCount}/{totalCount}
    </span>
  );
};

export default CategoryStatsButton;