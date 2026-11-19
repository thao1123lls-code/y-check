(function () {
  'use strict';
  var fab = document.getElementById('cbFab'),
      pn = document.getElementById('cbPanel'),
      log = document.getElementById('cbLog'),
      inp = document.getElementById('cbIn'),
      chips = document.getElementById('cbChips'),
      hist = [],
      busy = false,
      greeted = false;

  function add(cls, text) {
    var d = document.createElement('div');
    d.className = 'msg ' + cls;
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function toggle(open) {
    pn.hidden = !open;
    fab.setAttribute('aria-expanded', open);
    if (open) {
      if (!greeted) {
        greeted = true;
        add('b', 'Xin chào, mình là Y-Check Bot. Bạn gặp tin sức khỏe nào đang nghi ngờ? Dán vào đây, mình cùng bạn Dừng – Soi – Hỏi nhé.');
      }
      inp.focus();
    }
  }

  fab.onclick = function () { toggle(pn.hidden); };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !pn.hidden) { toggle(false); fab.focus(); }
  });

  function ask(text) {
    text = text.trim();
    if (!text || busy) return;
    inp.value = '';
    chips.style.display = 'none';
    add('u', text);
    hist.push({ role: 'user', content: text });

    busy = true;
    var el = add('b', '…');

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: hist.slice(-7) })
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, status: res.status, data: data }; });
      })
      .then(function (r) {
        if (!r.ok) throw { status: r.status, message: r.data && r.data.error };
        el.textContent = r.data.reply;
        hist.push({ role: 'assistant', content: r.data.reply });
        log.scrollTop = log.scrollHeight;
      })
      .catch(function (e) {
        hist.pop();
        el.textContent =
          e && e.status === 429 ? 'Đang có quá nhiều yêu cầu, bạn thử lại sau ít phút nhé.' :
          e && e.status === 503 ? 'Trợ lý AI chưa được cấu hình. Bạn vẫn có thể dùng công cụ Soi tin ở đầu trang.' :
          'Có lỗi xảy ra, bạn thử lại sau nhé.';
      })
      .then(function () { busy = false; });
  }

  document.getElementById('cbSend').onclick = function () { ask(inp.value); };
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); ask(inp.value); }
  });
  chips.querySelectorAll('button').forEach(function (b) {
    b.onclick = function () { ask(b.textContent); };
  });
})();
