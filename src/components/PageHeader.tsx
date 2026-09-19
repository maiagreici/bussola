export function PageHeader({ eyebrow, titulo, oQueVerificamos, porQueImporta }: {
  eyebrow: string;
  titulo: string;
  oQueVerificamos: string;
  porQueImporta: string;
}) {
  return (
    <header className="card" style={{ marginBottom: 16 }}>
      <p className="eyebrow" style={{ margin: '0 0 6px' }}>{eyebrow}</p>
      <h1 style={{ margin: '0 0 10px', fontSize: '1.5rem' }}>{titulo}</h1>
      <p style={{ margin: '0 0 4px' }}><strong>O que estamos verificando: </strong>{oQueVerificamos}</p>
      <p style={{ margin: 0, color: 'var(--text-muted)' }}><strong>Por que importa: </strong>{porQueImporta}</p>
    </header>
  );
}
