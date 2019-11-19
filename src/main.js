(function() {
  const executeWhenMailOpened = callback => {
    const $mail_view = $('#mail_view');
    if ($mail_view.length > 0) {
      callback();
      const observer = new MutationObserver(callback);
      observer.observe($mail_view[0], { childList: true });
    }
  };

  const regex_patterns = {
    japanese: /((?<month>\d+)月(?<date>\d+)日[(（].?[)）]\s*((?<startHour>\d+):(?<startMinute>\d+).(?<endHour>\d+):(?<endMinute>\d+))?)/,
    en: /((?<month>\d+)\/(?<date>\d+)([(（].?[)）])?\s*((?<startHour>\d+):(?<startMinute>\d+).(?<endHour>\d+):(?<endMinute>\d+))?)/,
  };

  const deployScheduleAddButton = () => {
    if ($('.mail-to-schedule-popup').length > 0) {
      $('.mail-to-schedule-popup').remove();
    }
    let $mail_content = $('#mail_view .format_contents');
    if ($mail_content.html()) {
      for (const [key, pattern] of Object.entries(regex_patterns)) {
        $mail_content.html(
          $mail_content
            .html()
            .replace(
              new RegExp(pattern, 'g'),
              `<div class="mail-to-schedule"><button class="mail-to-schedule-button" data-regex-key="${key}">$1</button></div>`
            )
        );
      }

      $('.mail-to-schedule-button').on('click', el => {
        const mail_info = getMailInfo(el.target);
        openPopup(el.target, mail_info);
      });
    }
  };

  const createDateString = (month, date) => {
    return `2019-${padZero(month)}-${padZero(date)}`;
  };

  const createTimeString = (hour, minute) => {
    return `${padZero(hour)}:${padZero(minute)}:00+09:00`;
  };

  const createDateTimeString = (month, date, hour, minute) => {
    return `${createDateString(month, date)}T${createTimeString(hour, minute)}`;
  };

  const padZero = number => {
    return String(number).padStart(2, '0');
  };
  const openScheduleView = scheduleId => {
    window.open(`/g/schedule/view.csp?event=${scheduleId}`, '_blank');
  };

  const getMailInfo = dateButton => {
    const dateTimeRegex = regex_patterns[dateButton.dataset.regexKey];
    const matches = dateButton.innerText.match(dateTimeRegex);
    const {
      month,
      date,
      startHour = '',
      startMinute = '',
      endHour = '',
      endMinute = '',
    } = matches.groups;
    const $mail_content_title = $('.mail_content_title_text_grn');
    const title = $mail_content_title.text().trim();
    return {
      month: removeZero(month),
      date: removeZero(date),
      title,
      startHour: removeZero(startHour),
      startMinute: removeZero(startMinute),
      endHour: removeZero(endHour),
      endMinute: removeZero(endMinute),
    };
  };

  const removeZero = number_string => {
    return String(Number(number_string));
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
    $popup.find('#mail-to-schedule-popup-schedule-title').val(mail_info.title);
    $popup
      .find('#mail-to-schedule-popup-schedule-start-hour')
      .val(mail_info.startHour);
    $popup
      .find('#mail-to-schedule-popup-schedule-start-minute')
      .val(mail_info.startMinute);
    $popup
      .find('#mail-to-schedule-popup-schedule-end-hour')
      .val(mail_info.endHour);
    $popup
      .find('#mail-to-schedule-popup-schedule-end-minute')
      .val(mail_info.endMinute);

    $(document.body).append($popup);
    $popup.draggable();
    $('.mail-to-schedule-popup-close-button').on('click', () => {
      closePopup($popup);
    });

    $('.mail-to-schedule-popup-add-button').on('click', () => {
      const popup_info = getPopupInfo(mail_info.month, mail_info.date);
      addSchedule(popup_info).then(response => {
        closePopup($popup);
        openScheduleView(response.data.id);
      });
    });
  };

  const closePopup = $popup => {
    $popup.remove();
  };

  const getPopupInfo = (month, date) => {
    const startHour = $('#mail-to-schedule-popup-schedule-start-hour').val();
    const startMinute =
      $('#mail-to-schedule-popup-schedule-start-minute').val() || '0';
    const endHour = $('#mail-to-schedule-popup-schedule-end-hour').val();
    const endMinute =
      $('#mail-to-schedule-popup-schedule-end-minute').val() || '0';
    const isAllDay = startHour === '';
    const isStartOnly = !isAllDay && endHour === '';
    const startDateTime = isAllDay
      ? createDateTimeString(month, date, '0', '0')
      : createDateTimeString(month, date, startHour, startMinute);
    const endDateTime = isStartOnly
      ? createDateTimeString(month, date, '0', '0')
      : createDateTimeString(month, date, endHour, endMinute);
    return {
      subject: $('#mail-to-schedule-popup-schedule-title').val(),
      startDateTime,
      endDateTime,
      notes: $('#mail-to-schedule-popup-schedule-notes').val(),
      attendeesId: garoon.base.user.getLoginUser().garoonId,
      isAllDay,
      isStartOnly,
    };
  };

  const addSchedule = popup_info => {
    return garoon.api('/api/v1/schedule/events', 'POST', {
      eventType: 'REGULAR',
      subject: popup_info.subject,
      notes: popup_info.notes,
      attendees: [
        {
          id: popup_info.attendeesId,
          type: 'USER',
        },
      ],
      start: {
        dateTime: popup_info.startDateTime,
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: popup_info.endDateTime,
        timeZone: 'Asia/Tokyo',
      },
      isAllDay: popup_info.isAllDay,
      isStartOnly: popup_info.isStartOnly,
    });
  };

  const getPopupHTML = mail_info => {
    return `<div class="mail-to-schedule-popup fontsize_sub_grn_kit">
      <div class="mail-to-schedule-popup-header">
          <h3 class="mail-to-schedule-popup-header-title fontsize_sub_grn_kit">
          2019年${padZero(mail_info.month)}月${padZero(mail_info.date)}日
          </h3>
          <button class="mail-to-schedule-popup-close-button icon_close_2_mm_grn_kit icon_inline_mm_grn icon_only_mm_grn" title="ポップアップを閉じる"/>
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
                      <select id="mail-to-schedule-popup-schedule-start-hour">
                          <option value="">--時</option>
                          <option value="0">0時</option>
                          <option value="1">1時</option>
                          <option value="2">2時</option>
                          <option value="3">3時</option>
                          <option value="4">4時</option>
                          <option value="5">5時</option>
                          <option value="6">6時</option>
                          <option value="7">7時</option>
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
                      <select id="mail-to-schedule-popup-schedule-start-minute">
                          <option value="">--分</option>
                          <option value="0">00分</option>
                          <option value="30">30分</option>
                      </select>
                      ～
                      <select id="mail-to-schedule-popup-schedule-end-hour">
                          <option value="">--時</option>
                          <option value="0">0時</option>
                          <option value="1">1時</option>
                          <option value="2">2時</option>
                          <option value="3">3時</option>
                          <option value="4">4時</option>
                          <option value="5">5時</option>
                          <option value="6">6時</option>
                          <option value="7">7時</option>
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
                      <select id="mail-to-schedule-popup-schedule-end-minute">
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
                      <textarea id="mail-to-schedule-popup-schedule-notes"></textarea>
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

  executeWhenMailOpened(deployScheduleAddButton);
})();
