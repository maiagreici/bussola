<?php
// Configuração do backend da Bússola.
//
// IMPORTANTE: depois de subir este arquivo para o servidor, edite os
// valores abaixo diretamente pelo Gerenciador de Arquivos do cPanel
// (clique com o botão direito em api/config.php → Editar). Não é preciso
// reinstalar nada — é só trocar o texto e salvar.

// --- Banco de dados (preencha com os dados que o cPanel mostrou quando
// você criou o banco em "MySQL Databases") ---
define('DB_HOST', 'localhost');
define('DB_NAME', 'TROQUE_pelo_nome_do_banco');       // ex: seuusuario_bussola
define('DB_USER', 'TROQUE_pelo_usuario_do_banco');     // ex: seuusuario_bussola
define('DB_PASS', 'TROQUE_pela_senha_do_banco');

// --- Senha do painel do professor ---
// Gere o hash rodando localmente (ou peça para o Claude gerar) o comando:
//   php -r "echo password_hash('SUA_SENHA_AQUI', PASSWORD_DEFAULT);"
// e cole o resultado abaixo, entre aspas. NUNCA coloque a senha em texto
// puro aqui — sempre o hash gerado por password_hash().
define('TEACHER_PASSWORD_HASH', 'TROQUE_PELO_HASH_GERADO');

function bussola_conectar(): mysqli {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $conexao = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    $conexao->set_charset('utf8mb4');
    return $conexao;
}
