<?php
// Recebe o ResearchProject inteiro (JSON) do navegador do aluno e grava/atualiza
// uma linha no banco, identificada pelo id do projeto. Sem login: qualquer
// aluno com o link pode salvar o próprio progresso, mas só o dele (o id é
// gerado aleatoriamente no navegador e nunca é mostrado para outros alunos).

require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

$corpo = file_get_contents('php://input');
$projeto = json_decode($corpo, true);

if (!is_array($projeto) || empty($projeto['id']) || !isset($projeto['perfil']) || !isset($projeto['tituloProvisorio'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Corpo inválido']);
    exit;
}

// Limite de tamanho generoso, só para evitar abuso grosseiro.
if (strlen($corpo) > 2 * 1024 * 1024) {
    http_response_code(413);
    echo json_encode(['erro' => 'Projeto grande demais']);
    exit;
}

$id = substr((string) $projeto['id'], 0, 40);
$nome = substr((string) ($projeto['perfil']['nome'] ?? ''), 0, 255);
$curso = substr((string) ($projeto['perfil']['curso'] ?? ''), 0, 255);
$nivel = substr((string) ($projeto['perfil']['nivel'] ?? ''), 0, 50);
$titulo = substr((string) $projeto['tituloProvisorio'], 0, 500);
$criadoEm = !empty($projeto['criadoEm']) ? date('Y-m-d H:i:s', strtotime($projeto['criadoEm'])) : date('Y-m-d H:i:s');
$atualizadoEm = !empty($projeto['atualizadoEm']) ? date('Y-m-d H:i:s', strtotime($projeto['atualizadoEm'])) : date('Y-m-d H:i:s');

try {
    $conexao = bussola_conectar();
    $stmt = $conexao->prepare(
        'INSERT INTO bussola_projetos (id, nome, curso, titulo, nivel, dados, criado_em, atualizado_em)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nome = VALUES(nome), curso = VALUES(curso), titulo = VALUES(titulo),
           nivel = VALUES(nivel), dados = VALUES(dados), atualizado_em = VALUES(atualizado_em)'
    );
    $stmt->bind_param('ssssssss', $id, $nome, $curso, $titulo, $nivel, $corpo, $criadoEm, $atualizadoEm);
    $stmt->execute();
    $stmt->close();
    $conexao->close();
    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Falha ao salvar']);
}
