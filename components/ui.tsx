
import React from 'react';
import { LucideIcon } from 'lucide-react';

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-background-card border border-border-card rounded-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-background-cardHover' : ''} ${className}`}
  >
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: LucideIcon;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', isLoading, className = '', icon: Icon, ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors rounded-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-glow-primary",
    success: "bg-success text-black font-bold hover:bg-success-muted shadow-glow-success",
    secondary: "bg-background-tertiary hover:bg-background-cardHover text-white border border-border",
    danger: "bg-danger hover:bg-danger-alt text-white",
    ghost: "bg-transparent hover:bg-background-tertiary text-text-secondary hover:text-white",
    outline: "bg-transparent border border-border hover:border-text-secondary text-text-secondary hover:text-white",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon && !isLoading ? (
        <Icon size={size === 'sm' ? 14 : 18} className="mr-2" />
      ) : null}
      {children}
    </button>
  );
};

// --- Badge ---
// Fixed: Added children to props to allow custom labels while maintaining status-based styling
export const Badge: React.FC<{ status: string; count?: number; children?: React.ReactNode }> = ({ status, count, children }) => {
  const styles: Record<string, string> = {
    ATIVA: "bg-success/10 text-success border-success/20",
    ATIVO: "bg-success/10 text-success border-success/20",
    APROVADA: "bg-success/10 text-success border-success/20",
    RECUPERADA: "bg-recuperada/10 text-recuperada border-recuperada/20",
    PAUSADA: "bg-warning/10 text-warning border-warning/20",
    PAUSADO: "bg-warning/10 text-warning border-warning/20",
    EM_ANALISE: "bg-warning/10 text-warning border-warning/20",
    PENDENTE_DOCS: "bg-warning-alt/10 text-warning-alt border-warning-alt/20",
    BLOQUEADA: "bg-danger/10 text-danger border-danger/20",
    BLOQUEADO: "bg-danger/10 text-danger border-danger/20",
    REJEITADA: "bg-danger/10 text-danger border-danger/20",
    SUSPENSA: "bg-danger/10 text-danger border-danger/20",
    CONTESTADA: "bg-contestada/10 text-contestada border-contestada/20",
    T1: "bg-blue-500 text-white",
    T2: "bg-gray-600 text-white",
    T3: "bg-gray-700 text-gray-300",
    T4: "bg-gray-800 text-gray-400",
  };

  const defaultStyle = "bg-gray-800 text-gray-400 border-gray-700";
  const normalizedStatus = status ? status.toUpperCase() : 'UNKNOWN';

  return (
    <span className={`px-2.5 py-0.5 rounded-badge text-xs font-bold uppercase tracking-wider border ${styles[normalizedStatus] || defaultStyle}`}>
      {children || status} {count && count > 0 ? `(${count}X)` : ''}
    </span>
  );
};

// --- Metric Widget ---
export const MetricWidget: React.FC<{ 
  title: string; 
  value: string | number; 
  subtext?: React.ReactNode; 
  icon: LucideIcon; 
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}> = ({ title, value, subtext, icon: Icon, trend, color = "text-primary" }) => (
  <Card className="relative overflow-hidden group">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-1">{title}</p>
        <h3 className="text-4xl font-bold text-text-primary mb-1">{value}</h3>
        {subtext && <p className="text-xs text-text-secondary flex items-center gap-1 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-background-tertiary ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        <Icon size={24} className={color} />
      </div>
    </div>
    {trend && (
      <div className={`absolute bottom-0 left-0 w-full h-1 ${trend === 'up' ? 'bg-success' : trend === 'down' ? 'bg-danger' : 'bg-gray-600'}`} />
    )}
  </Card>
);

// --- Input ---
// Fixed: Added optional icon prop and wrapper div to handle internal icon rendering
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string, icon?: LucideIcon }> = ({ label, error, className = '', icon: Icon, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
          <Icon size={18} />
        </div>
      )}
      <input 
        className={`bg-background-primary border border-border-input rounded-button ${Icon ? 'pl-10' : 'px-4'} py-2.5 text-sm text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder-text-muted ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <span className="text-xs text-danger">{error}</span>}
  </div>
);

// --- Textarea ---
export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</label>}
    <textarea 
      className={`bg-background-primary border border-border-input rounded-button px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder-text-muted min-h-[100px] resize-y ${className}`}
      {...props}
    />
  </div>
);

// --- Modal ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string; size?: 'md' | 'lg' | 'xl' }> = ({ isOpen, onClose, children, title, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl h-[90vh]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-background-modal border border-border-card w-full ${sizeClasses[size]} rounded-modal shadow-2xl flex flex-col max-h-[90vh]`}>
        <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-text-tertiary hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Tabs ---
export const Tabs: React.FC<{ tabs: { id: string; label: string }[]; activeTab: string; onChange: (id: string) => void }> = ({ tabs, activeTab, onChange }) => (
  <div className="flex border-b border-border mb-6">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
          activeTab === tab.id 
            ? 'border-primary text-primary' 
            : 'border-transparent text-text-secondary hover:text-white'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
