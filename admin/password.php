<?php
    $user = $_SERVER['PHP_AUTH_USER'];
    $pass = $_SERVER['PHP_AUTH_PW'];
    $userArray = json_encode(array($user, $pass));
    echo $userArray;
?>