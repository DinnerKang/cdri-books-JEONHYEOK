import React from 'react';
import cn from 'classnames';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className,
  onClick,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(styles.button, styles[`${variant}`], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
