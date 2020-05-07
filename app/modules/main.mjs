window.js = JSON.stringify;
window.jp = JSON.parse;
window.cl = console.log;
window.ce = console.error;
window.wcs = window.crypto.subtle;

import { config } from './config.mjs';
import { cnsl } from './cnsl.mjs';
import { h } from './h.mjs';
import { xcrypt } from './xcrypt.mjs';
import  jsSHA  from "./sha.mjs";
import { utils } from "./utils.mjs";
import { tpl } from "./tpl.mjs";
import { enc } from "./enc.mjs";
import { ls,ss } from "./storage.mjs";



void function(){
  ss.del('charmander');
  ss.del('lapras');

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
      history.replaceState(null, "", config.app_path);
      location.href = config.app_path;
    },
    auth_init: function(){


      let does_exist = ls.set('pikachu');
      if(!does_exist || typeof does_exist !== 'number' || does_exist < Date.now()){

        let auth_worker = new Worker(config.auth_worker.src);

        auth_worker.onmessage = function(evt) {
          if(evt.isTrusted && evt.userActivation === null){
            let data = evt.data;
            if(data.type === 'verify'){
              if(!data.status){
                utils.toast('danger', data.msg)
                cnsl(['[auth:worker] ', data.msg], ['red','orange']);
              } else {
                cl(data.msg);
                cnsl(['[auth:worker] ', data.msg], ['lime','cyan']);
                ls.set('pikachu', Date.now() + config.auth_worker.interval);
              }
            }
          } else {
            cnsl(['[auth:worker] ', 'untrusted worker event blocked'], ['red','orange']);
          }
          cnsl(['[auth:worker] ', 'Terminating auth_worker'], ['blue','cyan'])
          auth_worker.terminate();
          return;
        }

        auth_worker.postMessage({type: 'verify'});
      } else {
        cnsl(['[auth:worker] ', ' Site file integrity pass'], ['lime','cyan']);
      }

    }
  }


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
          value: ls.get('growlithe') || '#000',
          onchange: function(evt){
            ls.set('growlithe', evt.target.value)
            utils.ud_theme(doc, evt.target.value)
          }
        })
        doc.body.append(tpl.base(doc),h('div.container-fluid', color_picker))
        window.onload = null;
        document.scripts[0].remove();
        app.rout({title: 'Crypto key', dest: 'crypto_key'})
        //app.auth_init();
      })
    })
  }
}()
