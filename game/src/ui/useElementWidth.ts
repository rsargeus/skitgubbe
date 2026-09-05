import { useCallback, useEffect, useState } from 'react';

/** The measured width of an element, kept up to date as it resizes. */
export function useElementWidth(): [(node: HTMLElement | null) => void, number] {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);

  const ref = useCallback((next: HTMLElement | null) => setNode(next), []);

  useEffect(() => {
    if (!node) return;
    setWidth(node.clientWidth);

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [ref, width];
}
