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
          '<div class="mail-to-schedule"><button class="mail-to-schedule-button">$1</button></div>'
        )
      );
    }
  };
  let observer = new MutationObserver(callback);
  const $mail_view = $('#mail_view');
  if ($mail_view.length > 0) {
    observer.observe($mail_view[0], { childList: true });
  }
})();
