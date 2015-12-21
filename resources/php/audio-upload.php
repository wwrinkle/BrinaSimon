<?php
$name = $_FILES["file"]["name"];
$tmp_name = $_FILES['file']['tmp_name'];
if (isset ($name)) {
    if (!empty($name)) {
    $location = '[PATH TO AUDIO]';
    if  (move_uploaded_file($tmp_name, $location.$name)){
        if (strpos($name, ' ')) {
                $newName = str_replace(' ', '', $name);
                rename($location.$name, $location.$newName);
            } 
        }
        } else {
          echo 'No name';
          }
    }
?>