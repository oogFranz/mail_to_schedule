const executeWhenMailOpened = callback => {
  const observer = new MutationObserver(callback);
  const $mail_view = $('#mail_view');
  if ($mail_view.length > 0) {
    observer.observe($mail_view[0], { childList: true });
  }
};

const deployScheduleAddButton = () => {
  if ($('.mail-to-schedule-popup').length > 0) {
    $('.mail-to-schedule-popup').remove();
  }
  let $mail_content = $('#mail_view .format_contents');
  const mail_content_html = $mail_content.html();
  if (mail_content_html) {
    const regex = /((\d+)月(\d+)日[(（].?[)）]((\d+):(\d+).(\d+):(\d+))?)/g;
    $mail_content.html(
      mail_content_html.replace(
        regex,
        '<div class="mail-to-schedule"><button class="mail-to-schedule-button">$1</button></div>'
      )
    );

    $('.mail-to-schedule-button').on('click', el => {
      const mail_info = getMailInfo(el.target);
      openPopup(el.target, mail_info);
    });
  }
};

const createDateString = (month, date) => {
  return `2019-${padZero(month)}-${padZero(date)}`;
};

const padZero = number => {
  return String(number).padStart(2, '0');
};
const openScheduleView = scheduleId => {
  window.open(`/g/schedule/view.csp?event=${scheduleId}`, '_blank');
};

const getMailInfo = dateButton => {
  const dateRegex = /(\d+)月(\d+)日/;
  const matches = dateButton.innerText.match(dateRegex);
  const month = matches[1];
  const date = matches[2];
  const $mail_content_title = $('.mail_content_title_text_grn');
  const title = $mail_content_title.text().trim();
  return {
    month,
    date,
    title,
  };
};

const openPopup = (dateButton, mail_info) => {
  if ($('.mail-to-schedule-popup').length > 0) {
    $('.mail-to-schedule-popup').remove();
  }

  const $popup = $(getPopupHTML(mail_info));
  const rect = dateButton.getBoundingClientRect();
  $popup.css({
    top: rect.bottom + 10,
    left: rect.left,
  });

  $(document.body).append($popup);

  $('#mail-to-schedule-popup-schedule-title').val(mail_info.title);
  $('.mail-to-schedule-popup-close-button').on('click', () => {
    closePopup($popup);
  });

  $('.mail-to-schedule-popup-add-button').on('click', () => {
    addSchedule(mail_info).then(response => {
      closePopup($popup);
      openScheduleView(response.data.id);
    });
  });
};
const closePopup = $popup => {
  $popup.remove();
};

const addSchedule = mail_info => {
  return garoon.api('/api/v1/schedule/events', 'POST', {
    eventType: 'REGULAR',
    subject: $('#mail-to-schedule-popup-schedule-title').val(),
    notes: '',
    attendees: [
      {
        id: garoon.base.user.getLoginUser().garoonId,
        type: 'USER',
      },
    ],
    start: {
      dateTime: `${createDateString(
        mail_info.month,
        mail_info.date
      )}T08:00:00+09:00`,
      timeZone: 'Asia/Tokyo',
    },
    end: {
      dateTime: `${createDateString(
        mail_info.month,
        mail_info.date
      )}T18:00:00+09:00`,
      timeZone: 'Asia/Tokyo',
    },
  });
};

const getPopupHTML = mail_info => {
  return `<div class="mail-to-schedule-popup fontsize_sub_grn_kit">
      <div class="mail-to-schedule-popup-header">
          <h3 class="mail-to-schedule-popup-header-title fontsize_sub_grn_kit">
          2019年${padZero(mail_info.month)}月${padZero(mail_info.date)}日
          </h3>
          <button class="mail-to-schedule-popup-close-button icon_close_2_mm_grn_kit icon_inline_mm_grn icon_only_mm_grn"/>
      </div>
          <section>
              <div class="mail-to-schedule-popup-row">
                  <span class="mail-to-schedule-popup-row-title">参加者</span>
                  <span class="mail-to-schedule-popup-row-content">${
                    garoon.base.user.getLoginUser().name
                  }</span>
              </div>
              <div class="mail-to-schedule-popup-row">
                  <span class="mail-to-schedule-popup-row-title">時刻</span>
                  <div class="mail-to-schedule-popup-row-content">
                      <select id="start_hour" name="start_hour">
                          <option value="">--時</option>
                          <option value="0">0時</option>
                          <option value="1">1時</option>
                          <option value="2">2時</option>
                          <option value="3">3時</option>
                          <option value="4">4時</option>
                          <option value="5">5時</option>
                          <option value="6">6時</option>
                          <option value="7">7時</option>
                          <option value="" selected="">--時</option>
                          <option value="8">8時</option>
                          <option value="9">9時</option>
                          <option value="10">10時</option>
                          <option value="11">11時</option>
                          <option value="12">12時</option>
                          <option value="13">13時</option>
                          <option value="14">14時</option>
                          <option value="15">15時</option>
                          <option value="16">16時</option>
                          <option value="17">17時</option>
                          <option value="18">18時</option>
                          <option value="19">19時</option>
                          <option value="20">20時</option>
                          <option value="21">21時</option>
                          <option value="22">22時</option>
                          <option value="23">23時</option>
                      </select>
                      <select id="start_minute" name="start_minute">
                          <option value="">--分</option>
                          <option value="0">00分</option>
                          <option value="30">30分</option>
                      </select>
                      ～
                      <select id="end_hour" name="end_hour">
                          <option value="">--時</option>
                          <option value="0">0時</option>
                          <option value="1">1時</option>
                          <option value="2">2時</option>
                          <option value="3">3時</option>
                          <option value="4">4時</option>
                          <option value="5">5時</option>
                          <option value="6">6時</option>
                          <option value="7">7時</option>
                          <option value="" selected="">--時</option>
                          <option value="8">8時</option>
                          <option value="9">9時</option>
                          <option value="10">10時</option>
                          <option value="11">11時</option>
                          <option value="12">12時</option>
                          <option value="13">13時</option>
                          <option value="14">14時</option>
                          <option value="15">15時</option>
                          <option value="16">16時</option>
                          <option value="17">17時</option>
                          <option value="18">18時</option>
                          <option value="19">19時</option>
                          <option value="20">20時</option>
                          <option value="21">21時</option>
                          <option value="22">22時</option>
                          <option value="23">23時</option>
                      </select>
                      <select id="end_minute" name="end_minute">
                          <option value="">--分</option>
                          <option value="0">00分</option>
                          <option value="30">30分</option>
                      </select>
                  </div>
              </div>
              <div class="mail-to-schedule-popup-row">
                  <span class="mail-to-schedule-popup-row-title">タイトル</span>
                  <div class="mail-to-schedule-popup-row-content">
                      <input id="mail-to-schedule-popup-schedule-title" type="text"/>
                  </div>
              </div>
              <div class="mail-to-schedule-popup-row">
                  <span class="mail-to-schedule-popup-row-title">メモ</span>
                  <div class="mail-to-schedule-popup-row-content">
                      <textarea></textarea>
                  </div>
              </div>
              <div class="mail-to-schedule-popup-row">
                  <span class="mail-to-schedule-popup-row-title"></span>
                  <div class="mail-to-schedule-popup-row-content">
                      <button class="mail-to-schedule-popup-add-button button_main_sub_grn_kit">登録する</button>
                  </div>
              </div>
          </section>
      </div>`;
};

(function() {
  executeWhenMailOpened(deployScheduleAddButton);
})();
