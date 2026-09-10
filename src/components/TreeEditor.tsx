import type { NoArvore } from '../types/project';
import { novoId } from '../state/factory';

interface Props {
  nos: NoArvore[];
  onChange: (nos: NoArvore[]) => void;
}

function atualizarNo(nos: NoArvore[], id: string, fn: (n: NoArvore) => NoArvore): NoArvore[] {
  return nos.map((n) => (n.id === id ? fn(n) : { ...n, filhos: atualizarNo(n.filhos, id, fn) }));
}

function removerNo(nos: NoArvore[], id: string): NoArvore[] {
  return nos.filter((n) => n.id !== id).map((n) => ({ ...n, filhos: removerNo(n.filhos, id) }));
}

function moverNo(nos: NoArvore[], id: string, direcao: -1 | 1): NoArvore[] {
  const idx = nos.findIndex((n) => n.id === id);
  if (idx !== -1) {
    const novoIdx = idx + direcao;
    if (novoIdx < 0 || novoIdx >= nos.length) return nos;
    const copia = [...nos];
    [copia[idx], copia[novoIdx]] = [copia[novoIdx], copia[idx]];
    return copia;
  }
  return nos.map((n) => ({ ...n, filhos: moverNo(n.filhos, id, direcao) }));
}

function NodeEditor({ no, nivel, onRename, onAddChild, onAddSibling, onRemove, onMove }: {
  no: NoArvore;
  nivel: number;
  onRename: (id: string, titulo: string) => void;
  onAddChild: (id: string) => void;
  onAddSibling: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}) {
  return (
    <li>
      <div className="tree-node">
        <label className="sr-only" htmlFor={`node-${no.id}`}>{`Título do item de nível ${nivel + 1}`}</label>
        <input id={`node-${no.id}`} type="text" value={no.titulo} onChange={(e) => onRename(no.id, e.target.value)} />
        <button type="button" className="btn ghost" onClick={() => onMove(no.id, -1)} aria-label="Mover para cima">↑</button>
        <button type="button" className="btn ghost" onClick={() => onMove(no.id, 1)} aria-label="Mover para baixo">↓</button>
        {nivel < 2 && (
          <button type="button" className="btn ghost" onClick={() => onAddChild(no.id)}>+ subitem</button>
        )}
        <button type="button" className="btn ghost" onClick={() => onAddSibling(no.id)}>+ item</button>
        <button type="button" className="btn ghost" onClick={() => onRemove(no.id)} aria-label={`Remover ${no.titulo}`}>Remover</button>
      </div>
      {no.filhos.length > 0 && (
        <ul>
          {no.filhos.map((f) => (
            <NodeEditor
              key={f.id}
              no={f}
              nivel={nivel + 1}
              onRename={onRename}
              onAddChild={onAddChild}
              onAddSibling={onAddSibling}
              onRemove={onRemove}
              onMove={onMove}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TreeEditor({ nos, onChange }: Props) {
  function renomear(id: string, titulo: string) {
    onChange(atualizarNo(nos, id, (n) => ({ ...n, titulo })));
  }

  function adicionarFilho(id: string) {
    onChange(atualizarNo(nos, id, (n) => ({ ...n, filhos: [...n.filhos, { id: novoId(), titulo: '', filhos: [] }] })));
  }

  function adicionarIrmaoDepoisDe(id: string) {
    function inserir(lista: NoArvore[]): NoArvore[] {
      const idx = lista.findIndex((n) => n.id === id);
      if (idx !== -1) {
        const copia = [...lista];
        copia.splice(idx + 1, 0, { id: novoId(), titulo: '', filhos: [] });
        return copia;
      }
      return lista.map((n) => ({ ...n, filhos: inserir(n.filhos) }));
    }
    onChange(inserir(nos));
  }

  function remover(id: string) {
    onChange(removerNo(nos, id));
  }

  function mover(id: string, dir: -1 | 1) {
    onChange(moverNo(nos, id, dir));
  }

  function adicionarCapitulo() {
    onChange([...nos, { id: novoId(), titulo: '', filhos: [] }]);
  }

  return (
    <div>
      <ul className="tree">
        {nos.map((n) => (
          <NodeEditor
            key={n.id}
            no={n}
            nivel={0}
            onRename={renomear}
            onAddChild={adicionarFilho}
            onAddSibling={adicionarIrmaoDepoisDe}
            onRemove={remover}
            onMove={mover}
          />
        ))}
      </ul>
      <button type="button" className="btn secondary" style={{ marginTop: 10 }} onClick={adicionarCapitulo}>
        + Adicionar capítulo
      </button>
      {nos.length === 0 && <p className="help-text">Nenhum capítulo ainda. Comece adicionando o primeiro.</p>}
    </div>
  );
}
