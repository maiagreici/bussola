import type { ReactNode } from 'react';

export function Accordion({ titulo, children, aberto }: { titulo: string; children: ReactNode; aberto?: boolean }) {
  return (
    <details className="accordion" open={aberto}>
      <summary>{titulo}</summary>
      <div className="accordion-body">{children}</div>
    </details>
  );
}
