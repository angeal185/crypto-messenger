import { h } from './h.mjs';
import { tpl } from './tpl.mjs';
import { config } from './config.mjs';
import { ls,ss } from "./storage.mjs";
import { xcrypt } from './xcrypt.mjs';
import { cnsl } from './cnsl.mjs';

const utils = {
  strip_globals: function(win,cb){
    let arr = ['atob','btoa','eval','alert','prompt','createImageBitmap','confirm','defaultstatus','defaultStatus','EvalError','clientInformation','ondrag','ondragend','ondragenter','ondragleave','ondragover','ondragstart','ondrop','ondurationchange','onemptied','onended','onafterprint','onanimationend','onanimationiteration','onanimationstart','onappinstalled','onauxclick','onbeforeinstallprompt','onbeforeprint','onblur','oncancel','oncanplay','oncanplaythrough','onchange','onclose','oncontextmenu','oncuechange','ondblclick','ondevicemotion','ondeviceorientation','ondeviceorientationabsolute','onfocus','onformdata','ongotpointercapture','prompt','opener','oninput','oninvalid','onkeydown','onkeypress','onlanguagechange','onloadstart','onlostpointercapture','onmessage','onmessageerror','onmousedown','onmouseenter','onmouseleave','onmousemove','onmouseout','onmouseover','onmouseup','onmousewheel','onpause','onplay','onplaying','onpointercancel','onpointerdown','onpointerenter','onpointerleave','onpointermove','onpointerout','onpointerover','onpointerrawupdate','onpointerup','onprogress','onratechange','onreset','onsearch','onseeked','onseeking','onselectionchange','onselectstart','onstalled','onsuspend','ontransitionend','onvolumechange','onwaiting','onwheel','queueMicrotask','print','speechSynthesis','stop','closed'];
    for (let i = 0; i < arr.length; i++) {
      delete win[arr[i]]
    }
    cnsl(['[task:strip] ', 'stripping dangerous or unused globals...'], ['lime','cyan']);
    cb()
  },
  ensure_secure: function(i){
    return 'https://'+ i
  },
  pre: function(doc, win, cb){

    utils.fetchJSON(config.app_path + '/app/data/fonts.json', function(err,res){
      if(err){return cb(err)}
      for (let i = 0; i < res.length; i++) {
        utils.add_font(res[i], doc);
      }
      utils.add_styles(doc, 'main', function(){
        cb(false)
      });
    })
  },
  add_styles: function(doc, styl, cb){

    utils.fetchJSON(config.app_path + '/app/data/styles.json', function(err,res){
      if(err){
        cnsl(['[task:styles] ', 'Styles failed to fetch'], ['red','magenta']);
        return ce(err)
      }

      let theme = ls.get('growlithe');
      try {
        let sheet = new CSSStyleSheet();
        sheet.replaceSync(res.main);
        if(theme){
          sheet.deleteRule(0)
          sheet.insertRule(':root{--gr:'+ theme +'!important;}',0)
        }
        doc.adoptedStyleSheets = [sheet];
      } catch (err) {
        //fallback for shit browsers
        cnsl(['[task:styles] ', 'outdated browser detected, loading fallback styles...'], ['orange','cyan']);
        let s = doc.createElement('link');
        s.type = 'text/css';
        s.rel = 'stylesheet';
        s.href = URL.createObjectURL(new Blob([res.main], {type : 'text/css'}));
        doc.head.appendChild(s);
        doc.adoptedStyleSheets = [s.sheet];
        if(theme){
          setTimeout(function(){
            doc.adoptedStyleSheets[0].deleteRule(0)
            doc.adoptedStyleSheets[0].insertRule(':root{--gr:'+ theme +'!important;}',0)
          },2000)
        }
      } finally {
        cb()
      }

    })
  },
  ud_theme: function(doc, r){
    doc.adoptedStyleSheets[0].deleteRule(0)
    doc.adoptedStyleSheets[0].insertRule(':root{--gr:'+ r +'!important;}',0)
    cnsl(['[task:theme] ', 'updating theme...'], ['lime','cyan']);
  },
  add_font: function(obj, doc){
    let buff = new Uint8Array(xcrypt.base64_decode(obj.data)).buffer;
    new FontFace(obj.name, buff, {
      style: obj.style,
      weight: obj.weight
    }).load().then(function(res) {
      doc.fonts.add(res);
    }).catch(function(err) {
      cnsl(['[task:fonts] ', obj.name +' failed to load.'], ['red','cyan']);
    });
  },
  shuffle: function(arr) {
    return arr.sort(() => Math.random() - 0.5);
  },
  valid_url: function(url){
    let i = new URL(url);
    if(i.protocol === 'https:'){
      return true;
    }
    return false
  },
  fetchJSON: function(url, cb){
    url = utils.ensure_secure(url)
    if(!utils.valid_url(url)){
      let msg = 'Insecure request attempt detected and blocked.';
      cnsl(['[monitor:fetch] ', msg], ['red','magenta']);
      return cb(msg)
    }
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip',
        'Cache-Control': 'no-cache'
      }
    })
    .then(function(res){

      if (res.status >= 200 && res.status < 300) {
        return res.json();
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    })
    .then(function(data) {
      cb(false, data)
    })
    .catch(function(err){
      cb(err)
    })
  },
  getJSON: function(url, cb){
    url = utils.ensure_secure(url);
    if(!utils.valid_url(url)){
      let msg = 'Insecure request attempt detected and blocked.';
      cnsl(['[monitor:fetch] ', msg], ['red','magenta']);
      return cb(msg)
    }
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip',
        'Sec-Fetch-Dest': 'object',
        'Sec-Fetch-mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Cache-Control': 'no-store'
      }
    })
    .then(function(res){
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    })
    .then(function(data) {
      cb(false, data)
    })
    .catch(function(err){
      cb(err)
    })
  },
  box_add: function(obj, cb){
    let url = utils.ensure_secure(obj.url);
    if(!utils.valid_url(url)){
      let msg = 'Insecure request attempt detected and blocked.';
      cnsl(['[monitor:fetch] ', msg], ['red','magenta']);
      return cb(msg)
    }
    fetch(url, {
      method: obj.method,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Accept-Encoding': 'gzip',
        'Sec-Fetch-Dest': 'object',
        'Sec-Fetch-mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'x-api-key': obj.api
      },
      body: js(obj.body)
    })
    .then(function(res){
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    })
    .then(function(data) {
      cb(false, data)
    })
    .catch(function(err){
      cb(err)
    })
  },
  box_del: function(obj, cb){
    let url = utils.ensure_secure(obj.url)
    if(!utils.valid_url(url)){
      let msg = 'Insecure request attempt detected and blocked.';
      cnsl(['[monitor:fetch] ', msg], ['red','magenta']);
      return cb(msg)
    }
    fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Accept-Encoding': 'gzip',
        'Sec-Fetch-Dest': 'object',
        'Sec-Fetch-mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'x-api-key': obj.api
      }
    })
    .then(function(res){
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    })
    .then(function(data) {
      cb(false, data)
    })
    .catch(function(err){
      cb(err)
    })
  },
  fix_date: function(i){
    return i.replace('T', ' ').split('.')[0];
  },
  set_inbox_cnt: function(i){
    let msg = 'you have '+ i +' message';
    if(i !== 1){
      msg+='s';
    }
    return msg
  },
  emptySync: function(i){
    while (i.firstChild) {
      i.removeChild(i.firstChild);
    }
  },
  empty: function(i, cb){
    while (i.firstChild) {
      i.removeChild(i.firstChild);
    }
    cb()
  },
  totop: function(i){
    window.scroll({
      top: i,
      left: 0,
      behavior: 'smooth'
    });
  },
  globe_change: function(i,a,b,c,d){
    i.classList.add(a);
    i.classList.remove(b,c);
    i.title = d;
  },
  is_online: function(i){
    utils.globe_change(i,'text-success','text-danger', 'text-warning','online');
    ss.set('voltorb', true);
    cnsl(['[monitor:connection] ', 'web connection connected.'], ['lime','cyan']);
  },
  is_offline: function(i){
    utils.globe_change(i,'text-danger','text-success', 'text-warning', 'offline');
    ss.set('voltorb', false);
    cnsl(['[monitor:connection] ', 'web connection disconnected.'], ['red','magenta']);
  },
  add_sp: function(item, text){
    utils.emptySync(item);
    item.append(h('span.spinner-grow.spinner-grow-sm.mr-1'), text);
  },
  del_sp: function(item, text){
    setTimeout(function(){
      utils.emptySync(item);
      item.textContent = text;
    },1000)
  },
  toast: function(i, msg){
    const toast = h('div#toast.alert.alert-'+ i, {
        role: "alert"
    }, msg);
    document.body.append(toast);
    setTimeout(function(){
      toast.classList.add('fadeout');
      setTimeout(function(){
        toast.remove();
      },1000)
    },3000)
    return;
  },
  date2ts: function(x){
    return Date.parse(x);
  },
  format_date: function(i){
    let date = new Date(i),
    dd = date.getDate(),
    mm = date.getMonth()+1,
    yyyy = date.getFullYear();

    if(dd < 10){
      dd = '0' + dd
    }

    if(mm < 10){
      mm = '0' + mm
    };

    return [yyyy, mm, dd].join('-')
  },
  get_year: function(){
    let d = new Date();
    return d.getFullYear();
  },
  debounce: function(func, wait, immediate) {
  	var timeout;
  	return function() {
  		var context = this, args = arguments;
  		var later = function() {
  			timeout = null;
  			if (!immediate) func.apply(context, args);
  		};
  		var callNow = immediate && !timeout;
  		clearTimeout(timeout);
  		timeout = setTimeout(later, wait);
  		if (callNow) func.apply(context, args);
  	};
  },
  capitalize: function(str) {
   try {
     let x = str[0] || str.charAt(0);
     return x  ? x.toUpperCase() + str.substr(1) : '';
   } catch (err) {
     if(err){return str;}
   }
  },
  formatBytes: function(bytes, decimals) {
    if (bytes === 0){
      return '0 Bytes';
    }
    const k = 1024,
    dm = decimals < 0 ? 0 : decimals,
    sizes = ['Bytes', 'KB', 'MB', 'GB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },
  snake_case: function(str){
    try {
      return str.replace(/ /g, '_');
    } catch (err) {
      if(err){return str;}
    }
  },
  un_snake_case: function(str){
    try {
      return str.replace(/_/g, ' ');
    } catch (err) {
      if(err){return str;}
    }
  },
 fs_write: function(data, filename, ctype){
    var file = new Blob([data], {type: ctype +';charset=utf-8'});
    if (window.navigator.msSaveOrOpenBlob){
        window.navigator.msSaveOrOpenBlob(file, filename);
    } else {
        var a = document.createElement("a"),
        url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        cnsl(['[task:export] ', 'attempting to export '+ filename], ['blue','cyan']);
        setTimeout(function() {
            window.URL.revokeObjectURL(url);
            a.remove();
        }, 1000);
    }
  },
  add_data: function(res, slug, id, i1,i2,i3,i4,i5,ki){

    let obj = jp(res);

    slug.value = obj.slug
    id.textContent = obj.ID;
    i1.textContent = obj.UUID;
    i2.textContent = obj[config.crypt_order[0]];
    i3.textContent = obj[config.crypt_order[1]];
    i4.textContent = obj[config.crypt_order[2]];
    i5.textContent = obj.HMAC;
    ss.set_enc('charmander', obj);

    ki.textContent = res;
    db_update(obj.slug)

  },
  add_otp_data: function(res, slug, id, i1,i2,ki){

    let obj = jp(res);

    slug.value = obj.slug
    id.textContent = obj.ID;
    i1.textContent = obj.UUID;
    i2.textContent = obj.HMAC;
    ss.set_enc('mewtwo', obj);

    ki.textContent = res;
    db_update(obj.slug)

  },
  check_store_quota:function(){
    try {
      window.navigator.storage.estimate().then(function(i) {
        let max = utils.formatBytes(i.quota, 2),
        used = utils.formatBytes(i.usage, 2),
        per = (i.usage / i.quota * 100).toFixed(2);
        cnsl(
          ['[monitor:storage] ',
          ['currently using', used, 'out of', max, 'of storage.', per+'%'].join(' ')],
          ['lime','cyan']
        );
      });
    } catch (err) {
      cnsl(
        ['[monitor:storage] ',
        'unable to check storage quota. your browser is obsolete and a security risk.'],
        ['red','orange']
      );
    }
  },
  change_mode: function(i){
    ss.set('mode', i);
    cnsl(
      ['[monitor:mode] ',
      'Mode changed to '+ i],
      ['lime','cyan']
    );
  }
}

Object.freeze(utils);

export { utils }
