<?php
// Перевірка, чи були надіслані дані форми
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Отримання даних з форми
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];
    
    // Адреса, на яку буде відправлено повідомлення
    $to = "andrii.nahornyi.ca@gmail.com";

    // Тема листа
    $subject = "New message from $name";

    // Побудова тіла листа
    $body = "Name: $name\n";
    $body .= "Email: $email\n";
    $body .= "Message:\n$message";

    // Відправка електронної пошти
    if (mail($to, $subject, $body)) {
        echo "Your message has been sent successfully!";
    } else {
        echo "Sorry, there was an error sending your message.";
    }
} else {
    // Якщо форма не була надіслана, виводимо повідомлення про помилку
    echo "Sorry, something went wrong.";
}
?>
