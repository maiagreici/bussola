import type { ObjetivoEspecifico } from '../types/project';
import { novoId } from '../state/factory';

interface Props {
  linhas: ObjetivoEspecifico[];
  onChange: (linhas: ObjetivoEspecifico[]) => void;
}

export function ObjetivosEspecificosTable({ linhas, onChange }: Props) {
  function atualizarLinha(id: string, campo: keyof ObjetivoEspecifico, valor: string) {
    onChange(linhas.map((l) => (l.id === id ? { ...l, [campo]: valor } : l)));
  }

  function adicionarLinha() {
    onChange([...linhas, { id: novoId(), descricao: '', comoVouFazer: '', resultadoEsperado: '' }]);
  }

  function removerLinha(id: string) {
    onChange(linhas.filter((l) => l.id !== id));
  }

  return (
    <div>
      <div className="table-scroll">
        <table className="editable-table">
          <caption className="sr-only">Tabela de objetivos específicos</caption>
          <thead>
            <tr>
              <th scope="col">Objetivo específico</th>
              <th scope="col">Como vou fazer?</th>
              <th scope="col">Resultado esperado</th>
              <th scope="col"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha, idx) => (
              <tr key={linha.id}>
                <td>
                  <label className="sr-only" htmlFor={`desc-${linha.id}`}>Objetivo específico {idx + 1}</label>
                  <textarea
                    id={`desc-${linha.id}`}
                    value={linha.descricao}
                    onChange={(e) => atualizarLinha(linha.id, 'descricao', e.target.value)}
                    placeholder="Ex: Identificar..."
                  />
                </td>
                <td>
                  <label className="sr-only" htmlFor={`como-${linha.id}`}>Como vou fazer {idx + 1}</label>
                  <textarea
                    id={`como-${linha.id}`}
                    value={linha.comoVouFazer}
                    onChange={(e) => atualizarLinha(linha.id, 'comoVouFazer', e.target.value)}
                    placeholder="Procedimento previsto"
                  />
                </td>
                <td>
                  <label className="sr-only" htmlFor={`res-${linha.id}`}>Resultado esperado {idx + 1}</label>
                  <textarea
                    id={`res-${linha.id}`}
                    value={linha.resultadoEsperado}
                    onChange={(e) => atualizarLinha(linha.id, 'resultadoEsperado', e.target.value)}
                    placeholder="O que esse procedimento deve produzir"
                  />
                </td>
                <td>
                  <button type="button" className="btn ghost" onClick={() => removerLinha(linha.id)}>
                    Remover
                  </button>
                </td>
              </tr>
            ))}
            {linhas.length === 0 && (
              <tr>
                <td colSpan={4} className="help-text">Nenhum objetivo específico ainda. Adicione o primeiro abaixo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10 }}>
        <button type="button" className="btn secondary" onClick={adicionarLinha}>+ Adicionar objetivo específico</button>
      </div>
    </div>
  );
}
