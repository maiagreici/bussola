<?php
// Lista todos os projetos salvos, para o painel do professor. Só responde
// se a sessão já passou por login.php com a senha correta.

require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
session_start();

if (empty($_SESSION['bussola_professor'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Não autenticado']);
    exit;
}

try {
    $conexao = bussola_conectar();
    $resultado = $conexao->query(
        'SELECT id, nome, curso, titulo, nivel, dados, criado_em, atualizado_em
         FROM bussola_projetos ORDER BY atualizado_em DESC'
    );

    $projetos = [];
    while ($linha = $resultado->fetch_assoc()) {
        // `dados` já é o JSON completo do projeto (mesmo formato usado no
        // navegador do aluno) — devolvemos ele decodificado para o painel
        // reaproveitar exatamente a mesma lógica de diagnóstico do app.
        $projetos[] = json_decode($linha['dados'], true);
    }

    $conexao->close();
    echo json_encode(['ok' => true, 'projetos' => $projetos]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Falha ao consultar']);
}
