import { config } from './config.mjs';
import { cnsl } from './cnsl.mjs';
import { h } from './h.mjs';
import { xcrypt } from './xcrypt.mjs';
import  jsSHA  from "./sha.mjs";
import { utils } from "./utils.mjs";
import { tpl } from "./tpl.mjs";
import { enc } from "./enc.mjs";
import { ls,ss } from "./storage.mjs";
import { bitshift } from "./bitshift.mjs";


void function(){
  for (let i = 0; i < config.del_arr.length; i++) {
    ss.del(config.del_arr[i]);
  }

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

      let does_exist = ls.get('pikachu');
      if(!does_exist || typeof does_exist !== 'number' || does_exist < Date.now()){

        let auth_worker = new Worker(config.auth_worker.src);
        cnsl(['[auth:worker] ', 'auth worker listening...'], ['lime','cyan']);
        auth_worker.onmessage = function(evt) {
          if(evt.isTrusted && evt.userActivation === null){
            let data = evt.data;
            if(data.type === 'verify'){
              if(!data.status){
                utils.toast('danger', data.msg)
                cnsl(['[auth:worker] ', data.msg], ['red','orange']);
              } else {
                cnsl(['[auth:worker] ', data.msg], ['lime','cyan']);
                ls.set('pikachu', Date.now() + config.auth_worker.interval);
              }
            } else if(data.type === 'error'){
              cnsl(['[auth:worker] ', data.msg], ['red','orange']);
            }
          } else {
            cnsl(['[auth:worker] ', 'untrusted worker event blocked'], ['red','orange']);
          }
          cnsl(['[auth:worker] ', 'Terminating auth_worker'], ['blue','cyan'])
          auth_worker.terminate();
          return;
        }

        cnsl(['[auth:worker] ', 'testing site file integrity...'], ['blue','cyan']);
        //auth_worker.postMessage({type: 'verify'});
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
        if(err){
          return ce(err)
        }

        doc.body.append(tpl.base(doc))
        window.onload = null;
        doc.body.removeAttribute('style');
        doc.scripts[0].remove();
        app.rout({title: 'Crypto key', dest: 'crypto_key'})
        cnsl(['[task:app] ', 'app load success, starting background tasks...'], ['lime','cyan']);
        app.auth_init();
        utils.check_store_quota();
      })
    })
  }
}()
