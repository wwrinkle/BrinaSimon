<?php
$name = $_FILES["file"]["name"];
$tmp_name = $_FILES['file']['tmp_name'];
if (isset ($name)) {
    if (!empty($name)) {
    $location = '[PATH TO IMAGES]';
    if  (move_uploaded_file($tmp_name, $location.$name)){
        echo 'Uploaded';    
        }
        } else {
          echo 'please choose a file';
          }
    }
?>