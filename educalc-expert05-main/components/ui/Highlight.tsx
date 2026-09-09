import React from 'react';

interface HighlightProps {
  text: string;
  highlight: string;
}

const Highlight: React.FC<HighlightProps> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <>{text}</>;
  }
  
  try {
    // Escape regex special characters in the highlight string
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="font-bold text-indigo-300 bg-indigo-500/10 rounded-sm">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  } catch (error) {
    console.error("Regex error in Highlight component:", error);
    return <>{text}</>; // Fallback on regex error
  }
};

export default Highlight;