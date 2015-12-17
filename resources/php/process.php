<?php
    $response = array( 'success' => false );
    $data = json_decode(file_get_contents('php://input'));
    require 'PHPMailer-master/PHPMailerAutoload.php';
    $mail = new PHPMailer;
    $mail->SMTPDebug = false;
    $mail->isSMTP(); 
    $mail->Host = '[HOST]';
    $mail->SMTPAuth = true;
    $mail->Username = '[USERNAME]';            
    $mail->Password = '[PASSWORD]';        
    $mail->SMTPSecure = 'tls';            
    $mail->Port = 587; 
    if ( $data->submit == true ) {
        $mail->From = $data->email; 
        $mail->FromName = 'Brina Simon Website Mail';
        $mail->addAddress('[EMAIL]');
        $mail->isHTML(false);
        $mail->Subject = $data->subject;
        $body = "From:\n" . $data->email . "\n\n" . "Subject:\n" . $data->subject . "\n\n" .  "Message:\n" . $data->message . "\n\n";
        $mail->Body = $body;
        if(!$mail->send()) {
            echo $mail->ErrorInfo;
        } else {
            $response[ 'success' ] = true;
        }
        }
    echo json_encode( $response );
?>