import React, { useState, useRef, useEffect } from 'react';
import cn from 'classnames';
import ArrowDownIcon from '@/assets/icons/arrow_down.svg';
import styles from './Select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={selectRef}
      className={cn(styles.select, className, {
        [styles.open]: isOpen,
      })}
    >
      <div className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles.value}>
          {options.find(option => option.value === value)?.label}
        </span>
        <img className={styles.arrow} src={ArrowDownIcon} alt="선택하기" />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {options.map(option => (
            <div
              key={option.value}
              className={cn(styles.option, {
                [styles.selected]: option.value === value,
              })}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
