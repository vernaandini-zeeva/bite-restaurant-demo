// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

var I = {
    h:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="FILL" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    x:   '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    crt: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    ec:  '<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    p:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
};


// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & STATE
// ─────────────────────────────────────────────────────────────────────────────

var CATS = [
    'Semua', 'Nasi', 'Mie & Lontong', 'Sate', 'Ayam & Bebek',
    'Seafood', 'Sayur', 'Soto & Sup', 'Jajanan',
    'Kopi Kekinian', 'Minuman Lain', 'Dessert'
];

var M         = [];
var oType     = '';
var tNo       = '';
var curCat    = 'Semua';
var cart      = {};
var favs      = {};
var prevS     = 'home';

var cDet      = null;
var dQty      = 1;
var cPM       = 'smart';
var qInt      = null;
var qSec      = 299;
var sQ        = '';

var spLinked      = false;
var trkInt        = null;
var custName      = '';
var isAdminBypass = false;

var admData = {
    stats:    {},
    orders:   [],
    menuList: []
};


// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────

window.onload = function () {
    bldTbl();
    loadMenu().then(function () {
        rCats();
        rFoods();
    });
    setTimeout(function () { sh('otype'); }, 1400);
};


// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function sh(id) {
    var s = document.querySelectorAll('.scr');
    for (var i = 0; i < s.length; i++) s[i].classList.remove('on');
    document.getElementById(id).classList.add('on');
}

function fRp(n) {
    var num = parseInt(n) || 0;
    return 'Rp ' + num.toLocaleString('id-ID');
}

function hS(f) {
    return I.h.replace('FILL', f ? 'var(--primary)' : 'none');
}

function onSr(v) {
    sQ = v.toLowerCase();
    rFoods();
}

var tT;
function toast(m) {
    var t = document.getElementById('toast');
    t.textContent = m;
    t.classList.add('on');
    clearTimeout(tT);
    tT = setTimeout(function () { t.classList.remove('on'); }, 2200);
}


// ─────────────────────────────────────────────────────────────────────────────
// MENU DATA
// ─────────────────────────────────────────────────────────────────────────────

function loadMenu() {
    return fetch('js/menu-data.json')
        .then(function (r) { return r.json(); })
        .then(function (d) {
            M = d.map(function (m) {
                return {
                    id:   m.id,
                    name: m.name,
                    cat:  m.cat,
                    price: parseInt(m.price),
                    wt:   m.weight,
                    img:  m.image,
                    tags: (m.tags || '').split(',').filter(Boolean),
                    desc: m.description || '',
                    ing:  (m.ingredients || '').split(',').filter(Boolean)
                };
            });
        });
}


// ─────────────────────────────────────────────────────────────────────────────
// ORDER TYPE SCREEN
// ─────────────────────────────────────────────────────────────────────────────

function selOT(t) {
    oType = t;
    document.getElementById('ot_dine').classList.toggle('sel', t === 'dine');
    document.getElementById('ot_take').classList.toggle('sel', t === 'take');
    document.getElementById('tblW').style.display  = t === 'dine' ? 'block' : 'none';
    document.getElementById('addrW').style.display = t === 'take' ? 'block' : 'none';
}

function bldTbl() {
    var g = document.getElementById('tblG');
    for (var i = 1; i <= 20; i++) {
        var b = document.createElement('button');
        b.className   = 'tbl-b';
        b.textContent = i;
        b.setAttribute('data-t', i);
        b.onclick = function () {
            var a = document.querySelectorAll('.tbl-b');
            for (var j = 0; j < a.length; j++) a[j].classList.remove('sel');
            this.classList.add('sel');
            tNo = this.getAttribute('data-t');
        };
        g.appendChild(b);
    }
}

function goHome() {
    if (!document.getElementById('custName').value.trim()) {
        toast('Masukkan nama pemesan');
        return;
    }
    custName      = document.getElementById('custName').value.trim();
    isAdminBypass = false;

    var loc;
    if (oType === 'dine') {
        if (!tNo) { toast('Pilih nomor meja dulu'); return; }
        loc = 'Meja ' + tNo;
    } else if (oType === 'take') {
        if (!document.getElementById('addrL').value.trim()) { toast('Masukkan alamat'); return; }
        loc = document.getElementById('addrL').value.split(',')[0];
    } else {
        toast('Pilih tipe pesanan dulu');
        return;
    }

    document.getElementById('hMode').textContent = oType === 'dine' ? 'Dine In' : 'Delivery';
    document.getElementById('hTbl').textContent  = custName + ' \xb7 ' + loc;
    document.getElementById('ptM').textContent   = (oType === 'dine' ? 'Dine In \xb7 Meja ' + tNo : 'Delivery \xb7 ' + loc);
    document.getElementById('cSvcL').textContent = oType === 'dine' ? 'Servis (10%)' : 'Biaya Layanan';
    sh('home');
}


// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

function nav(id) {
    prevS = document.querySelector('.scr.on') ? document.querySelector('.scr.on').id : 'home';
    if (id === 'cart_s') rCart();
    if (id === 'fav_s')  rFavs();
    if (id === 'pay_s')  rPayT();
    sh(id);
}

function goBk() {
    var t = prevS || 'home';
    if (t === 'fav_s') rFavs();
    sh(t);
}


// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES & FOOD GRID
// ─────────────────────────────────────────────────────────────────────────────

function rCats() {
    var r = document.getElementById('catR');
    var h = '';
    for (var i = 0; i < CATS.length; i++) {
        var c = CATS[i];
        h += '<button class="cat-t' + (c === curCat ? ' on' : '') + '" onclick="sCat(\'' + c + '\')">' + c + '</button>';
    }
    r.innerHTML = h;
}

function sCat(c) {
    curCat = c;
    document.getElementById('secL').textContent = c === 'Semua' ? 'Semua Menu' : c;
    rCats();
    rFoods();
}

function rFoods() {
    var list = curCat === 'Semua' ? M : M.filter(function (f) { return f.cat === curCat; });
    if (sQ) list = list.filter(function (f) {
        return f.name.toLowerCase().indexOf(sQ) > -1 || f.cat.toLowerCase().indexOf(sQ) > -1;
    });

    var g = document.getElementById('fGrid');
    var h = '';

    for (var i = 0; i < list.length; i++) {
        var f   = list[i];
        var qty = cart[f.id] || 0;
        var isF = !!favs[f.id];
        var bc  = (f.tags[0] === 'Bestseller' || f.tags[0] === 'Pedas' || f.tags[0] === 'Viral') ? 'hot' : '';

        h += '<div class="fc" onclick="oDet(' + f.id + ')">'
           +   '<div class="fc-iw">'
           +     '<img class="fc-img" src="' + f.img + '" alt="' + f.name + '" loading="lazy">'
           +     (f.tags[0] ? '<span class="fc-bdg ' + bc + '">' + f.tags[0] + '</span>' : '')
           +     '<button class="fc-fv' + (isF ? ' on' : '') + '" onclick="event.stopPropagation();tglF(' + f.id + ')">' + hS(isF) + '</button>'
           +     (qty > 0 ? '<span class="fc-ic">' + qty + ' di keranjang</span>' : '')
           +   '</div>'
           +   '<div class="fc-bd">'
           +     '<div class="fc-nm">' + f.name + '</div>'
           +     '<div class="fc-bt">'
           +       '<div class="fc-pr">' + fRp(f.price) + '</div>'
           +       '<button class="fc-ad" onclick="event.stopPropagation();qA(' + f.id + ')">' + I.p + '</button>'
           +     '</div>'
           +   '</div>'
           + '</div>';
    }

    if (!list.length) {
        h = '<div style="grid-column:1/-1;text-align:center;padding:36px 0;color:var(--text3);font-size:12px">Tidak ada menu ditemukan</div>';
    }

    g.innerHTML = h;
}

function qA(id) {
    cart[id] = (cart[id] || 0) + 1;
    bdg();
    rFoods();
    toast('Ditambahkan ke keranjang');
}


// ─────────────────────────────────────────────────────────────────────────────
// DETAIL VIEW
// ─────────────────────────────────────────────────────────────────────────────

function oDet(id) {
    var f = M.find(function (x) { return x.id === id; });
    if (!f) return;

    cDet = id;
    dQty = 1;
    prevS = document.querySelector('.scr.on') ? document.querySelector('.scr.on').id : 'home';

    document.getElementById('dImg').src          = f.img;
    document.getElementById('dNm').textContent   = f.name;
    document.getElementById('dPH').textContent   = fRp(f.price);
    document.getElementById('dWt').textContent   = f.wt;
    document.getElementById('dCt').textContent   = f.cat;
    document.getElementById('dQn').textContent   = 1;

    var fb = document.getElementById('dFav');
    fb.innerHTML  = hS(!!favs[id]);
    fb.className  = 'dh-fab fv' + (favs[id] ? ' on' : '');

    // Tags
    var th = '';
    for (var t = 0; t < f.tags.length; t++) th += '<span class="db-t">' + f.tags[t] + '</span>';
    document.getElementById('dTg').innerHTML = th;

    // Description
    document.getElementById('dDesc').innerHTML = f.desc
        ? '<div class="db-desc">' + f.desc + '</div>'
        : '';

    // Ingredients
    var ingH = '';
    for (var t = 0; t < f.ing.length; t++) {
        ingH += '<div class="ing-item"><div class="ing-dot"></div>' + f.ing[t] + '</div>';
    }
    document.getElementById('dIng').innerHTML = ingH;

    // Recommendations
    var recs = M
        .filter(function (x) { return x.cat === f.cat && x.id !== f.id; })
        .sort(function () { return 0.5 - Math.random(); })
        .slice(0, 2);

    var recH = '';
    for (var i = 0; i < recs.length; i++) {
        recH += '<div class="rec-card" onclick="oDet(' + recs[i].id + ')">'
              +   '<img class="rec-img" src="' + recs[i].img + '" alt="' + recs[i].name + '" loading="lazy">'
              +   '<div class="rec-bd">'
              +     '<div class="rec-nm">' + recs[i].name + '</div>'
              +     '<div class="rec-pr">' + fRp(recs[i].price) + '</div>'
              +   '</div>'
              + '</div>';
    }
    document.getElementById('dRec').innerHTML = recH
        || '<div style="color:var(--text3);font-size:11px;padding:4px 0">Tidak ada rekomendasi</div>';

    sh('det');
}

function dQ(d) {
    dQty = Math.max(1, dQty + d);
    document.getElementById('dQn').textContent = dQty;
    uDPr();
}

function uDPr() {
    var f = M.find(function (x) { return x.id === cDet; });
    document.getElementById('dPH').textContent = fRp(f.price * dQty);
}

function addDC() {
    cart[cDet] = (cart[cDet] || 0) + dQty;
    bdg();
    rFoods();
    toast('Ditambahkan ke keranjang');
    goBk();
}

function tglDF() {
    tglF(cDet);
    var fb = document.getElementById('dFav');
    fb.innerHTML = hS(!!favs[cDet]);
    fb.className = 'dh-fab fv' + (favs[cDet] ? ' on' : '');
}

function tglF(id) {
    if (favs[id]) delete favs[id];
    else { favs[id] = true; toast('Ditambahkan ke favorit'); }
    bdg();
    rFoods();
    if (document.getElementById('fav_s').classList.contains('on')) rFavs();
}


// ─────────────────────────────────────────────────────────────────────────────
// FAVOURITES
// ─────────────────────────────────────────────────────────────────────────────

function rFavs() {
    var l  = document.getElementById('fList');
    var ks = Object.keys(favs);

    if (!ks.length) {
        l.innerHTML = '<div class="c-empty">' + I.ec + '<p>Belum ada favorit</p></div>';
        return;
    }

    var h = '<div style="height:6px"></div>';
    for (var i = 0; i < ks.length; i++) {
        var id = ks[i];
        var f  = M.find(function (x) { return x.id == id; });
        if (!f) continue;
        h += '<div class="fi2">'
           +   '<img class="f-img" src="' + f.img + '" alt="' + f.name + '" loading="lazy">'
           +   '<div class="f-info">'
           +     '<div class="f-nm">'  + f.name      + '</div>'
           +     '<div class="f-wt">'  + f.wt        + '</div>'
           +     '<div class="f-pr">'  + fRp(f.price) + '</div>'
           +   '</div>'
           +   '<div class="f-act">'
           +     '<button class="f-dl" onclick="tglF(' + id + ')">'    + I.x   + '</button>'
           +     '<button class="f-add" onclick="qA(' + id + ')">'     + I.crt + '</button>'
           +   '</div>'
           + '</div>';
    }
    l.innerHTML = h;
}


// ─────────────────────────────────────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────────────────────────────────────

function gSub() {
    var s = 0;
    for (var id in cart) {
        var f = M.find(function (x) { return x.id == id; });
        if (f) s += f.price * cart[id];
    }
    return s;
}

function rCart() {
    var l   = document.getElementById('cList');
    var ft  = document.getElementById('cFoot');
    var cb  = document.getElementById('clrC');
    var h   = '';
    var has = false;

    for (var id in cart) {
        if (cart[id] <= 0) continue;
        has = true;
        var f = M.find(function (x) { return x.id == id; });
        if (!f) continue;
        h += '<div class="ci2">'
           +   '<img class="c-img" src="' + f.img + '" alt="' + f.name + '" loading="lazy">'
           +   '<div class="c-info">'
           +     '<div class="c-nm">' + f.name              + '</div>'
           +     '<div class="c-wt">' + f.wt                + '</div>'
           +     '<div class="c-pr">' + fRp(f.price * cart[id]) + '</div>'
           +   '</div>'
           +   '<div class="c-rt">'
           +     '<button class="c-dl" onclick="rmC(' + id + ')">' + I.x + '</button>'
           +     '<div class="c-qt">'
           +       '<button class="c-qb" onclick="cgC(' + id + ',-1)">\u2212</button>'
           +       '<span class="c-qn">' + cart[id] + '</span>'
           +       '<button class="c-qb" onclick="cgC(' + id + ',1)">+</button>'
           +     '</div>'
           +   '</div>'
           + '</div>';
    }

    if (!has) {
        l.innerHTML          = '<div class="c-empty">' + I.ec + '<p>Keranjang masih kosong</p></div>';
        ft.style.display     = 'none';
        cb.style.display     = 'none';
        return;
    }

    l.innerHTML = '<div style="height:6px"></div>' + h;
    ft.style.display = '';
    cb.style.display = '';

    var sub = gSub();
    var svc = oType === 'dine' ? Math.round(sub * .1) : 0;
    document.getElementById('cSub').textContent = fRp(sub);
    document.getElementById('cSvc').textContent = svc > 0 ? fRp(svc) : 'Gratis';
    document.getElementById('cTot').textContent = fRp(sub + svc);
    document.getElementById('cDlvR').style.display = oType === 'take' ? 'flex' : 'none';
}

function cgC(id, d) {
    cart[id] = Math.max(0, (cart[id] || 0) + d);
    if (!cart[id]) delete cart[id];
    bdg();
    rFoods();
    rCart();
}

function rmC(id) {
    delete cart[id];
    bdg();
    rFoods();
    rCart();
}

function clrCart() {
    cart = {};
    bdg();
    rFoods();
    rCart();
}

function bdg() {
    var cnt = 0;
    for (var k in cart) cnt += cart[k];
    var el = document.getElementById('nb1');
    if (el) el.style.display = cnt ? 'block' : 'none';
}


// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT
// ─────────────────────────────────────────────────────────────────────────────

function goPay() {
    if (!Object.keys(cart).length) { toast('Keranjang kosong'); return; }
    rPayT();
    sh('pay_s');
}

function gFin() {
    var s = gSub();
    return s + (oType === 'dine' ? Math.round(s * .1) : 0);
}

function rPayT() {
    document.getElementById('ptV').textContent = fRp(gFin());
    if (cPM === 'qris') document.getElementById('qAmt').textContent = fRp(gFin());
}

function selPM(pm) {
    cPM = pm;
    var a = document.querySelectorAll('.po');
    for (var i = 0; i < a.length; i++) a[i].classList.remove('sel');
    document.getElementById('pm_' + pm).classList.add('sel');

    document.getElementById('spBox').classList.toggle('show',  pm === 'smart' && !spLinked);
    document.getElementById('spConn').classList.toggle('show', pm === 'smart');
    document.getElementById('qBox').classList.toggle('show',   pm === 'qris');

    if (pm === 'qris') {
        startQC();
        document.getElementById('qAmt').textContent = fRp(gFin());
    } else {
        clearInterval(qInt);
    }
}

function smartPayConnect() {
    var btn = document.getElementById('spConnBtn');
    btn.innerHTML      = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Menghubungkan...';
    btn.style.pointerEvents = 'none';
    btn.style.opacity       = '.7';

    setTimeout(function () {
        spLinked = true;
        document.getElementById('spConnBtn').style.display = 'none';
        document.getElementById('spBox').classList.remove('show');

        var lk = document.getElementById('spLinked');
        lk.style.display = 'block';
        lk.innerHTML     = '<div class="sp-linked">'
                         +   '<div class="sp-linked-ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>'
                         +   '<div class="sp-linked-info">'
                         +     '<div class="sp-linked-name">SmartPay Connected</div>'
                         +     '<div class="sp-linked-num">**** **** **** 4521</div>'
                         +   '</div>'
                         +   '<div class="sp-linked-badge">Terkait</div>'
                         + '</div>';
        toast('SmartPay terhubung');
    }, 2000);
}

function startQC() {
    clearInterval(qInt);
    qSec = 299;
    uQC();
    qInt = setInterval(function () {
        qSec--;
        if (qSec < 0) qSec = 299;
        uQC();
    }, 1000);
}

function uQC() {
    document.getElementById('qCd').textContent =
        String(Math.floor(qSec / 60)).padStart(2, '0') + ':' +
        String(qSec % 60).padStart(2, '0');
}

function fmtC(el) {
    var v = el.value.replace(/\D/g, '').slice(0, 16);
    var p = v.match(/.{1,4}/g);
    el.value = p ? p.join(' ') : v;
}

function fmtE(el) {
    var v = el.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    el.value = v;
}


// ─────────────────────────────────────────────────────────────────────────────
// PLACE ORDER
// ─────────────────────────────────────────────────────────────────────────────

function placeOrd() {
    if (!Object.keys(cart).length) { toast('Keranjang kosong'); return; }
    if (cPM === 'smart' && !spLinked) {
        if (document.getElementById('spCard').value.replace(/\s/g, '').length < 16) {
            toast('Nomor kartu tidak valid');
            return;
        }
    }

    clearInterval(qInt);

    var sub   = gSub();
    var svc   = oType === 'dine' ? Math.round(sub * .1) : 0;
    var total = sub + svc;

    var pmN = {
        smart: 'SmartPay',
        qris:  'QRIS',
        gp:    'GoPay',
        ovo:   'OVO',
        dana:  'DANA',
        shp:   'ShopeePay',
        tf:    'Transfer Bank',
        cash:  'Tunai'
    };

    var mode    = oType === 'dine'
        ? 'Dine In \xb7 Meja ' + tNo
        : 'Delivery \xb7 ' + document.getElementById('addrL').value.split(',')[0];
    var address = oType === 'take' ? document.getElementById('addrL').value : '';
    var oId     = '#BT-' + Date.now().toString().slice(-5);

    var items = [];
    for (var id in cart) {
        var f = M.find(function (x) { return x.id == id; });
        if (f) items.push({ name: f.name, qty: cart[id], price: f.price, cat: f.cat });
    }

    var methodLabel = pmN[cPM] + (cPM === 'smart' && spLinked ? ' (Connected)' : '');

    var detailH = '<div class="ovr"><span>Nama</span><span>'    + custName     + '</span></div>'
                + '<div class="ovr"><span>Metode</span><span>'  + methodLabel  + '</span></div>'
                + '<div class="ovr"><span>Mode</span><span>'    + mode         + '</span></div>'
                + '<div class="ovr"><span>Subtotal</span><span>'+ fRp(sub)     + '</span></div>'
                + (svc > 0 ? '<div class="ovr"><span>Servis</span><span>' + fRp(svc) + '</span></div>' : '')
                + '<div class="ovr" style="border-top:1px solid var(--border);padding-top:4px;margin-top:2px">'
                +   '<span><b>Total</b></span><span><b>' + fRp(total) + '</b></span>'
                + '</div>'
                + '<div class="ovr"><span>No. Order</span><span>' + oId + '</span></div>';

    Promise.resolve({ json: function () { return Promise.resolve({ ok: true, demo: true }); } })
    .then(function (r) { return r.json(); })
    .then(function () {
        var deepLink  = '';
        var storeLink = '';
        var walletName = '';

        if (cPM === 'gp') {
            deepLink   = 'gopay://';
            storeLink  = 'https://play.google.com/store/apps/details?id=com.gojek.app';
            walletName = 'GoPay';
        } else if (cPM === 'ovo') {
            deepLink   = 'ovo://';
            storeLink  = 'https://play.google.com/store/apps/details?id=com.ovo.id';
            walletName = 'OVO';
        } else if (cPM === 'dana') {
            deepLink   = 'dana://';
            storeLink  = 'https://play.google.com/store/apps/details?id=id.dana';
            walletName = 'DANA';
        }

        if (oType === 'dine') {
            var okH = '<div class="dine-succ-ic"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>'
                    + '<div class="dine-succ-t">Pesanan Diterima</div>'
                    + '<div class="dine-succ-d">Halo ' + custName + ', ' + (walletName ? 'mengarahkan ke aplikasi ' + walletName + '...' : '') + 'pesananmu sedang menunggu dikonfirmasi dapur.</div>'
                    + '<div class="dine-succ-card">' + detailH.replace(/ovr/g, 'dine-succ-row') + '</div>'
                    + '<button class="cta dine-succ-act" onclick="nav(\'home\',0)">Kembali ke Menu</button>';
            document.getElementById('dineOk').innerHTML = okH;
            cart = {};
            bdg();
            rFoods();
            sh('dine_ok');
        } else {
            document.getElementById('ovD').textContent     = walletName ? 'Mengarahkan ke aplikasi ' + walletName : 'Pesanan delivery sedang diproses';
            document.getElementById('ovDt').innerHTML      = detailH;
            document.getElementById('ovBtn').onclick       = function () { closeSucc(); };
            document.getElementById('ovBtn').textContent   = 'Lacak Pesanan';
            document.getElementById('succOv').classList.add('on');
        }

        if (deepLink) {
            var startTime = Date.now();
            window.location.href = deepLink;
            setTimeout(function () {
                if (Date.now() - startTime < 2000 && !document.hidden && !document.webkitHidden) {
                    window.location.href = storeLink;
                }
            }, 1500);
        }
    })
    .catch(function () { toast('Gagal simpan ke database'); });
}

function closeSucc() {
    document.getElementById('succOv').classList.remove('on');
    cart = {};
    bdg();
    rFoods();
    startTrk();
    sh('trk_s');
}


// ─────────────────────────────────────────────────────────────────────────────
// ORDER TRACKING
// ─────────────────────────────────────────────────────────────────────────────

function startTrk() {
    clearInterval(trkInt);

    var steps = ['s1', 's2', 's3', 's4', 's5'];
    var stxt  = ['Pesanan Dikonfirmasi', 'Sedang Disiapkan', 'Driver Mengambil', 'Dalam Perjalanan', 'Tiba di Tujuan'];
    var cur   = 0;
    var est   = 25;

    for (var i = 0; i < steps.length; i++) document.getElementById(steps[i]).classList.remove('active');
    document.getElementById(steps[0]).classList.add('active');
    document.getElementById('trSt').textContent = stxt[0];
    document.getElementById('trTm').textContent = 'Estimasi: ' + est + ' menit';

    trkInt = setInterval(function () {
        cur++;
        est -= 5;
        if (cur >= steps.length) {
            clearInterval(trkInt);
            document.getElementById('trSt').textContent = 'Pesanan Tiba!';
            document.getElementById('trTm').textContent = 'Terima kasih';
            for (var i = 0; i < steps.length; i++) document.getElementById(steps[i]).classList.add('active');
            return;
        }
        document.getElementById(steps[cur]).classList.add('active');
        document.getElementById('trSt').textContent = stxt[cur];
        document.getElementById('trTm').textContent = 'Estimasi: ' + est + ' menit';
    }, 3000);
}


// ─────────────────────────────────────────────────────────────────────────────
// Admin dashboard is intentionally unavailable in the public static demo.\nfunction openAdmin() { toast('Dashboard admin tidak tersedia di demo publik'); }\n