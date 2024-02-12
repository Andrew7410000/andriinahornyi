<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Replace contact@example.com with your real receiving email address
    $receiving_email_address = 'andrii.nahornyi.ca@gmail.com';

    // Check if PHP Email Form library is available
    if (file_exists($php_email_form = '../assets/vendor/php-email-form/php-email-form.php')) {
        include($php_email_form);
    } else {
        die('Unable to load the "PHP Email Form" Library!');
    }

    // Instantiate PHP Email Form class
    $contact = new PHP_Email_Form;
    $contact->ajax = true;

    // Set email parameters
    $contact->to = $receiving_email_address;
    $contact->from_name = $_POST['name'];
    $contact->from_email = $_POST['email'];
    $contact->subject = $_POST['subject'];

    // Add message content
    $contact->add_message($_POST['name'], 'From');
    $contact->add_message($_POST['email'], 'Email');
    $contact->add_message($_POST['message'], 'Message', 10);

    // Uncomment below code if you want to use SMTP to send emails. You need to enter your correct SMTP credentials
    /*
    $contact->smtp = array(
      'host' => 'example.com',
      'username' => 'example',
      'password' => 'pass',
      'port' => '587'
    );
    */

    // Send email and echo success/failure
    echo $contact->send();
} else {
    // Handle GET requests or direct access to the file
    header("HTTP/1.0 403 Forbidden");
    echo "Access Forbidden";
}
?>
