
import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  className = "" 
}) => {
  return (
    <div 
      className={`rich-text-display prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextDisplay;
