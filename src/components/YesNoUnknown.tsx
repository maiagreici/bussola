import type { SimNaoTalvez } from '../types/project';

interface Opcao {
  valor: SimNaoTalvez;
  rotulo: string;
}

interface Props {
  pergunta: string;
  valor: SimNaoTalvez | null;
  onChange: (v: SimNaoTalvez) => void;
  opcoes?: Opcao[];
  nomeGrupo: string;
}

const PADRAO: Opcao[] = [
  { valor: 'sim', rotulo: 'Sim' },
  { valor: 'ainda_nao', rotulo: 'Ainda não' },
];

export function YesNoUnknown({ pergunta, valor, onChange, opcoes = PADRAO, nomeGrupo }: Props) {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ fontWeight: 600, marginBottom: 10, padding: 0 }}>{pergunta}</legend>
      <div className="choice-group" role="group" aria-label={nomeGrupo}>
        {opcoes.map((op) => (
          <button
            key={op.valor}
            type="button"
            className="choice-btn"
            aria-pressed={valor === op.valor}
            onClick={() => onChange(op.valor)}
          >
            {op.rotulo}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
