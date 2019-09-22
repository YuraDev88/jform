<?php
//error_reporting(E_ALL);
//ini_set('display_errors', '1');
header('Content-type: application/json');
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
define("RE_SITE_KEY","");
define("RE_SEC_KEY",""); 
$domen = 'domen.ru';
$address = 'test@mail.ru';

function check_dom(){
	global $domen;
	$remo = $_SERVER["HTTP_REFERER"];
	return strpos($remo, $domen);
}

function checkRecap($recaptcha){
	if(empty($recaptcha)){
		return('Не заполнена капча');
	}

	$url = 'https://www.google.com/recaptcha/api/siteverify';

	$recaptcha = $recaptcha;
	$ip = $_SERVER['REMOTE_ADDR'];
			
	$url_data = $url.'?secret='.RE_SEC_KEY.'&response='.$recaptcha.'&remoteip='.$ip;
	$curl = curl_init();
			
	curl_setopt($curl,CURLOPT_URL,$url_data);
	curl_setopt($curl,CURLOPT_SSL_VERIFYPEER,FALSE);
	curl_setopt($curl,CURLOPT_RETURNTRANSFER,1);

	$res = curl_exec($curl);
	curl_close($curl);
			
	$res = json_decode($res);
			
	if(!$res->success){
		return('Не введена капча!');
	}
	return($res->success);
}

function FormChars($string){
	return nl2br(htmlspecialchars(trim($string),ENT_QUOTES),false);
}

$stop_arr = array();

function smtpmail($to, $subject, $content, $attach=false){
	$__smtp = array(
		"host" => 'buff.elastictech.org',
		"auth" => true,
		"port" => 25,
		"username" => 'test@domen.ru',
		"password" => '',
		"addreply" => "test@domen.ru",
		"replyto" => "test@domen.ru",
		"smtp" => true,
		"ssl" => false,
		"debug" => false
	);
	$to = explode(',',$to);

	require_once 'PHPMailer/src/Exception.php';
	require_once 'PHPMailer/src/PHPMailer.php';
	require_once 'PHPMailer/src/SMTP.php';
	$mail = new PHPMailer();
	if($__smtp['smtp'])$mail->IsSMTP();
	if($__smtp['ssl'])$mail->SMTPSecure = "ssl";
	
	$mail->Host       = $__smtp['host']; 
	$mail->SMTPDebug  = $__smtp['debug']; 
	$mail->From       = $__smtp['addreply'];
	$mail->FromName   = $__smtp['addreply'];
	$mail->SMTPAuth   = $__smtp['auth'];
	$mail->Port       = $__smtp['port']; 
	$mail->Username   = $__smtp['username'];
	$mail->Password   = $__smtp['password'];
	$mail->CharSet    = 'UTF-8';
	$mail->isHTML(true);
	$mail->SMTPKeepAlive = true;
	$mail->AddReplyTo($__smtp['addreply'], $__smtp['username']);
	
	for($i = 0;$i < count($to);$i++){
		$mail->AddAddress($to[$i]);
	}
	
	if($attach)$mail->addAttachment($attach, 'my_route.pdf');

	$mail->Subject = htmlspecialchars($subject);
	$mail->MsgHTML($content);
	
	$mail->Send();
	//if(!$mail->Send()) { echo "Mailer Error: " . $mail->ErrorInfo; } else { echo "Message sent!"; }
}

$result = array(); $result['send'] = 1;
if($_POST['phone']!='' and check_dom() and $_POST['address']==''){
	if(isset($_POST['g-recaptcha-response'])){
		$result['send'] = checkRecap($_POST['g-recaptcha-response']);
		if($result['send'] != 1){
			$result['send'] = 0;
			$result['recap'] = 'Неверная капча!';
		}
	}
	
	if($result['send']){
		$head = 'Заявка с сайта '.$domen;	
		$messege = "<b>Имя:</b> " . FormChars($_POST['name']) .
				   "<br /><b>Телефон:</b> " . FormChars($_POST['phone']) .
				   "<br /><b>Email:</b> " . FormChars($_POST['email']);
		smtpmail($address, $head, $messege); 
	}
	echo json_encode($result);
}elseif($_REQUEST['action']=='upload_file' and check_dom()){
	$uploaddir = 'files';
	//@mkdir($uploaddir, 0777);
	
	// разбиваем имя файла по точке и получаем массив
	$getMime = explode('.', $_FILES["file"]["name"]);
	// нас интересует последний элемент массива - расширение
	$mime = strtolower(end($getMime));
	// объявим массив допустимых расширений
	$types = array('jpg', 'png', 'gif', 'bmp', 'jpeg');
	
	// если расширение не входит в список допустимых - return
	if(in_array($mime, $types)){	
		$name = date("d-m-Y").'---'.date("H-i-s").'___'.$_FILES["file"]["name"];
		if($_FILES['file']["size"] < 1024*20*1024){
			if(is_uploaded_file($_FILES["file"]["tmp_name"])){
				if(move_uploaded_file($_FILES["file"]["tmp_name"], "$uploaddir/$name")){
					$result['nameFile'] = $name;
				}else{
					$result['send'] = 'no';
				}
			}else{
				$result['send'] = 'Файл не перенесен на сервер!';
			}
		}else{
			$result['send'] = 'Файл большой!';
		}
	}else{
		$result['send'] = 'Недопустимый тип файла.';
	}
	echo json_encode($result);
}
?>	
