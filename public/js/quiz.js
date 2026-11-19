(function () {
  'use strict';
  var Q = [
    { t: 'Uống nước chanh muối mỗi sáng sẽ chữa khỏi cảm cúm. Chia sẻ ngay để cứu người thân!', ok: false, e: 'Đáng ngờ: hứa “chữa khỏi”, giục chia sẻ gấp và không nêu nguồn hay bằng chứng nào.' },
    { t: 'Rửa tay bằng xà phòng đúng cách giúp giảm nguy cơ mắc các bệnh đường tiêu hóa và hô hấp. Đây là khuyến cáo của WHO và các cơ quan y tế.', ok: true, e: 'Đáng tin: phù hợp với khuyến cáo y tế phổ biến, nêu rõ nguồn, không hứa hẹn quá mức, không bán hàng. Bạn vẫn nên đối chiếu thêm trên trang chính thức.' },
    { t: 'Bác sĩ không muốn bạn biết: chỉ cần 3 ngày dùng combo trà thảo mộc của chúng tôi là thải sạch độc tố trong cơ thể.', ok: false, e: 'Đáng ngờ: dùng chiêu “bác sĩ giấu bạn”, hứa “thải sạch độc tố” và kèm bán sản phẩm.' },
    { t: 'Thực phẩm chức năng này giúp người bệnh tiểu đường bỏ hẳn thuốc và không cần tiêm insulin.', ok: false, e: 'Đáng ngờ và nguy hiểm: thực phẩm chức năng không thay thế thuốc điều trị. Tự ý bỏ thuốc có thể gây hại nghiêm trọng, cần hỏi bác sĩ.' },
    { t: 'Trẻ sốt kèm co giật, li bì hoặc khó thở là dấu hiệu nguy hiểm, cần đưa đến cơ sở y tế ngay.', ok: true, e: 'Đáng tin: đây là lời khuyên an toàn, không hứa chữa bệnh tại nhà và hướng người đọc đến cơ sở y tế.' }
  ];
  var i = 0, sc = 0, box = document.getElementById('qzBox');
  function render() {
    if (i >= Q.length) {
      box.innerHTML = '<h3>Hoàn thành!</h3><p>Bạn nhận diện đúng <b>' + sc + '/' + Q.length + '</b> tin. ' + (sc >= 4 ? 'Rất tốt, hãy chia sẻ cách Dừng – Soi – Hỏi cho người thân.' : 'Hãy đọc lại 3 bước và 6 thủ thuật phía trên rồi thử lại.') + '</p><button type="button" id="qzRe">Làm lại</button>';
      document.getElementById('qzRe').onclick = function () { i = 0; sc = 0; render(); };
      return;
    }
    var q = Q[i];
    box.innerHTML = '<p class="sub">Tin ' + (i + 1) + '/' + Q.length + '</p><div class="qz-claim">“' + q.t + '”</div><div class="qz-row"><button type="button" id="qzY">Đáng tin</button><button type="button" class="ghost" style="margin-left:0" id="qzN">Đáng ngờ</button></div><div id="qzFb"></div>';
    function pick(v) {
      var good = v === q.ok;
      if (good) sc++;
      document.getElementById('qzY').disabled = true;
      document.getElementById('qzN').disabled = true;
      var fb = document.getElementById('qzFb');
      fb.className = 'qz-fb ' + (good ? 'ok' : 'bad');
      fb.innerHTML = '<b>' + (good ? 'Chính xác. ' : 'Chưa đúng. ') + '</b>' + q.e + '<br><button type="button" id="qzNx">' + (i + 1 < Q.length ? 'Tin tiếp theo' : 'Xem kết quả') + '</button>';
      document.getElementById('qzNx').onclick = function () { i++; render(); };
    }
    document.getElementById('qzY').onclick = function () { pick(true); };
    document.getElementById('qzN').onclick = function () { pick(false); };
  }
  render();

  var U = location.origin + location.pathname, m = document.getElementById('shMsg');
  document.getElementById('shFb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(U);
  function cp() {
    try {
      navigator.clipboard.writeText(U).then(function () { m.textContent = 'Đã sao chép liên kết.'; }, function () { m.textContent = U; });
    } catch (e) { m.textContent = U; }
  }
  document.getElementById('shCopy').onclick = cp;
  document.getElementById('shNative').onclick = function () {
    if (navigator.share) {
      navigator.share({ title: 'Y-Check', text: 'Dừng – Soi – Hỏi trước khi chia sẻ tin sức khỏe', url: U }).catch(function () {});
    } else cp();
  };
})();
