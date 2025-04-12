import React from 'react';
import "./styles.css";
export const ConfettiBurst = React.memo(({ x, y, id }: { x: number; y: number; id: number }) => {
  return (
    <div
      key={id}
      className="confetti-container"
      style={{
        top: `${y}px`,
        left: `${x}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {Array.from({ length: 40 }).map((_, i) => {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 600 + 200;

        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        const emojis = ['🎉', '🎈', '✨', '🎊', '💥'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        return (
            <span
            key={`${id}-${i}`}
            className="confetti"
            style={{
              '--x': `${offsetX}px`,
              '--y': `${offsetY}px`,
              animationDelay: `${Math.random() * 0.2}s`,
            } as React.CSSProperties}
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
});
    
