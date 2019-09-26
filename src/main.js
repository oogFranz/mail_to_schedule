(function() {
  //TODO: URLがmail/index.csp以外の時に外す

  let callback = () => {
    let $mail_content = $('#mail_view .format_contents');
    let mail_content_html = $mail_content.html();
    if (mail_content_html) {
      let regex = /((\d+)月(\d+)日[(（].?[)）])/g;
      $mail_content.html(
        mail_content_html.replace(
          regex,
          '<a href="/g/schedule/add.csp?bdate=2019-$2-$3">$1</a>'
        )
      );
    }
  };
  let observer = new MutationObserver(callback);
  observer.observe($('#mail_view')[0], { childList: true });
})();
