import React from 'react';
import cn from 'classnames';
import styles from './Input.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return <input className={cn(styles.input, className)} {...props} />;
};

export default Input;
