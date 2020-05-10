if(!window.fetch || !window.crypto || !window.crypto.subtle || !window.localStorage){
  window.import = null
  let msg = 'Application terminated due to security risk. Your browser is obsolete and a security risk. It is not and will not be supported. ',
  arr = 'Have a nice day!'.split('');
  alert(msg);
  for (let i = 0; i < arr.length; i++) {
    setTimeout(function (){
      document.body.innerHTML += arr[i];
    }, i*250)
  }
  throw new Error(msg)
}

function loader(){
  let dv = document.createElement('div'),
  styl = document.createElement('style'),
  ul = document.createElement('ul'),
  li = document.createElement('li'),
  arr = 'Loading'.split(''),
  count = 0,
  item;

  styl.innerHTML = 'html body{overflow:hidden!important}#loader{position:fixed;width:100%;height:100%;left:0;top:0;background-color:rgba(0,0,0,0.9);z-index:999999}#smoke{position:absolute;top:50%;lefT:50%;transform:translate(-50%,-50%)}#smoke ul{margin:0;padding:0;display:flex}#smoke ul li{list-style:none;font-weight:700;letter-spacing:20px;filter:blur(1px);color:#0a00fb;font-size:6em;border:ndfgdfgdfone;display:inline-block;font-family:sans!important}@keyframes smoke{0%{transform:rotate(0) translateY(0);opacity:1;filter:blur(1px)}100%{transform:rotate(45deg) translateY(-200px);opacity:0;filter:blur(20px)}}'

  document.head.append(styl)

  loader = dv.cloneNode();
  loader.id = 'loader';
  dv.id = 'smoke';
  dv.append(ul);
  loader.append(dv);



  for (let i = 0; i < arr.length; i++) {
    item = li.cloneNode();
    item.innerText = arr[i]
    ul.append(item)
  }

  document.body.append(loader)

  let x = setInterval(function(){
    ul.children[count].style.animation = 'smoke 1s linear forwards'
    count++
    if(count === arr.length){
      clearInterval(x)
      setTimeout(function(){
       loader.remove();
       styl.remove();
      },1000)
    }
  },500)
}

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
import { bitshift } from "./bitshift.mjs";




https://angeal185.github.io/crypto-messenger/
void function(){
  loader();

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
        document.scripts[0].remove();
        app.rout({title: 'Crypto key', dest: 'crypto_key'})
        cnsl(['[task:app] ', 'app load success, starting background tasks...'], ['lime','cyan']);
        app.auth_init();
        utils.check_store_quota();
      })
    })
  }
}()
