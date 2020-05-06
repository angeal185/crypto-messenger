window.js = JSON.stringify;
window.jp = JSON.parse;
window.cl = console.log;
window.ce = console.error;
window.wcs = window.crypto.subtle;

import { h } from './h.mjs';
import { xcrypt } from './xcrypt.mjs';
import  jsSHA  from "./sha.mjs";
import { utils } from "./utils.mjs";
import { tpl } from "./tpl.mjs";
import { enc } from "./enc.mjs";
import { ls,ss } from "./storage.mjs";




void function(){


  ss.del('keyfile');

  window.addEventListener("rout", function(evt) {
    cl(evt)
    history.replaceState(null, "", evt.detail.dest);
    document.title = evt.detail.title;
  });

  window.app = {
    rout: function(obj){
      let evt = new CustomEvent("rout", {
        detail: obj
      });
      window.dispatchEvent(evt);
    },
    reload: function(){
      history.replaceState(null, "", '/');
      let url = location.href.split('/').slice(0,-1);
      url = url.join('/');
      location.href = url;
    }
  }

  window.addEventListener('fetch', function(evt){
    cl('hit')
  },false)

  Object.freeze(window.app);

  window.onload = function(){

    let doc = document,
    win = window;
    utils.strip_globals(win, function(){
      utils.pre(doc, window, function(err,res){
        if(err){return cl(err)}
        let color_picker = h('input.form-control.color-picker.inp-dark.mb-4.mt-4',{
          type:'color',
          title: 'theme',
          value: ls.get('theme') || '#000',
          onchange: function(evt){
            ls.set('theme', evt.target.value)
            utils.ud_theme(doc, evt.target.value)
          }
        })
        doc.body.append(tpl.base(doc),h('div.container-fluid', color_picker))
        window.onload = null;
        document.scripts[0].remove();
        app.rout({title: 'Crypto key', dest: 'crypto_key'})

      })
    })
  }
}()
