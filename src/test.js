$('.mail-to-schedule-button').on('click', () => {
  const $popup = $(`<div class="mail-to-schedule-popup fontsize_sub_grn_kit">
            <div class="mail-to-schedule-popup-header">
                <h3 class="mail-to-schedule-popup-header-title fontsize_sub_grn_kit">2019年09月26日</h3>
                <button class="mail-to-schedule-popup-close-button icon_close_2_mm_grn_kit icon_inline_mm_grn icon_only_mm_grn"/>
            </div>
    <section>
        <div class="mail-to-schedule-popup-row">
            <span class="mail-to-schedule-popup-row-title">参加者</span>
            <span class="mail-to-schedule-popup-row-content">ユーザー1</span>
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
                <input type="text"/>
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
                <button class="button_main_sub_grn_kit">登録する</button>
            </div>
        </div>
    </section>
</div>`);
  $('.mail-to-schedule').append($popup);
});
