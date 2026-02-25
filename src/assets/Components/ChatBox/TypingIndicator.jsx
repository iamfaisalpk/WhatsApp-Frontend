const TypingIndicator = ({ typingUser }) => {
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-[var(--ig-secondary-bg)] rounded-full w-fit border border-[var(--ig-border)] shadow-sm">
      <div className="flex gap-1 items-center h-4">
        <div className="w-1.5 h-1.5 bg-[var(--ig-primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 bg-[var(--ig-primary)] rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 bg-[var(--ig-primary)] rounded-full animate-bounce" />
      </div>
      <span className="text-[11px] font-bold text-[var(--ig-text-secondary)] uppercase tracking-tight">
        Typing...
      </span>
    </div>
  );
};

export default TypingIndicator;
