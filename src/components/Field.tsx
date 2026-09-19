import type { ReactNode } from 'react';

let contador = 0;
function useId(prefixo: string) {
  contador += 1;
  return `${prefixo}-${contador}`;
}

export function TextAreaField({ label, value, onChange, placeholder, help, rows }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  help?: string;
  rows?: number;
}) {
  const id = useId('ta');
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {help && <span className="help-text">{help}</span>}
      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function TextField({ label, value, onChange, placeholder, help, type = 'text' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  help?: string;
  type?: string;
}) {
  const id = useId('tf');
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {help && <span className="help-text">{help}</span>}
      <input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function SelectField({ label, value, onChange, opcoes, help }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  opcoes: { valor: string; rotulo: string }[];
  help?: string;
}) {
  const id = useId('sf');
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {help && <span className="help-text">{help}</span>}
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Selecione…</option>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>{o.rotulo}</option>
        ))}
      </select>
    </div>
  );
}

export function FieldWrapper({ children }: { children: ReactNode }) {
  return <div className="field">{children}</div>;
}
