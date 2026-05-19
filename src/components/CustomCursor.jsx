import React, { useEffect, useRef } from 'react';

const TRAIL_COUNT = 10;

export function CustomCursor() {
  const cursorRef = useRef(null);
  const layerRef = useRef(null);
  const trailRefs = useRef([]);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) {
      return undefined;
    }

    let frameId;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: target.x, y: target.y };
    const trail = Array.from({ length: TRAIL_COUNT }, () => ({
      x: target.x,
      y: target.y,
    }));

    const handleMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      layerRef.current?.classList.add('custom-cursor-layer--visible');
    };

    const handleLeave = () => {
      layerRef.current?.classList.remove('custom-cursor-layer--visible');
    };

    const animate = () => {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
      }

      trail.forEach((point, index) => {
        const source = index === 0 ? current : trail[index - 1];

        point.x += (source.x - point.x) * 0.16;
        point.y += (source.y - point.y) * 0.16;

        const trailNode = trailRefs.current[index];

        if (trailNode) {
          trailNode.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%) scale(${1 - index * 0.055})`;
          trailNode.style.opacity = `${0.42 - index * 0.03}`;
        }
      });

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseleave', handleLeave);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <div className="custom-cursor-layer" ref={layerRef} aria-hidden="true">
      <div className="custom-cursor" ref={cursorRef}>
        <span className="custom-cursor__ring">
          <span className="custom-cursor__core" />
        </span>
      </div>

      {Array.from({ length: TRAIL_COUNT }).map((_, index) => (
        <div
          key={`sigil-trail-${index}`}
          className="custom-cursor-echo"
          ref={(node) => {
            trailRefs.current[index] = node;
          }}
        >
          <span className="custom-cursor-echo__ring">
            <span className="custom-cursor-echo__core" />
          </span>
        </div>
      ))}
    </div>
  );
}
