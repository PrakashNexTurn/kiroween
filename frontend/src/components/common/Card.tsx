import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  backgroundColor?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, backgroundColor, className = '', style, ...props }, ref) => {
    const baseStyles = 'rounded-lg border border-border p-6 transition-all duration-slow ease-out shadow-sm';
    const hoverStyles = hover ? 'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 cursor-pointer' : '';
    const bgStyles = backgroundColor ? '' : 'bg-background-primary';
    
    const combinedClassName = `${baseStyles} ${hoverStyles} ${bgStyles} ${className}`;
    const combinedStyle = backgroundColor ? { backgroundColor, ...style } : style;
    
    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={combinedStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
