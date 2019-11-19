(function($) {
  /**
   * メールの3ペイン画面が開いているときにのみ動作させる
   * @param {callback} callback
   */
  const executeWhenMailOpened = callback => {
    const $mailView = $('#mail_view');
    if ($mailView.length > 0) {
      callback();
      const observer = new MutationObserver(callback);
      observer.observe($mailView[0], { childList: true });
    }
  };

  /**
   * 抽出する日付の正規表現のObject
   */
  const regexPatterns = {
    japanese: /((?<month>\d+)月(?<date>\d+)日[(（].?[)）]\s*((?<startHour>\d+):(?<startMinute>\d+).(?<endHour>\d+):(?<endMinute>\d+))?)/,
    en: /((?<month>\d+)\/(?<date>\d+)([(（].?[)）])?\s*((?<startHour>\d+):(?<startMinute>\d+).(?<endHour>\d+):(?<endMinute>\d+))?)/,
  };

  /**
   * 日付をScheduleAddButtonに変更する
   */
  const deployScheduleAddButton = () => {
    if ($('.mail-to-schedule-popup').length > 0) {
      $('.mail-to-schedule-popup').remove();
    }
    let $mailContent = $('#mail_view .format_contents');
    if ($mailContent.html()) {
      for (const [key, pattern] of Object.entries(regexPatterns)) {
        $mailContent.html(
          $mailContent
            .html()
            .replace(
              new RegExp(pattern, 'g'),
              `<div class="mail-to-schedule"><button class="mail-to-schedule-button" data-regex-key="${key}">$1</button></div>`
            )
        );
      }

      $('.mail-to-schedule-button').on('click', el => {
        const mailInfo = getMailInfo(el.target);
        openPopup(el.target, mailInfo);
      });
    }
  };

  /**
   * ゼロ詰日付文字列を生成する
   * @param {number} month
   * @param {number} date
   * @returns {string} e.g. 2019-11-03
   */
  const createDateString = (month, date) => {
    return `2019-${padZero(month)}-${padZero(date)}`;
  };

  /**
   * ゼロ詰時刻文字列を生成する
   * @param {number} hour
   * @param {number} minute
   * @returns {string} e.g. 09:30:00+09:00
   */
  const createTimeString = (hour, minute) => {
    return `${padZero(hour)}:${padZero(minute)}:00+09:00`;
  };

  /**
   * ゼロ詰日時文字列を生成する
   * @param {number} month
   * @param {number} date
   * @param {number} hour
   * @param {number} minute
   * @returns {string} e.g. 2019-11-03T09:30:00+09:00
   */
  const createDateTimeString = (month, date, hour, minute) => {
    return `${createDateString(month, date)}T${createTimeString(hour, minute)}`;
  };

  /**
   * 2桁ゼロ詰文字列を返す
   * @param {number} number
   * @returns {string}
   */
  const padZero = number => {
    return String(number).padStart(2, '0');
  };

  /**
   * 登録したスケジュール詳細画面を別タブで開く
   * @param {string} scheduleId
   */
  const openScheduleView = scheduleId => {
    window.open(`/g/schedule/view.csp?event=${scheduleId}`, '_blank');
  };

  /**
   * メール本文から、タイトル、日時情報を抽出する
   * @returns {Object}
   */
  const getMailInfo = dateButton => {
    const dateTimeRegex = regexPatterns[dateButton.dataset.regexKey];
    const matches = dateButton.innerText.match(dateTimeRegex);
    const {
      month,
      date,
      startHour = '',
      startMinute = '',
      endHour = '',
      endMinute = '',
    } = matches.groups;
    const $mailContentTitle = $('.mail_content_title_text_grn');
    const title = $mailContentTitle.text().trim();
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

  /**
   * 数値文字列から先頭の0を除く
   * @param {number} numberString
   * @returns {string}
   */
  const removeZero = numberString => {
    return String(Number(numberString));
  };

  /**
   * 予定登録ポップアップを開く
   * @param {Element} dateButton
   * @param {Object} mailInfo
   */
  const openPopup = (dateButton, mailInfo) => {
    if ($('.mail-to-schedule-popup').length > 0) {
      $('.mail-to-schedule-popup').remove();
    }

    const $popup = $(getPopupHTML(mailInfo));
    const rect = dateButton.getBoundingClientRect();
    $popup.css({
      top: rect.bottom + 10,
      left: rect.left,
    });
    $popup.find('#mail-to-schedule-popup-schedule-title').val(mailInfo.title);
    $popup
      .find('#mail-to-schedule-popup-schedule-start-hour')
      .val(mailInfo.startHour);
    $popup
      .find('#mail-to-schedule-popup-schedule-start-minute')
      .val(mailInfo.startMinute);
    $popup
      .find('#mail-to-schedule-popup-schedule-end-hour')
      .val(mailInfo.endHour);
    $popup
      .find('#mail-to-schedule-popup-schedule-end-minute')
      .val(mailInfo.endMinute);

    $(document.body).append($popup);
    $popup.draggable();
    $('.mail-to-schedule-popup-close-button').on('click', () => {
      closePopup($popup);
    });

    $('.mail-to-schedule-popup-add-button').on('click', () => {
      const popupInfo = getPopupInfo(mailInfo.month, mailInfo.date);
      addSchedule(popupInfo)
        .then(response => {
          closePopup($popup);
          openScheduleView(response.data.id);
        })
        .catch(() => {
          alert('予定登録に失敗しました');
          //レアケースなのでラフな実装で
        });
    });
  };

  /**
   * 予定登録ポップアップを閉じる
   * @param {jQuery} $popup
   */
  const closePopup = $popup => {
    $popup.remove();
  };

  /**
   * 予定登録ポップアップに入力された内容を取得する
   * @param {number} month
   * @param {number} date
   */
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

  /**
   * 予定を登録する
   * @param {Object} popupInfo
   */
  const addSchedule = popupInfo => {
    return garoon.api('/api/v1/schedule/events', 'POST', {
      eventType: 'REGULAR',
      subject: popupInfo.subject,
      notes: popupInfo.notes,
      attendees: [
        {
          id: popupInfo.attendeesId,
          type: 'USER',
        },
      ],
      start: {
        dateTime: popupInfo.startDateTime,
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: popupInfo.endDateTime,
        timeZone: 'Asia/Tokyo',
      },
      isAllDay: popupInfo.isAllDay,
      isStartOnly: popupInfo.isStartOnly,
    });
  };

  /**
   *
   * @param {string} str
   * @returns {string}
   */
  const htmlEscape = str => {
    if (!str) return;
    return str.replace(/[<>&"'`]/g, match => {
      const escape = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#x60;',
      };
      return escape[match];
    });
  };

  /**
   * 予定登録ポップアップのHTMLを生成する
   * @param {Object} mailInfo
   */
  const getPopupHTML = mailInfo => {
    return `<div class="mail-to-schedule-popup fontsize_sub_grn_kit">
      <div class="mail-to-schedule-popup-header">
          <h3 class="mail-to-schedule-popup-header-title fontsize_sub_grn_kit">
          2019年${htmlEscape(padZero(mailInfo.month))}月${htmlEscape(
      padZero(mailInfo.date)
    )}日
          </h3>
          <button class="mail-to-schedule-popup-close-button icon_close_2_mm_grn_kit icon_inline_mm_grn icon_only_mm_grn" title="ポップアップを閉じる"/>
      </div>
          <section>
              <div class="mail-to-schedule-popup-row">
                  <span class="mail-to-schedule-popup-row-title">参加者</span>
                  <span class="mail-to-schedule-popup-row-content">${htmlEscape(
                    garoon.base.user.getLoginUser().name
                  )}</span>
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
})(jQuery.noConflict(true));
