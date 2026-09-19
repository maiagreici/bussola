import type { NivelAcademico } from '../types/project';

// Quem escolhe "selecao" no onboarding ainda não é aluno regularmente
// matriculado — está montando um anteprojeto para concorrer a uma vaga em
// um processo seletivo (mestrado/doutorado, por exemplo) e, portanto, ainda
// não tem orientador. Este módulo centraliza as poucas frases do app que
// mencionam "orientador" para adaptá-las a esse caso, sem duplicar lógica
// de fluxo (o restante do app é idêntico para todos os perfis).

export function candidatoASelecao(nivel: NivelAcademico): boolean {
  return nivel === 'selecao';
}

export function fraseMandarAssim(nivel: NivelAcademico): string {
  return candidatoASelecao(nivel)
    ? 'Sério que você pensou em mandar assim para a seleção?'
    : 'Sério que você pensou em mandar assim para o seu orientador?';
}

export function fraseVerificarEtica(nivel: NivelAcademico): string {
  return candidatoASelecao(nivel)
    ? 'verifique isso junto ao edital do processo seletivo e às normas da instituição para a qual está se candidatando'
    : 'verifique isso com o seu orientador';
}

export function fraseConfirmadoJuntoA(nivel: NivelAcademico): string {
  return candidatoASelecao(nivel)
    ? 'confirmado junto ao edital do processo seletivo e às normas da instituição'
    : 'confirmado junto ao seu orientador e às normas da sua instituição';
}

export function rotuloSecaoContato(nivel: NivelAcademico): string {
  return candidatoASelecao(nivel) ? 'Sujeitos da pesquisa e contato' : 'Sujeitos da pesquisa e orientação';
}

export function rotuloNomeContato(nivel: NivelAcademico): string {
  return candidatoASelecao(nivel) ? 'Nome de contato da seleção (opcional)' : 'Nome do orientador (opcional)';
}

export function rotuloEmailContato(nivel: NivelAcademico): string {
  return candidatoASelecao(nivel) ? 'E-mail de contato da seleção (opcional)' : 'E-mail do orientador (opcional)';
}

export function fraseConviteCadastrarContato(nivel: NivelAcademico): string {
  return candidatoASelecao(nivel)
    ? 'Quer enviar uma cópia para algum contato da seleção? Cadastre o e-mail na etapa'
    : 'Quer enviar uma cópia para o seu orientador? Cadastre o e-mail dele na etapa';
}

export function fraseTresCoisasAntesDeEnviar(nivel: NivelAcademico): string {
  return candidatoASelecao(nivel)
    ? 'As três coisas que eu faria antes de enviar para a seleção'
    : 'As três coisas que eu faria antes de enviar ao orientador';
}

export function frasePorQueImportaDiagnostico(nivel: NivelAcademico): string {
  return candidatoASelecao(nivel)
    ? 'Isso é exatamente o que uma banca de seleção olharia antes de mergulhar nos detalhes: a arquitetura está de pé?'
    : 'Isso é exatamente o que um bom orientador olharia antes de mergulhar nos detalhes: a arquitetura está de pé?';
}
