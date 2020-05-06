import { h } from './h.mjs';
import { utils } from './utils.mjs';
import { ls,ss } from "./storage.mjs";
import { xcrypt } from './xcrypt.mjs';
import { enc } from './enc.mjs';
import { rout } from './rout.mjs';

const tpl = {
  header: function(){

    let lnk_div = h('div.nav.justify-content-end'),
    arr = ['crypto_key', 'crypto_store', 'crypto_tools', 'about'];


    for (let i = 0; i < arr.length; i++) {
      let dest = utils.capitalize(utils.un_snake_case(arr[i]));
      lnk_div.append(h('li.nav-item.cp.text-success',
        h('a.nav-link.sh-95', {
          onclick:function(){
            app.rout({title: dest , dest: arr[i]});
          }
        }, dest)
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

    let online_globe = h('i.icon-wifi.ml-2.ch'),
    db_current = h('span.ml-2'),
    sb = h('div.container-fluid.status-bar',
      h('div.row',
        h('div.col-6',
          h('div.status-left',
            h('i.icon-redo-alt.text-success.cp.mr-2',{
              title: 'Secure app reload',
              onclick: function(){
                ss.del('keyfile');
                app.reload()
              }
            }),
            h('i.icon-trash.text-success.cp.mr-2',{
              title: 'Click to remove all sensitive data before you leave this site',
              onclick: function(){
                ss.del('keyfile');
                utils.toast('success', 'sensitive data deleted')
              }
            }),
            h('i.icon-database.text-success.ch', {
              title: 'Current Crypto store',
            }),
            db_current
          )
        ),
        h('div.col-6',
          h('div.status-right',
            h('i.icon-rss.ml-2.text-success.cp',{
              title: 'rss',
              onclick: function(){

              }
            }),
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

    window.addEventListener("rout", function(evt) {
      evt = evt.detail;
      history.replaceState(null, "", evt.dest);
      utils.empty(msg_main, function(){
        rout[evt.dest](msg_main)
        document.title = evt.title;
      })
    });

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
            x.classList.toggle('sec-txt')
          }
        })),
        x
      )
    )
  },
  sec_inp: function(){
    return h('sec-inp.form-control.inp-dark.mb-2.sec-txt.ch')
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
    let lg_item = h('div.list-group-item')

    lg_item.append(
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
          ),
          h('div.col-md-6',
            h('div.form-group',
            h('label.text-success', 'ID'),
            h('input.form-control.inp-dark.mb-2',{
              type: 'text',
              readOnly: true,
              value: obj._id
            })
            )
          ),
          h('div.col-md-6',
            h('div.form-group',
              h('label.text-success', 'HMAC'),
              h('input.form-control.inp-dark.mb-2',{
                type: 'text',
                readOnly: true,
                value: obj.hmac
              })
            )
          )
        ),
        h('label.text-success', 'Decrypted Message'),
        h('sec-ta.form-control.inp-dark.mb-2.h-5', {
          innerText: obj.ctext
        }),
        h('button.btn.btn-sm.btn-outline-success.mt-2.sh-95', {
          type: 'button',
          onclick: function(evt){
            utils.add_sp(evt.target, 'Deleting');
            let kf = ss.get_enc('keyfile');
            let url = ['https://jsonbox.io', kf.ID, obj._id].join('/')
            utils.box_del({url: url, api: kf.UUID},function(err,res){
              if(err){
                utils.toast('danger', 'Failed to delete message.');
                utils.del_sp(evt.target, 'Deleting');
                return cl(err)
              }
              utils.toast('success', res.message);
              lg_item.remove();
            })
          }
        }, 'Delete')
      )
    )

    return lg_item
  }
}

Object.freeze(tpl);

export { tpl }