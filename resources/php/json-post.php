<?php
    $postdata = file_get_contents("php://input");
    $request = json_decode($postdata);
    $name = $request->name;
    $data = $request->jsonData;
    $newJsonString = json_encode($data);
    $location = '../../public/data/';
    file_put_contents($location . $name, $newJsonString);
?>