import React, { memo, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';



/* ======================================================
   CARD
====================================================== */

export const Card = memo(
  ({
    children,
    className = '',
    onClick,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => {
    const Comp: any = onClick ? 'button' : 'div';

    return (
      <Comp
        onClick={onClick}
        className={`bg-background-card border border-border-card rounded-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 ${
          onClick ? 'cursor-pointer hover:bg-background-cardHover' : ''
        } ${className}`}
      >
        {children}
      </Comp>
    );
  }
);



/* ======================================================
   BUTTON
====================================================== */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: LucideIcon;
}

export const Button = memo(
  ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    className = '',
    icon: Icon,
    ...props
  }: ButtonProps) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors rounded-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-primary hover:bg-primary-hover text-white shadow-glow-primary',
      success: 'bg-success text-black font-bold hover:bg-success-muted shadow-glow-success',
      secondary:
        'bg-background-tertiary hover:bg-background-cardHover text-white border border-border',
      danger: 'bg-danger hover:bg-danger-alt text-white',
      ghost: 'bg-transparent hover:bg-background-tertiary text-text-secondary hover:text-white',
      outline:
        'bg-transparent border border-border hover:border-text-secondary text-text-secondary hover:text-white',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        disabled={isLoading || props.disabled}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin mr-2 h-4 w-4 text-current" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          </svg>
        )}

        {!isLoading && Icon && <Icon size={size === 'sm' ? 14 : 18} className="mr-2" />}

        {children}
      </button>
    );
  }
);



/* ======================================================
   BADGE
====================================================== */

type Status =
  | 'ATIVA'
  | 'BLOQUEADA'
  | 'PAUSADA'
  | 'RECUPERADA'
  | 'CONTESTADA'
  | string;

export const Badge = memo(
  ({ status, count, children }: { status: Status; count?: number; children?: React.ReactNode }) => {
    const styles: Record<string, string> = {
      ATIVA: 'bg-success/10 text-success border-success/20',
      RECUPERADA: 'bg-recuperada/10 text-recuperada border-recuperada/20',
      PAUSADA: 'bg-warning/10 text-warning border-warning/20',
      BLOQUEADA: 'bg-danger/10 text-danger border-danger/20',
      CONTESTADA: 'bg-contestada/10 text-contestada border-contestada/20',
    };

    return (
      <span
        className={`px-2.5 py-0.5 rounded-badge text-xs font-bold uppercase tracking-wider border ${
          styles[status] || 'bg-gray-800 text-gray-400 border-gray-700'
        }`}
      >
        {children || status}
        {count ? ` (${count}x)` : ''}
      </span>
    );
  }
);



/* ======================================================
   MODAL (ESC close added)
====================================================== */

export const Modal = ({
  isOpen,
  onClose,
  children,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}) => {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-background-modal border border-border-card rounded-modal w-full max-w-lg p-6">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};
