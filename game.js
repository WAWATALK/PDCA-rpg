/* ══════════════════════════════
   PDCA-RPG  |  共用 JS
   ══════════════════════════════ */

/* ── 畫面切換 ── */
const _hist = [];

function go(id){
  const cur = document.querySelector('.scr.on');
  if(cur) _hist.push(cur.id);
  if(_hist.length > 30) _hist.shift();
  document.querySelectorAll('.scr').forEach(s => s.classList.remove('on'));
  const el = document.getElementById(id);
  if(el){ el.classList.add('on'); el.scrollTop = 0; }
}

function goBack(){
  if(_hist.length === 0){ 
    if(typeof onBackEmpty === 'function') onBackEmpty();
    return; 
  }
  const prev = _hist.pop();
  document.querySelectorAll('.scr').forEach(s => s.classList.remove('on'));
  const el = document.getElementById(prev);
  if(el){ el.classList.add('on'); el.scrollTop = 0; }
}

/* ── 場景淡入淡出切換 ── */
function fadeScene(callback, duration = 400){
  const mask = document.getElementById('scene-mask');
  if(!mask){ if(callback) callback(); return; }
  mask.classList.add('fade-in');
  setTimeout(() => {
    if(callback) callback();
    mask.classList.remove('fade-in');
  }, duration);
}

/* ── 打字機效果 ── */
let _typeTimer = null;

function typeText(elementId, text, speed = 40, onDone){
  const el = document.getElementById(elementId);
  if(!el) return;
  if(_typeTimer) clearInterval(_typeTimer);
  el.textContent = '';
  let i = 0;
  // 點擊跳過
  el._skipTyping = false;
  el.onclick = () => {
    el._skipTyping = true;
    el.onclick = null;
  };
  _typeTimer = setInterval(() => {
    if(el._skipTyping){
      clearInterval(_typeTimer);
      el.textContent = text;
      el.onclick = null;
      if(onDone) onDone();
      return;
    }
    el.textContent += text[i];
    i++;
    if(i >= text.length){
      clearInterval(_typeTimer);
      el.onclick = null;
      if(onDone) onDone();
    }
  }, speed);
}

/* ── 對話佇列系統 ── */
let _dlgQueue = [];
let _dlgIndex = 0;
let _dlgCb = null;

function startDialog(lines, onFinish){
  // lines = [{spk, txt, npc?}, ...]
  _dlgQueue = lines;
  _dlgIndex = 0;
  _dlgCb = onFinish || null;
  showDlgLine(0);
}

function showDlgLine(i){
  const line = _dlgQueue[i];
  if(!line) return;
  const spkEl = document.getElementById('dlg-spk');
  const txtEl = document.getElementById('dlg-txt');
  const btnEl = document.getElementById('dlg-btn');
  if(spkEl) spkEl.textContent = line.spk;
  if(btnEl) btnEl.style.display = 'none';
  if(line.npc) highlightNPC(line.npc);
  typeText('dlg-txt', line.txt, 38, () => {
    if(btnEl) btnEl.style.display = 'block';
  });
}

function nextDialog(){
  _dlgIndex++;
  if(_dlgIndex < _dlgQueue.length){
    showDlgLine(_dlgIndex);
  } else {
    const cb = _dlgCb;
    _dlgQueue = []; _dlgIndex = 0; _dlgCb = null;
    if(cb) cb();
  }
}

/* ── NPC 高亮 ── */
function highlightNPC(id){
  document.querySelectorAll('.npc').forEach(n => {
    n.className = 'npc' + (n.id === id ? ' lit' : ' dim');
  });
}
function resetNPCs(){
  document.querySelectorAll('.npc').forEach(n => n.className = 'npc');
}

/* ── 走路動畫 ── */
function walkPlayer(targetBottom, targetLeft, onDone){
  const pl = document.getElementById('player');
  if(!pl){ if(onDone) onDone(); return; }
  pl.classList.add('walking');
  if(targetLeft !== null) pl.style.left = targetLeft;
  pl.style.bottom = targetBottom;
  setTimeout(() => {
    pl.classList.remove('walking');
    if(onDone) onDone();
  }, 900);
}

function enterScene(startBottom, endBottom, onDone){
  const pl = document.getElementById('player');
  if(!pl){ if(onDone) onDone(); return; }
  pl.style.transition = 'none';
  pl.style.bottom = startBottom;
  pl.style.opacity = '0';
  pl.classList.remove('walking');
  setTimeout(() => {
    pl.style.transition = 'bottom 1.1s cubic-bezier(.25,0,.35,1), opacity .5s';
    pl.style.opacity = '1';
    pl.style.bottom = endBottom;
    pl.classList.add('walking');
    setTimeout(() => {
      pl.classList.remove('walking');
      if(onDone) onDone();
    }, 1200);
  }, 100);
}

/* ── null 安全 helpers ── */
function $el(id){ return document.getElementById(id); }
function $show(id){ const e = $el(id); if(e) e.style.display = 'block'; }
function $hide(id){ const e = $el(id); if(e) e.style.display = 'none'; }
function $flex(id){ const e = $el(id); if(e) e.style.display = 'flex'; }
function $txt(id, v){ const e = $el(id); if(e) e.textContent = v; }
function $html(id, v){ const e = $el(id); if(e) e.innerHTML = v; }

/* ── 場景遮罩（確保存在）── */
document.addEventListener('DOMContentLoaded', () => {
  if(!document.getElementById('scene-mask')){
    const mask = document.createElement('div');
    mask.id = 'scene-mask';
    document.body.appendChild(mask);
  }
});

/* ── 小麻雀寶典劇情：看到書 → 倒下 → 叫醒 ── */
let sparrowStep = 0;

function sparrowBookStep(){
  const box = document.getElementById('sparrow-book-desc');
  const btn = document.getElementById('sparrow-book-btn');
  if(!box || !btn){
    go('s-outro');
    return;
  }

  sparrowStep++;

  if(sparrowStep === 1){
    box.innerHTML = '勇者看見一本金光閃閃的【資安制度】。<br><br>封面寫著：委外管理程序書、資通訊委外合約書附則、保密切結書⋯⋯<br><br>「這……也太厚了吧？」';
    btn.textContent = '繼續看 📖';
  }
  else if(sparrowStep === 2){
    go('s-sleep'); // 視覺睡覺動畫畫面
  }
  else if(sparrowStep === 3){
    box.innerHTML = '小麻雀拍拍勇者的臉：<br><br>「起床～深呼吸⋯⋯慢慢來⋯⋯」<br><br>「制度不是要你一次背完，是要你知道下一步該查哪裡。」';
    btn.textContent = '起床！繼續 ▶';
  }
  else {
    go('s-outro');
  }
}
