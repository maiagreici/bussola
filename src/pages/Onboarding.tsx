import { useState } from 'react';
import { useStore } from '../state/store';
import { useRouter } from '../state/router';
import { criarProjeto } from '../state/factory';
import { TextField, TextAreaField, SelectField } from '../components/Field';
import type { NivelAcademico } from '../types/project';

const NIVEIS: { valor: NivelAcademico; rotulo: string }[] = [
  { valor: 'graduacao', rotulo: 'Graduação' },
  { valor: 'especializacao', rotulo: 'Especialização' },
  { valor: 'mestrado', rotulo: 'Mestrado' },
  { valor: 'doutorado', rotulo: 'Doutorado' },
  { valor: 'selecao', rotulo: 'Querendo passar em uma seleção (ainda não sou aluno)' },
  { valor: 'outro', rotulo: 'Outro' },
];

export function Onboarding() {
  const { definirProjeto } = useStore();
  const { navegar } = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [instituicao, setInstituicao] = useState('');
  const [curso, setCurso] = useState('');
  const [nivel, setNivel] = useState<NivelAcademico | ''>('');
  const [area, setArea] = useState('');
  const [titulo, setTitulo] = useState('');
  const [estagio, setEstagio] = useState('');
  const [erro, setErro] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !curso.trim() || !nivel || !area.trim() || !titulo.trim()) {
      setErro('Preencha os campos obrigatórios para começarmos.');
      return;
    }
    const projeto = criarProjeto(
      { nome, email, instituicao, curso, nivel: nivel as NivelAcademico, areaConhecimento: area },
      titulo,
      estagio,
    );
    definirProjeto(projeto);
    navegar({ pagina: 'dashboard' });
  }

  return (
    <div className="page-wrap" style={{ maxWidth: 620, margin: '40px auto' }}>
      <div className="card">
        <p className="eyebrow">Bem-vindo(a)</p>
        <h1 style={{ marginTop: 4 }}>Vamos organizar sua pesquisa</h1>
        <p className="help-text">
          Este não é um gerador de TCC. É uma pré-orientação estruturada: um espaço para você examinar e
          amadurecer sua própria pesquisa antes de levá-la adiante — seja para o seu orientador, seja para
          uma banca de seleção.
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <TextField label="Nome *" value={nome} onChange={setNome} />
          <TextField label="E-mail *" type="email" value={email} onChange={setEmail} />
          <TextField label="Instituição (opcional)" value={instituicao} onChange={setInstituicao} />
          <TextField
            label="Curso *"
            value={curso}
            onChange={setCurso}
            help="O curso que você está fazendo (ex: Licenciatura em História, Psicologia, Engenharia Civil)."
            placeholder="Ex: Pedagogia"
          />
          <SelectField label="Nível acadêmico *" value={nivel} onChange={(v) => setNivel(v as NivelAcademico)} opcoes={NIVEIS} />
          <TextField label="Área do conhecimento *" value={area} onChange={setArea} />
          <TextField label="Título provisório da pesquisa *" value={titulo} onChange={setTitulo} />
          <TextAreaField
            label="Estágio atual do trabalho"
            value={estagio}
            onChange={setEstagio}
            placeholder="Ex: tenho um rascunho de introdução, ainda não sei minha metodologia..."
            rows={3}
          />
          {erro && <p role="alert" style={{ color: 'var(--danger)' }}>{erro}</p>}
          <button type="submit" className="btn">Começar minha Bússola</button>
        </form>
      </div>
    </div>
  );
}
