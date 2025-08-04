import React from 'react';
import { FiX } from 'react-icons/fi';

interface IconButtonProps {
  onClick?: () => void;
  className?: string;
  size?: number;
  title?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  className = '',
  size = 18,
  title = 'Cerrar',
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`size-8 bg-zinc-300 dark:bg-zinc-700 
        text-zinc-800 dark:text-zinc-200 rounded-full 
        flex items-center justify-center shadow cursor-pointer ${className}`}
    >
      <FiX size={size} />
    </button>
  );
};

export default IconButton;
