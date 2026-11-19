(function () {
  'use strict';

  /* =========================================================
     1. CHẾ ĐỘ CHỮ TO – DỄ ĐỌC (Góc trên bên phải + lưu cài đặt)
     ========================================================= */
  var bigBtn = document.getElementById('bigBtn');
  function setBigMode(on) {
    document.documentElement.classList.toggle('big', on);
    if (bigBtn) bigBtn.setAttribute('aria-checked', String(on));
    try { localStorage.setItem('ycheck_big', on ? '1' : '0'); } catch (e) {}
  }
  try {
    if (localStorage.getItem('ycheck_big') === '1') setBigMode(true);
  } catch (e) {}
  if (bigBtn) {
    bigBtn.addEventListener('click', function () {
      setBigMode(!document.documentElement.classList.contains('big'));
    });
  }

  /* =========================================================
     2. TỰ ĐỘNG BẮT TỪ KHÓA CẢNH BÁO (BƯỚC DỪNG)
     ========================================================= */
  var KEYWORD_GROUPS = [
    {
      flag: 'urgent',
      label: 'Giật gân / giục gấp',
      words: [
        'chia sẻ gấp', 'chia sẻ ngay', 'cảnh báo khẩn', 'cảnh báo sốc', 'sốc',
        'kinh hoàng', 'cứu người thân', 'bác sĩ không muốn bạn biết',
        'bệnh viện giấu', 'chỉ còn hôm nay', 'đừng bỏ qua', 'cấp bách',
        'nguy cơ tử vong', 'gây ung thư ngay'
      ]
    },
    {
      flag: 'cure',
      label: 'Hứa chữa khỏi / bỏ thuốc',
      words: [
        'chữa khỏi hoàn toàn', 'chữa khỏi', 'dứt điểm', 'thải sạch độc tố',
        'thải độc', 'detox', 'không cần đi khám', 'bỏ hẳn thuốc', 'bỏ thuốc',
        'thay thế thuốc', 'thần dược', '100% khỏi', 'khỏi sau 3 ngày',
        'khỏi ngay', 'hết hẳn'
      ]
    },
    {
      flag: 'sell',
      label: 'Kêu gọi mua hàng / để lại SĐT',
      words: [
        'mua ngay', 'đặt hàng ngay', 'đặt hàng', 'để lại số điện thoại',
        'để lại sđt', 'inbox ngay', 'nhắn tin ngay', 'combo', 'giảm giá sốc',
        'ưu đãi hôm nay', 'liên hệ ngay', 'độc quyền'
      ]
    }
  ];

  var ALL_KW = [];
  KEYWORD_GROUPS.forEach(function (g) {
    g.words.forEach(function (w) {
      ALL_KW.push({ word: w, flag: g.flag, label: g.label });
    });
  });
  ALL_KW.sort(function (a, b) { return b.word.length - a.word.length; });

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  var claimEl = document.getElementById('claim');
  var scanBox = document.getElementById('scanBox');
  var scanTitle = document.getElementById('scanTitle');
  var scanCount = document.getElementById('scanCount');
  var scanPreview = document.getElementById('scanPreview');
  var scanHint = document.getElementById('scanHint');

  var kwRegex = new RegExp('(' + ALL_KW.map(function (k) { return escapeRegex(k.word); }).join('|') + ')', 'gi');

  function scanClaim(autoCheckFlags) {
    var text = (claimEl.value || '').trim();
    if (!text) {
      scanBox.hidden = true;
      return { count: 0, flags: {} };
    }

    var foundCount = 0;
    var foundFlags = {};
    var safeText = escapeHtml(text);

    var highlighted = safeText.replace(kwRegex, function (match) {
      foundCount++;
      var low = match.toLowerCase();
      for (var i = 0; i < ALL_KW.length; i++) {
        if (ALL_KW[i].word === low) {
          foundFlags[ALL_KW[i].flag] = true;
          break;
        }
      }
      return '<mark class="hl-flag">' + match + '</mark>';
    });

    scanBox.hidden = false;
    scanPreview.innerHTML = highlighted;

    if (foundCount > 0) {
      scanBox.classList.remove('clean');
      scanTitle.textContent = 'Bước Dừng: Phát hiện cụm từ có dấu hiệu cảnh báo';
      scanCount.textContent = foundCount + ' TỪ KHÓA';
      scanHint.textContent = 'Hệ thống đã tô đỏ các cụm từ giật gân, hứa hẹn quá mức hoặc kêu gọi mua hàng và tự động đánh dấu giúp bạn ở Bước Dừng bên dưới.';
    } else {
      scanBox.classList.add('clean');
      scanTitle.textContent = 'Bước Dừng: Chưa thấy từ khóa giật gân phổ biến';
      scanCount.textContent = '0 TỪ KHÓA';
      scanHint.textContent = 'Không có từ khóa đỏ không đồng nghĩa tin chắc chắn đúng — bạn vẫn nên trả lời 4 câu hỏi Soi bên dưới.';
    }

    if (autoCheckFlags) {
      document.querySelectorAll('input[name="flag"]').forEach(function (cb) {
        var key = cb.getAttribute('data-flag');
        if (foundFlags[key]) cb.checked = true;
      });
    }
    return { count: foundCount, flags: foundFlags };
  }

  claimEl.addEventListener('input', function () {
    scanClaim(true);
  });

  /* =========================================================
     3. TIN ĐỒN MẪU BẤM THỬ NGAY TRONG 10 GIÂY
     ========================================================= */
  var SAMPLES = {
    lemon: {
      claim: 'Cảnh báo khẩn! Uống nước chanh muối mỗi sáng sẽ chữa khỏi hoàn toàn cảm cúm, không cần đi khám. Chia sẻ gấp để cứu người thân và mua ngay combo chanh mật ong!',
      flags: ['urgent', 'cure', 'sell'],
      q: { q1: '0', q2: '0', q3: '0', q4: '0' },
      note: 'Đang dùng mẫu Đèn Đỏ (“Nước chanh muối chữa cảm”). Bạn có thể sửa bất kỳ đáp án nào để xem điểm thay đổi.'
    },
    detox: {
      claim: 'Chuyên gia bật mí: Chỉ cần uống nước ép detox thải độc 3 ngày là sạch hết độc tố tích tụ trong gan thận. Xem ngay kẻo lỡ!',
      flags: ['cure'],
      q: { q1: '1', q2: '1', q3: '1', q4: '1' },
      note: 'Đang dùng mẫu Đèn Vàng (“Detox thải độc 3 ngày”). Tin thiếu bằng chứng và nguồn kiểm chứng rõ ràng.'
    },
    who: {
      claim: 'Rửa tay bằng xà phòng đúng cách giúp giảm nguy cơ mắc các bệnh đường tiêu hóa và hô hấp. Khuyến cáo chính thức từ Bộ Y tế và Tổ chức Y tế Thế giới (WHO), cập nhật năm 2026.',
      flags: [],
      q: { q1: '2', q2: '2', q3: '2', q4: '2' },
      note: 'Đang dùng mẫu Đèn Xanh (“Rửa tay xà phòng theo WHO”). Tin nêu rõ nguồn chính thống và không bán hàng.'
    }
  };

  function applySample(key, scrollToTool) {
    var s = SAMPLES[key];
    if (!s) return;
    claimEl.value = s.claim;
    document.querySelectorAll('input[name="flag"]').forEach(function (cb) {
      cb.checked = s.flags.indexOf(cb.getAttribute('data-flag')) !== -1;
    });
    scanClaim(true);
    Object.keys(s.q).forEach(function (qn) {
      var radio = document.querySelector('input[name="' + qn + '"][value="' + s.q[qn] + '"]');
      if (radio) radio.checked = true;
    });
    evaluateTool(s.note);
    if (scrollToTool) {
      var target = document.getElementById('soi');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  document.querySelectorAll('[data-sample]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var fromOutside = !btn.closest('#soi');
      applySample(btn.getAttribute('data-sample'), fromOutside);
    });
  });

  /* =========================================================
     4. CHẤM ĐIỂM ĐÈN TÍN HIỆU + TIN NHẮN GỬI NHÓM ZALO GIA ĐÌNH
     ========================================================= */
  var res = document.getElementById('result');

  function buildZaloMessage(k, score, flagsCount) {
    var rawClaim = (claimEl.value || '').trim();
    var shortClaim = rawClaim ? ' (“' + rawClaim.slice(0, 75) + (rawClaim.length > 75 ? '…' : '') + '”)' : '';

    if (k === 'r') {
      return (
        'Bố mẹ và cả nhà ơi, thông tin này' + shortClaim +
        ' con vừa kiểm tra nhanh bằng công cụ Y-Check (Dừng – Soi – Hỏi) thì ra ĐÈN ĐỎ (' + score + '/8 điểm)' +
        (flagsCount ? ', có ' + flagsCount + ' dấu hiệu cảnh báo như giật gân, hứa chữa khỏi hoặc kêu gọi mua hàng' : '') +
        '. Nhà mình khoan vội tin hay chia sẻ nhé! Nếu cần chăm sóc sức khỏe, cả nhà cứ hỏi bác sĩ hoặc xem thông tin từ Bộ Y tế ạ.'
      );
    }
    if (k === 'a') {
      return (
        'Cả nhà ơi, thông tin này' + shortClaim +
        ' con kiểm tra trên Y-Check thì đang ở mức ĐÈN VÀNG (' + score + '/8 điểm) — còn thiếu nguồn kiểm chứng rõ ràng. ' +
        'Nhà mình tạm khoan chia sẻ vội, để con đối chiếu thêm trên trang Bộ Y tế hoặc hỏi bác sĩ cho chắc chắn nha!'
      );
    }
    return (
      'Cả nhà ơi, thông tin này' + shortClaim +
      ' con kiểm tra theo 4 câu hỏi Y-Check thì đạt ĐÈN XANH (' + score + '/8 điểm), có nguồn uy tín để tham khảo. ' +
      'Tuy nhiên nếu áp dụng cho bệnh lý cá nhân thì bố mẹ vẫn nhớ hỏi thêm bác sĩ hoặc dược sĩ cho an toàn nhé!'
    );
  }

  function copyText(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { onDone(true); }, function () { fallbackCopy(text, onDone); });
    } else {
      fallbackCopy(text, onDone);
    }
  }
  function fallbackCopy(text, onDone) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); onDone(true); } catch (e) { onDone(false); }
    document.body.removeChild(ta);
  }

  function evaluateTool(sampleNote) {
    var s = 0, m = 0;
    for (var i = 1; i <= 4; i++) {
      var c = document.querySelector('input[name=q' + i + ']:checked');
      if (c) s += +c.value; else m++;
    }
    if (m) {
      res.className = 'a';
      res.innerHTML = '<h3>Bạn chưa trả lời hết</h3><p>Hãy chọn đáp án cho cả 4 câu hỏi ở bước Soi.</p>';
      return;
    }
    var f = document.querySelectorAll('input[name=flag]:checked').length;
    var sc = Math.max(0, s - f);
    var k, t, b;
    if (sc >= 7) {
      k = 'g';
      t = 'Đèn Xanh · Có thể tham khảo';
      b = 'Tin này vượt qua phần lớn bước kiểm tra. Bạn vẫn nên hỏi bác sĩ hoặc dược sĩ nếu muốn áp dụng cho bản thân.';
    } else if (sc >= 4) {
      k = 'a';
      t = 'Đèn Vàng · Chưa đủ tin cậy';
      b = 'Còn thiếu thông tin kiểm chứng. Khoan chia sẻ; hãy đối chiếu trên trang Bộ Y tế, WHO hoặc bệnh viện lớn.';
    } else {
      k = 'r';
      t = 'Đèn Đỏ · Đừng chia sẻ, đừng làm theo';
      b = 'Tin này có nhiều dấu hiệu đáng ngờ. Hãy kiểm tra từ nguồn chính thống hoặc hỏi người có chuyên môn.';
    }

    // Đồng bộ đèn tín hiệu 3D trên sân khấu
    if (typeof window.ycheckSetSignal === 'function') {
      window.ycheckSetSignal(k);
    }

    res.className = k;
    res.innerHTML =
      '<h3><span class="dot ' + k + '" aria-hidden="true"></span><span>' + t + ' (' + sc + '/8)</span></h3>' +
      '<p>' + b + '</p>' +
      (f ? '<p><strong>Bước Dừng:</strong> Phát hiện ' + f + ' dấu hiệu cảnh báo nên điểm bị trừ tương ứng.</p>' : '') +
      (sampleNote ? '<p><small><em>Ghi chú: ' + escapeHtml(sampleNote) + '</em></small></p>' : '') +
      '<p><strong>Lưu ý an toàn:</strong> Có triệu chứng cá nhân hãy đến cơ sở y tế. Có dấu hiệu nguy hiểm gọi ngay <b>115</b>.</p>' +
      '<div class="res-actions">' +
        '<button id="zaloBtn" class="btn-zalo" type="button">Tạo tin nhắn gửi nhóm Zalo gia đình</button>' +
        '<button id="shr" class="ghost" type="button">Tạo ảnh để chia sẻ</button>' +
      '</div>' +
      '<div id="zaloWrap"></div>' +
      '<div id="shimg"></div>';

    document.getElementById('zaloBtn').onclick = function () {
      var zaloWrap = document.getElementById('zaloWrap');
      var msg = buildZaloMessage(k, sc, f);
      zaloWrap.innerHTML =
        '<div class="zalo-box">' +
          '<h4>Tin nhắn mẫu gửi nhóm Zalo gia đình (có thể chỉnh sửa trước khi gửi)</h4>' +
          '<textarea id="zaloTa" class="zalo-text">' + escapeHtml(msg) + '</textarea>' +
          '<div class="zalo-row">' +
            '<button type="button" id="zaloCopy" class="btn-zalo">Sao chép tin nhắn Zalo</button>' +
            '<span id="zaloMsg" class="zalo-msg" role="status"></span>' +
          '</div>' +
        '</div>';
      document.getElementById('zaloCopy').onclick = function () {
        var val = document.getElementById('zaloTa').value;
        var st = document.getElementById('zaloMsg');
        copyText(val, function (ok) {
          st.textContent = ok ? 'Đã sao chép. Bạn mở Zalo và dán gửi cho bố mẹ, ông bà nhé.' : 'Hãy bôi đen đoạn trên để sao chép.';
        });
      };
    };

    document.getElementById('shr').onclick = function () {
      shareResultImage(k, t, sc);
    };
  }

  document.getElementById('go').onclick = function () { evaluateTool(''); };
  document.getElementById('reset').onclick = function () {
    document.querySelectorAll('#soi input[type=radio],#soi input[type=checkbox]').forEach(function (x) { x.checked = false; });
    claimEl.value = '';
    scanBox.hidden = true;
    res.className = '';
    res.innerHTML = '';
    if (typeof window.ycheckSetSignal === 'function') window.ycheckSetSignal('auto');
  };

  function shareResultImage(k, t, score) {
    var c = document.createElement('canvas'); c.width = 1080; c.height = 1350;
    var x = c.getContext('2d');
    var col = { g: '#2FD17B', a: '#F5AD27', r: '#FF5A4E' }[k];
    function wrap(s, y, lh) {
      var w = s.split(' '), l = '';
      for (var i = 0; i < w.length; i++) {
        var q = l + w[i] + ' ';
        if (x.measureText(q).width > 900 && l) { x.fillText(l, 540, y); y += lh; l = w[i] + ' '; }
        else l = q;
      }
      x.fillText(l, 540, y); return y + lh;
    }
    x.fillStyle = '#0B1715'; x.fillRect(0, 0, 1080, 1350);
    x.fillStyle = col; x.beginPath(); x.arc(540, 420, 225, 0, 7); x.fill();
    x.textAlign = 'center'; x.fillStyle = '#fff'; x.font = '800 136px "Be Vietnam Pro",sans-serif';
    x.fillText(score + '/8', 540, 468);
    x.font = '800 56px "Be Vietnam Pro",sans-serif';
    var y = wrap(t, 780, 72);
    var cl = claimEl.value.trim().slice(0, 110);
    if (cl) {
      x.fillStyle = '#D6E4DF'; x.font = '400 34px "Be Vietnam Pro",sans-serif';
      wrap('“' + cl + '”', y + 26, 46);
    }
    x.fillStyle = '#F5AD27'; x.font = '800 44px "Be Vietnam Pro",sans-serif';
    x.fillText('Y-Check · Dừng – Soi – Hỏi', 540, 1210);
    x.fillStyle = '#9CB0A8'; x.font = '400 26px "Be Vietnam Pro",sans-serif';
    x.fillText('Công cụ tham khảo, không thay thế tư vấn y tế', 540, 1262);
    var box = document.getElementById('shimg'); box.innerHTML = '';
    var im = new Image(); im.src = c.toDataURL('image/png'); im.alt = 'Ảnh kết quả Soi tin';
    im.style.cssText = 'max-width:260px;width:100%;border-radius:4px;margin-top:12px;display:block;border:1px solid #1D2A26';
    box.appendChild(im);
    box.insertAdjacentHTML('beforeend', '<p>Nhấn giữ ảnh (điện thoại) hoặc bấm chuột phải (máy tính) để lưu, rồi gửi lên Zalo hoặc mạng xã hội.</p>');
  }

  /* =========================================================
     5. TRÌNH PHÁT KỊCH BẢN VIDEO “Y-CHECK 60 GIÂY”
     ========================================================= */
  var VIDEOS = {
    ep1: [
      { t: '00:00', pct: 25, cls: 'r', badge: '0–15S · DỪNG', head: 'Khoan bấm chia sẻ!', cap: 'Bài đăng hứa “uống nước chanh muối chữa khỏi hoàn toàn cảm cúm” và giục chia sẻ gấp — dấu hiệu cần DỪNG ngay.' },
      { t: '00:15', pct: 55, cls: 'a', badge: '15–35S · SOI', head: 'Hỏi 4 câu trong 20 giây', cap: 'Ai nói? Không có bác sĩ hay nghiên cứu. Đối chiếu Bộ Y tế & WHO: chưa có bằng chứng nước chanh muối là thuốc chữa cúm.' },
      { t: '00:35', pct: 80, cls: 'g', badge: '35–50S · HỎI', head: 'Chăm sóc đúng cách', cap: 'Nghỉ ngơi, uống đủ nước ấm để dịu họng. Nếu sốt cao kéo dài, khó thở hay trẻ nhỏ bị sốt: đi khám cơ sở y tế sớm.' },
      { t: '00:50', pct: 100, cls: 'g', badge: '50–60S · KẾT LUẬN', head: 'Dừng – Soi – Hỏi cùng Y-Check', cap: 'Gửi ngay công cụ Y-Check cho bố mẹ, ông bà để cùng phòng tránh tin sai sức khỏe.' }
    ],
    ep2: [
      { t: '00:00', pct: 25, cls: 'r', badge: '0–15S · DỪNG', head: '“Thải sạch độc tố sau 3 ngày”?', cap: 'Quảng cáo kèm bán combo trà detox, dùng chiêu “bác sĩ không muốn bạn biết” — DỪNG lại ngay trước khi mua.' },
      { t: '00:15', pct: 55, cls: 'a', badge: '15–35S · SOI', head: 'Cơ thể bạn tự thải độc mỗi ngày', cap: 'Gan, thận, phổi và da đã làm nhiệm vụ lọc và đào thải tự nhiên. Chưa có bằng chứng trà detox làm tốt hơn cơ thể.' },
      { t: '00:35', pct: 80, cls: 'g', badge: '35–50S · HỎI', head: 'Rủi ro khi lạm dụng detox', cap: 'Nhịn ăn kéo dài hoặc uống sản phẩm không rõ nguồn gốc có thể gây tụt đường huyết, hại gan thận.' },
      { t: '00:50', pct: 100, cls: 'g', badge: '50–60S · KẾT LUẬN', head: 'Ăn đa dạng · Ngủ đủ · Vận động', cap: 'Dùng Y-Check kiểm chứng trước khi mua hay chia sẻ bất kỳ sản phẩm “thần dược” nào.' }
    ]
  };

  var vidTimers = {};
  document.querySelectorAll('.vid-card').forEach(function (card) {
    var id = card.getAttribute('data-vid');
    var scenes = VIDEOS[id];
    var playBtn = card.querySelector('.vid-play');
    var badge = card.querySelector('.vid-step-badge');
    var head = card.querySelector('.vid-headline');
    var cap = card.querySelector('.vid-caption');
    var timerEl = card.querySelector('.vid-timer');
    var bar = card.querySelector('.vid-prog-bar');
    var step = 0;

    function stop() {
      if (vidTimers[id]) { clearInterval(vidTimers[id]); vidTimers[id] = null; }
      playBtn.textContent = 'Phát thử kịch bản';
    }
    function show(idx) {
      var sc = scenes[idx];
      badge.className = 'vid-step-badge mono ' + sc.cls;
      badge.textContent = sc.badge;
      head.textContent = sc.head;
      cap.textContent = sc.cap;
      timerEl.textContent = sc.t + ' / 01:00';
      bar.style.width = sc.pct + '%';
    }

    playBtn.addEventListener('click', function () {
      if (vidTimers[id]) { stop(); return; }
      step = 0;
      show(step);
      playBtn.textContent = 'Tạm dừng';
      vidTimers[id] = setInterval(function () {
        step++;
        if (step >= scenes.length) {
          stop();
          playBtn.textContent = 'Xem lại 60s';
          return;
        }
        show(step);
      }, 3200);
    });
  });

  /* =========================================================
     6. TẢI ẢNH THẺ 4 CÂU HỎI (PNG) & IN / LƯU PDF
     ========================================================= */
  var dlCardBtn = document.getElementById('dlCardPng');
  var printCardBtn = document.getElementById('printCardPdf');
  var dlCardMsg = document.getElementById('dlCardMsg');

  if (dlCardBtn) {
    dlCardBtn.addEventListener('click', function () {
      var c = document.createElement('canvas');
      c.width = 1080; c.height = 1350;
      var x = c.getContext('2d');

      function drawWrapped(text, px, py, maxW, lh) {
        var words = text.split(' '), line = '';
        for (var i = 0; i < words.length; i++) {
          var test = line + words[i] + ' ';
          if (x.measureText(test).width > maxW && line) {
            x.fillText(line.trim(), px, py);
            py += lh;
            line = words[i] + ' ';
          } else {
            line = test;
          }
        }
        x.fillText(line.trim(), px, py);
        return py + lh;
      }

      x.fillStyle = '#F5F3EE'; x.fillRect(0, 0, 1080, 1350);
      x.fillStyle = '#0B1715'; x.fillRect(48, 48, 984, 240);
      x.fillStyle = '#F5AD27'; x.font = '700 24px "JetBrains Mono",monospace';
      x.fillText('Y-CHECK · THẺ BỎ TÚI 30 GIÂY', 90, 112);
      x.fillStyle = '#FFFFFF'; x.font = '800 48px "Be Vietnam Pro",sans-serif';
      x.fillText('Thấy tin sức khỏe lạ? Nhớ:', 90, 182);
      x.fillStyle = '#FF5A4E'; x.fillText('DỪNG', 90, 248);
      x.fillStyle = '#FFFFFF'; x.fillText(' – ', 245, 248);
      x.fillStyle = '#F5AD27'; x.fillText('SOI', 300, 248);
      x.fillStyle = '#FFFFFF'; x.fillText(' – ', 396, 248);
      x.fillStyle = '#2FD17B'; x.fillText('HỎI', 450, 248);

      x.fillStyle = '#FFFFFF'; x.fillRect(48, 288, 984, 930);
      x.strokeStyle = '#121A18'; x.lineWidth = 4; x.strokeRect(48, 48, 984, 1170);

      var y = 355;
      x.fillStyle = '#C62E24'; x.font = '800 34px "Be Vietnam Pro",sans-serif';
      x.fillText('1. DỪNG — Chưa vội tin, chưa vội chia sẻ', 90, y);
      y += 46;
      x.fillStyle = '#121A18'; x.font = '400 28px "Be Vietnam Pro",sans-serif';
      y = drawWrapped('Cẩn thận nếu thấy: giật gân, giục chia sẻ gấp, hứa “chữa khỏi hoàn toàn”, hoặc kèm bán hàng.', 90, y, 900, 40);

      y += 26;
      x.fillStyle = '#9A6208'; x.font = '800 34px "Be Vietnam Pro",sans-serif';
      x.fillText('2. SOI — Tự kiểm tra bằng 4 câu hỏi', 90, y);
      y += 48;
      var qs = [
        '01. Ai nói? Có chuyên môn rõ ràng, có đang bán hàng không?',
        '02. Bằng chứng nào? Có dẫn nghiên cứu hay cơ quan y tế cụ thể?',
        '03. Khi nào đăng? Có ngày tháng và còn cập nhật hiện nay?',
        '04. Nơi khác có nói vậy không? Đối chiếu Bộ Y tế, WHO, bệnh viện lớn.'
      ];
      x.fillStyle = '#121A18'; x.font = '500 28px "Be Vietnam Pro",sans-serif';
      qs.forEach(function (q) { y = drawWrapped(q, 90, y, 900, 40) + 10; });

      y += 22;
      x.fillStyle = '#136F40'; x.font = '800 34px "Be Vietnam Pro",sans-serif';
      x.fillText('3. HỎI — Hỏi nguồn y tế đáng tin', 90, y);
      y += 46;
      x.fillStyle = '#121A18'; x.font = '400 28px "Be Vietnam Pro",sans-serif';
      drawWrapped('Vấn đề sức khỏe cá nhân: đến cơ sở y tế. Có dấu hiệu nguy hiểm (khó thở, đau ngực, co giật...): gọi ngay cấp cứu 115.', 90, y, 900, 40);

      x.fillStyle = '#4B5753'; x.font = '500 23px "Be Vietnam Pro",sans-serif';
      x.fillText('Y-Check · Cuộc thi “1.000 ý tưởng chăm sóc sức khỏe Việt” 2026 · Chỉ mang tính tham khảo', 90, 1280);

      var link = document.createElement('a');
      link.download = 'The-4-cau-hoi-Y-Check.png';
      link.href = c.toDataURL('image/png');
      link.click();
      if (dlCardMsg) dlCardMsg.textContent = 'Đã tải ảnh Thẻ 4 câu hỏi (PNG).';
    });
  }

  if (printCardBtn) {
    printCardBtn.addEventListener('click', function () {
      window.print();
    });
  }

  /* =========================================================
     7. MODAL BÁO CÁO SAI SÓT (CAM KẾT XỬ LÝ TRONG 24 GIỜ)
     ========================================================= */
  var modal = document.getElementById('reportModal');
  var rpArticle = document.getElementById('rpArticle');
  var rpReason = document.getElementById('rpReason');
  var rpDetail = document.getElementById('rpDetail');
  var rpContact = document.getElementById('rpContact');
  var rpForm = document.getElementById('rpForm');
  var rpMsg = document.getElementById('rpMsg');
  var rpSubmit = document.getElementById('rpSubmit');

  function openModal(articleTitle) {
    rpArticle.value = articleTitle || '';
    rpDetail.value = '';
    rpContact.value = '';
    rpMsg.textContent = '';
    rpMsg.className = 'rp-msg';
    rpSubmit.disabled = false;
    modal.hidden = false;
    rpDetail.focus();
  }
  function closeModal() {
    modal.hidden = true;
  }

  document.querySelectorAll('.report-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn.getAttribute('data-article'));
    });
  });

  document.getElementById('rpClose').addEventListener('click', closeModal);
  document.getElementById('rpCancel').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  rpForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var detail = rpDetail.value.trim();
    if (!detail) {
      rpMsg.className = 'rp-msg err';
      rpMsg.textContent = 'Vui lòng nhập nội dung cần góp ý hoặc chỉnh sửa.';
      return;
    }
    rpSubmit.disabled = true;
    rpMsg.className = 'rp-msg';
    rpMsg.textContent = 'Đang gửi báo cáo...';

    fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article: rpArticle.value,
        reason: rpReason.value,
        detail: detail,
        contact: rpContact.value.trim()
      })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (resObj) {
        if (!resObj.ok) throw new Error('server_err');
        rpMsg.textContent = 'Đã ghi nhận (Mã ' + (resObj.d.id || 'YC') + '). Nhóm Y-Check cam kết rà soát và chỉnh sửa trong vòng 24 giờ.';
        rpDetail.value = '';
      })
      .catch(function () {
        rpMsg.textContent = 'Đã ghi nhận góp ý của bạn. Nhóm Y-Check cam kết rà soát và chỉnh sửa trong vòng 24 giờ (hoặc gửi trực tiếp tới thao1.123lls@gmail.com).';
      })
      .then(function () {
        rpSubmit.disabled = false;
      });
  });
})();
