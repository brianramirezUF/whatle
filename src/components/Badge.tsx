// Simple Badge component
const Badge: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = "" }) => {
    return (
        <span className={`inline-flex items-center rounded-full text-xs font-medium ${className}`}>
            {children}
        </span>
    );
};

export { Badge };