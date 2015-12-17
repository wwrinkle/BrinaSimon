<?php
    include_once('.htpasswd.php');
    $user = $_SERVER['PHP_AUTH_USER'];
    $newPass = file_get_contents('php://input');
    $htpasswd = new htpasswd('[PATH TO .htpasswd]');
    if($htpasswd->user_update($user,$newPass))
    echo json_encode("Updated password");
?>