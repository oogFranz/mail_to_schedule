(function () {
    let $mail_content = $("#mail_view .format_contents");
    let mail_content_html = $mail_content.html();
    $mail_content.html(mail_content_html.replace('9月24日（火）', '<a href="">9月24日（火）</a>'));
})();