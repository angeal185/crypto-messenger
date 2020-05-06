import { h } from './h.mjs';
import { utils } from './utils.mjs';
import { ls,ss } from "./storage.mjs";
import { xcrypt } from './xcrypt.mjs';
import { enc } from './enc.mjs';
import { rout } from './rout.mjs';

const tpl = {
  header: function(){

    let lnk_div = h('div.nav.justify-content-end'),
    arr = ['crypto_key', 'crypto_store', 'crypto_tools', 'about']


    for (let i = 0; i < arr.length; i++) {
      lnk_div.append(h('li.nav-item.cp.text-success',
        h('a.nav-link.sh-95', {
          onclick:function(){
            location.hash = '/'+ arr[i]
          }
        }, utils.capitalize(utils.un_snake_case(arr[i])))
      ))
    }

    return h('nav.navbar.navbar-expand-lg.nav_main.fixed-top',
      h('div.row.w-100',
        h('div.col-md-3.col-2',
          h('div.navbar-brand',
            h('h4.text-success', 'Crypto messenger')
          )
        ),
        h('div.col-md-9.col-10',
          lnk_div
        )
      )
    )
  },
  base: function(doc){

    let baseTpl = h('app-main',
      tpl.header(),
      h('div.sub-content',
        tpl.to_top(),
        tpl.status_bar()
      ),
      h('div#main-content.container-fluid',
        h('div#app-main',
          tpl.app_main()
        )
      )
    )
    return baseTpl

  },
  to_top: function(){

      let item = h('div.to-top.hidden.sh-9', {
        onclick: function(){
          utils.totop(0);
        }
      });

      window.addEventListener('scroll', utils.debounce(function(evt){
        let top = window.pageYOffset || document.scrollTop;

        if(top === NaN || !top){
          item.classList.add('hidden')
        } else if(item.classList.contains('hidden')){
          item.classList.remove('hidden');
        }
        top = null;
        return;
      }, 250))

      item.append(
        h('i.icon-chevron-up')
      )
      return item;
  },
  status_bar: function(){

    let online_globe = h('div.globe.mr-2'),
    db_globe = online_globe.cloneNode(),
    db_current = h('span.ml-2'),
    sb = h('div.container-fluid.status-bar',
      h('div.row',
        h('div.col-6',
          h('div.status-left',
            h('i.icon-trash.text-success.cp.mr-2',{
              title: 'remove sensitive data',
              onclick: function(){
                ss.del('keyfile');
              }
            }),
            h('i.icon-database.text-success'),
            db_current
          )
        ),
        h('div.col-6',
          h('div.status-right',
            db_globe,
            online_globe
          )
        )
      )
    );


    if(navigator.onLine){
      utils.is_online(online_globe);
    } else {
      utils.is_offline(online_globe);
    }

    window.db_update = function(i){
      db_current.innerText = i;
    }

    window.addEventListener('online',  function(){
      utils.is_online(online_globe);
    })

    window.addEventListener('offline',  function(){
      utils.is_offline(online_globe);
    })

    return sb;

  },
  crypto_key: function(){

  },
  app_main: function(dest){
    let c_order = ['TWOFISH', 'AES', 'SERPENT'],
    app_main_base = h('div'),
    main_row = h('div.row'),
    msg_main = h('div');

    app_main_base.append(
      main_row,
      msg_main
    )

    window.onhashchange = function(){

      let dest = location.hash.slice(2);

      utils.empty(msg_main, function(){
        rout[dest](msg_main)
      })
    }

    return app_main_base

  },
  box_c_data: function(x,y,z){
    return h('div.col-4',
      h('div.form-group',
        h('label.w-100.text-success', x),
        h('input.form-control.inp-dark.ch',{
          readOnly: true,
          value: y,
          title: z
        })
      )
    )
  },
  box_c_inp: function(x){
    return h('div.col-8',
      h('div.form-group',
        h('label.w-100.text-success', 'Secret', h('i.icon-eye.float-right.cp', {
          onclick: function(){
            if(x.type === 'password'){
              x.type = 'text'
            } else {
              x.type = 'password'
            }
          }
        })),
        x
      )
    )
  },
  sec_inp: function(){
    return h('input.form-control.inp-dark.mb-2.ch',{
      type: 'password',
      readOnly: true
    })
  },
  box_c_info: function(x,y,z){
    return h('div.col-4',
      h('div.form-group',
        h('label.text-success', x),
        h('input.form-control.inp-dark.mb-2.ch',{
          readOnly: true,
          value: y,
          title: z
        })
      )
    )
  },
  box_info: function(title, val, info){
    return h('div.form-group',
      h('label.w-100.text-success', title),
      h('input.form-control.inp-dark.mb-2',{
       type: 'text',
       title: info,
       readOnly: true,
       value: val
     })
    )
  },
  msg_item: function(obj){

    return h('div.list-group-item',
      h('div.form-group',
        h('div.row',
          h('div.col-md-6',
            h('div.form-group',
              h('label.text-success', 'date posted'),
              h('input.form-control.inp-dark.mb-2',{
                type: 'text',
                readOnly: true,
                value: utils.fix_date(obj._createdOn)
              })
            )
          ),
          h('div.col-md-6',
            h('div.form-group',
              h('label.text-success', 'status'),
              h('input.form-control.inp-dark.mb-2',{
                type: 'text',
                readOnly: true,
                value: obj.is_valid
              })
            )
          )
        ),
        h('label.text-success', 'HMAC'),
        h('input.form-control.inp-dark.mb-2',{
          type: 'text',
          readOnly: true,
          value: obj.hmac
        }),
        h('label.text-success', 'Message'),
        h('textarea.form-control.inp-dark.mb-2',{
          rows: 5,
          readOnly: true,
          value: obj.ctext
        }),
        h('button.btn.btn-sm.btn-outline-success.mt-2.sh-95', {
          type: 'button',
          onclick: function(evt){
            // obj._id
          }
        }, 'Delete')
      )
    )
  }
}

Object.freeze(tpl);

export { tpl }
