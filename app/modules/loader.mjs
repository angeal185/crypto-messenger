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

void function(){
  document.body.style = "background:#1e1d1c;"
  let dv = document.createElement('div'),
  styl = document.createElement('style'),
  ul = document.createElement('ul'),
  li = document.createElement('li');

  styl.innerHTML = 'html body{overflow:hidden!important}#loader{position:fixed;width:100%;height:100%;left:0;top:0;background-color:rgba(0,0,0,0.9);z-index:999999}#smoke{position:absolute;top:50%;lefT:50%;transform:translate(-50%,-50%)}#smoke ul{margin:0;padding:0;display:flex}#smoke ul li{list-style:none;font-weight:700;letter-spacing:20px;filter:blur(1px);color:#0a00fb;font-size:6em;border:ndfgdfgdfone;display:inline-block;font-family:sans!important}@keyframes smoke{0%{transform:rotate(0) translateY(0);opacity:1;filter:blur(1px)}100%{transform:rotate(45deg) translateY(-200px);opacity:0;filter:blur(20px)}}'

  document.head.append(styl)

  let loader = dv.cloneNode(),
  arr = 'Loading'.split(''),
  count = 0,
  item;
  
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

}()

import './main.mjs';
