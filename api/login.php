<?php
// Login do painel do professor: recebe {"senha": "..."} e, se correta,
// inicia uma sessão PHP (cookie) que list.php exige para responder.

require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

$corpo = json_decode(file_get_contents('php://input'), true);
$senha = is_array($corpo) ? (string) ($corpo['senha'] ?? '') : '';

if ($senha !== '' && password_verify($senha, TEACHER_PASSWORD_HASH)) {
    $_SESSION['bussola_professor'] = true;
    echo json_encode(['ok' => true]);
} else {
    http_response_code(401);
    echo json_encode(['ok' => false, 'erro' => 'Senha incorreta']);
}
