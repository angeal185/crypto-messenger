import { h } from './h.mjs';
import { utils } from './utils.mjs';
import { ls,ss } from "./storage.mjs";
import { xcrypt } from './xcrypt.mjs';
import { enc } from './enc.mjs';
import { config } from './config.mjs';
import { cnsl } from './cnsl.mjs';
import { rout } from './rout.mjs';

const tpl = {
  header: function(){

    let lnk_div = h('div.nav.justify-content-end'),
    arr = ['crypto_key', 'crypto_store', 'crypto_tools', 'about'];


    lnk_div.append(
      h('li.nav-item.cp.text-success',
        h('a.nav-link.sh-95', {
          onclick:function(){
            app.rout({title: 'Crypto key' , dest: 'crypto_key'});
          }
        }, 'Crypto Key')
      ),
      h('li.nav-item.cp.text-success',
        h('a.nav-link.sh-95', {
          onclick:function(){
            app.rout({title: 'Crypto OTP' , dest: 'crypto_otp'});
          }
        }, 'Crypto Pad')
      ),
      h('li.nav-item.cp.text-success',
        h('a.nav-link.sh-95', {
          onclick:function(){
            let i = ss.get('mode');
            i = ss.get_enc(i);
            if(!i || typeof i !== 'object' || !i.slug || i.slug === ''){
              return utils.toast('info','Invalid or no key data set.')
            }
            app.rout({title: 'Crypto store' , dest: 'crypto_store'});
          }
        }, 'Crypto Store')
      ),
      h('li.nav-item.cp.text-success',
        h('a.nav-link.sh-95', {
          onclick:function(){
            app.rout({title: 'Crypto tools' , dest: 'crypto_tools'});
          }
        }, 'Crypto Tools')
      ),
      h('li.nav-item.cp.text-success',
        h('a.nav-link.sh-95', {
          onclick:function(){
            app.rout({title: 'About' , dest: 'about'});
          }
        }, 'About')
      )
    )


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
    let color_picker = h('input.form-control.color-picker.inp-dark.mb-4.mt-4',{
      type:'color',
      title: 'theme',
      value: ls.get('growlithe') || '#000',
      onchange: function(evt){
        ls.set('growlithe', evt.target.value)
        utils.ud_theme(doc, evt.target.value)
      }
    }),
    baseTpl = h('app-main',
      tpl.header(),
      h('div.sub-content',
        tpl.to_top(),
        tpl.status_bar()
      ),
      h('div#main-content.container-fluid',
        tpl.app_main()
      ),
      color_picker
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
                ss.del('charmander');
                ss.del('mewtwo');
                location.href = utils.ensure_secure(config.app_path)
              }
            }),
            h('i.icon-trash.text-success.cp.mr-2',{
              title: 'Click to remove all sensitive data before you leave this site',
              onclick: function(){
                ss.del('charmander');
                ss.del('mewtwo');
                ss.del('lapras');
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
            h('i.icon-envelope.ml-2.text-success.cp',{
              title: config.email,
              onclick: function(){
                cnsl(['[auth:worker] ', 'opening poor-mans mailto link...'], ['lime','cyan']);
                let x = window.open('mailto:'+ config.email +'?subject=contact');
                setTimeout(function(){
                  x.close();
                  x = null;
                },500)
              }
            }),
            h('i.icon-rss.ml-2.text-success.cp',{
              title: 'rss',
              onclick: function(){
                cnsl(['[auth:worker] ', 'opening link to rss feed...'], ['lime','cyan']);
                window.open(config.rss, 'crypto-messenger RSS feed', 'noopener,noreferrer')
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
      db_current.textContent = i;
    }

    window.addEventListener('online',  function(){
      utils.is_online(online_globe);
    })

    window.addEventListener('offline',  function(){
      utils.is_offline(online_globe);
    })

    return sb;

  },
  app_main: function(){
    let app_main_base = h('app-content');

    window.addEventListener("rout", function(evt) {
      evt = evt.detail;
      history.replaceState(null, "", evt.dest);
      utils.empty(app_main_base, function(){
        rout[evt.dest](app_main_base)
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
  msg_item: function(obj, kf){
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
          textContent: obj.ptext
        }),
        h('button.btn.btn-sm.btn-outline-success.mt-2.sh-95', {
          type: 'button',
          onclick: function(evt){
            utils.add_sp(evt.target, 'Deleting');
            let url = [config.box, kf.ID, obj._id].join('/')
            utils.box_del({url: url, api: kf.UUID},function(err,res){
              if(err){
                utils.toast('danger', 'Failed to delete message.');
                utils.del_sp(evt.target, 'Deleting');
                return ce(err)
              }
              utils.toast('success', res.message);
              lg_item.remove();
            })
          }
        }, 'Delete')
      )
    )

    return lg_item
  },
  export_btn: function(cryptokey_inp, sel){
    return h('small.float-right.cp.sh-95', {
      onclick: function(){
        let data = cryptokey_inp.textContent,
        ctype;
        try {
          data = js(jp(data));
          ctype = 'application/json'
        } catch (err) {
          ctype = 'text/plain'
        }
        utils.fs_write(data, sel.replace(' ', '_'), ctype)
      }
    }, 'Export '+ sel)
  },
  welcome_div: function(info, sel){
    let item = h('div.card.dark-bg.mb-4',
      h('div.card-body',
        h('p', info),
        h('span.float-right.text-success.cp',{
          onclick: function(){
            ls.set(sel,true);
            item.remove()
          }
        },'dismiss')
      )
    )
    return item
  },
  import_inp: function(){
    return h('input.hidden', {type: 'file'})
  },
  key_pass: function(){
    return h('input.form-control.inp-dark', {
      autocomplete: 'new-password',
      placeholder: 'Enter keyfile password',
      onkeyup: function(evt){
        this.type = 'password';
        this.placeholder = '';
        this.onkeyup = null;
      }
    })
  },
  select_file: function(import_inp){
    return h('button.btn.btn-sm.btn-outline-success.mt-2.sh-95.mr-2', {
      type: 'button',
      onclick: function(evt){
        utils.add_sp(evt.target, 'Selecting');
        import_inp.click();
        utils.del_sp(evt.target, 'Select file');
      }
    }, 'Select file')
  },
  enc_file: function(key_pass, cryptokey_inp){
    return h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.sh-95', {
      type: 'button',
      onclick: function(evt){
        utils.add_sp(evt.target, 'Encrypting');
        let pass = key_pass.value;
        if(pass.length < 8){
          utils.toast('info','password length must be at least 8 characters');
          return utils.del_sp(evt.target, 'Encrypt keyfile');
        }

        enc.aes_gcm(pass, cryptokey_inp.textContent, 'enc', function(err,res){
          if(err){
            utils.toast('danger','invalid input data');
          } else {
            cryptokey_inp.textContent = xcrypt.pack(res);
            utils.toast('success','Keyfile encrypted');
          }
          utils.del_sp(evt.target, 'Encrypt keyfile');
        })
      }

    }, 'Encrypt keyfile')
  },
  dec_pad_file: function(key_pass,key_inp_slug, key_inp_id, key_inp_0, key_inp_1, cryptokey_inp){
    return h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.sh-95', {
      type: 'button',
      onclick: function(evt){
        utils.add_sp(evt.target, 'Decrypting');
        let pass = key_pass.value;
        if(pass.length < 8){
          utils.del_sp(evt.target, 'Decrypt keyfile');
          return utils.toast('info','password length must be at least 8 characters');
        }

        enc.aes_gcm(pass, xcrypt.pack(cryptokey_inp.textContent), 'dec', function(err,res){
          if(err){
            utils.toast('danger','invalid input data');
            utils.del_sp(evt.target, 'Decrypt keyfile');
            ce(err)
          } else {
            try {
              res = jp(res);
              utils.add_otp_data(
                js(res), key_inp_slug, key_inp_id, key_inp_0,
                key_inp_1, cryptokey_inp
              )
              utils.toast('success','Keyfile decrypted and loaded');
            } catch (err) {
              utils.toast('danger','invalid input data');
            }
          }
          utils.del_sp(evt.target, 'Decrypt keyfile');
        })
      }
    }, 'Decrypt keyfile')
  },
  dec_cipher_file: function(key_pass, key_inp_slug, key_inp_id, key_inp_0,key_inp_1, key_inp_2, key_inp_3, key_inp_4,cryptokey_inp){
    return h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.sh-95', {
      type: 'button',
      onclick: function(evt){
        utils.add_sp(evt.target, 'Decrypting');
        let pass = key_pass.value;
        if(pass.length < 8){
          utils.del_sp(evt.target, 'Decrypt keyfile');
          return utils.toast('info','password length must be at least 8 characters');
        }

        enc.aes_gcm(pass, xcrypt.pack(cryptokey_inp.textContent), 'dec', function(err,res){
          if(err){
            utils.toast('danger','invalid input data');
            utils.del_sp(evt.target, 'Decrypt keyfile');
            ce(err)
          } else {
            try {
              utils.add_data(
                res, key_inp_slug, key_inp_id, key_inp_0,
                key_inp_1, key_inp_2, key_inp_3, key_inp_4,
                cryptokey_inp
              )
              utils.toast('success','Keyfile decrypted and loaded');
            } catch (err) {
              utils.toast('danger','invalid input data');
            }
          }
          utils.del_sp(evt.target, 'Decrypt keyfile');
        })
      }
    }, 'Decrypt keyfile')
  },
  key_type_head: function(title, cryptokey_inp, export_key, new_key){
    return h('h5.text-success', title,
      h('i.icon-eye.float-right.cp.ml-4.float-right', {
        onclick: function(){
          cryptokey_inp.classList.toggle('sec-txt')
        }
      }),
      export_key,
      h('span.float-right.ml-2.mr-2', ' / '),
      new_key
    )
  },
  key_enc_group: function(key_pass){
    return h('div.input-group.input-group-sm.mt-2.mb-2',
      key_pass,
      h('div.input-group-append.ch',
        h('span.input-group-text.inp-dark.text-success', {
          title: 'Keyfile encryption method'
        }, 'AES-256-GCM')
      )
    )
  },
  cipher_send_btn: function(enc_ta, hm_inp, mode, idx){
    return h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.mb-4.sh-95', {
      type: 'button',
      onclick: function(){
        let msg = enc_ta.textContent;

        if(msg.length < 1){
          return utils.toast('info','no message to send');
        }

        let kf = ss.get_enc(mode);


        if(kf.slug === ''){
          return utils.toast('info', 'slug cannot be empty')
        }

        if(enc_ta.textContent === '' || enc_ta.textContent === 'Encrypted text'){
          return utils.toast('info', 'you have no encrypted message to send')
        }

        if(hm_inp.textContent === '' || hm_inp.textContent === 'Message HMAC'){
          return utils.toast('info', 'invalid HMAC')
        }

        let body = {
          ctext: enc_ta.textContent,
          hmac: hm_inp.textContent,
          date: Date.now()
        }

        if(mode === 'mewtwo'){
          let i = Math.floor(parseInt(idx.value))
          if(!i || typeof i !== 'number' || i < 1 || i > config.pad_max){
            return utils.toast('info', 'invalid pad index')
          }
          body.idx = i
        }

        let obj = {
          url: [config.box, kf.ID].join('/'),
          api: kf.UUID,
          method: 'POST',
          body: body
        }

        utils.box_add(obj, function(err,res){
          if(err){
            ce(err)
            return utils.toast('danger', 'failed to create new message')
          }

          utils.toast('success', "new message stored");
          return
        });
      }
    }, 'Send Message')
  },
  store_local_btn: function(mode, key_pass, cryptokey_inp){
    return h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.sh-95', {
      type: 'button',
      onclick: function(evt){
        utils.add_sp(evt.target, 'Saving data');
        let pass = key_pass.value;
        if(pass.length < 8){
          utils.toast('info','password length must be at least 8 characters');
          return utils.del_sp(evt.target, 'Store Local');
        }

        enc.aes_gcm(pass, cryptokey_inp.textContent, 'enc', function(err,res){
          if(err){
            utils.toast('danger','invalid input data');
            ce(err);
          } else {
            res = xcrypt.pack(res);
            ls.set(mode, res);
            utils.toast('success','Encrypted Keyfile Stored locally');
          }
          utils.del_sp(evt.target, 'Store Local')
        })

      }
    }, 'Store Local')
  },
  load_data_pad: function(import_inp,key_inp_slug, key_inp_id, key_inp_0,key_inp_1, cryptokey_inp){
    return h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.sh-95', {
      type: 'button',
      onclick: function(evt){
        utils.add_sp(evt.target, 'Loading data');
        try {
          var reader = new FileReader();
          var file = import_inp.files[0];
          reader.onload = function(e) {
            try {

              e = jp(e.target.result);

              if(e.ID){
                utils.add_otp_data(
                  js(e), key_inp_slug, key_inp_id, key_inp_0,
                  key_inp_1, cryptokey_inp
                )
                utils.del_sp(evt.target, 'Load data');
                return utils.toast('success', 'Crypto pad loaded');
              } else {
                throw 'not json'
              }

            } catch (err) {
              cryptokey_inp.textContent = evt.target.result;
              utils.toast('info', 'data loaded');
              utils.del_sp(evt.target, 'Load data');
            }
          };

          reader.readAsText(file);
        } catch (err) {
          utils.toast('warning', 'No file chosen');
          utils.del_sp(evt.target, 'Load data');
        }
      }
    }, 'Load data')
  },
  load_data_cipher: function(import_inp, key_inp_slug, key_inp_id, key_inp_0,key_inp_1, key_inp_2, key_inp_3, key_inp_4,cryptokey_inp){
    return h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.sh-95', {
      type: 'button',
      onclick: function(evt){
        utils.add_sp(evt.target, 'Loading data');
        try {
          var reader = new FileReader();
          var file = import_inp.files[0];
          reader.onload = function(e) {
            try {
              e = jp(e.target.result);
              if(e.ID){
                utils.add_data(
                  js(e), key_inp_slug, key_inp_id, key_inp_0,
                  key_inp_1, key_inp_2, key_inp_3, key_inp_4,
                  cryptokey_inp
                )
                utils.del_sp(evt.target, 'Load data');
                return utils.toast('success', 'Crypto key loaded');
              } else {
                throw 'not json'
              }

            } catch (err) {
              cryptokey_inp.textContent = evt.target.result;
              utils.toast('info', 'data loaded');
              utils.del_sp(evt.target, 'Load data');
            }
          };

          reader.readAsText(file);
        } catch (err) {
          utils.toast('warning', 'No file chosen');
          utils.del_sp(evt.target, 'Load data');
        }
      }
    }, 'Load data')
  },
  load_local_pad: function(key_pass,key_inp_slug, key_inp_id, key_inp_0,key_inp_1, cryptokey_inp){
    return h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.sh-95', {
      type: 'button',
      onclick: function(evt){
        utils.add_sp(evt.target, 'Loading data');
        let pass = key_pass.value,
        data = ls.get('vaporeon');

        if(pass.length < 8){
          utils.del_sp(evt.target, 'Load Local');
          return utils.toast('info','password length must be at least 8 characters');
        }

        if(!data || typeof data !== 'string' || data === ''){
          utils.del_sp(evt.target, 'Load Local');
          return utils.toast('info','Encrypted Keyfile not found');
        }

        enc.aes_gcm(pass, data, 'dec', function(err,res){
          if(err){
            utils.toast('danger','Invalid Keyfile');
            ce(err);
          } else {
            try {
              res = jp(res);
              utils.add_otp_data(
                js(res), key_inp_slug, key_inp_id, key_inp_0,
                key_inp_1, cryptokey_inp
              )
              utils.toast('success','Keyfile decrypted and loaded');
            } catch (err) {
              utils.toast('danger','Invalid Keyfile');
            }
          }
          utils.del_sp(evt.target, 'Load Local');
        })
      }
    }, 'Load Local')
  },
  load_local_cipher: function(key_pass,key_inp_slug, key_inp_id, key_inp_0,key_inp_1, key_inp_2, key_inp_3, key_inp_4,cryptokey_inp){
    return h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.sh-95', {
      type: 'button',
      onclick: function(evt){
        utils.add_sp(evt.target, 'Loading data');
        let pass = key_pass.value,
        data = ls.get('eve');

        if(pass.length < 8){
          utils.del_sp(evt.target, 'Load Local');
          return utils.toast('info','password length must be at least 8 characters');
        }

        if(!data || typeof data !== 'string' || data === ''){
          utils.del_sp(evt.target, 'Load Local');
          return utils.toast('info','Encrypted Keyfile not found');
        }

        enc.aes_gcm(pass, data, 'dec', function(err,res){
          if(err){
            utils.toast('danger','Invalid Keyfile');
            ce(err);
          } else {
            try {
              utils.add_data(
                res, key_inp_slug, key_inp_id, key_inp_0,
                key_inp_1, key_inp_2, key_inp_3, key_inp_4,
                cryptokey_inp
              )
              utils.toast('success','Keyfile decrypted and loaded');
            } catch (err) {
              utils.toast('danger','Invalid Keyfile');
            }
          }
          utils.del_sp(evt.target, 'Load Local');
        })
      }
    }, 'Load Local')
  },
  sec_inp_base: function(a,b,c){
    return h('sec-'+ a +'.form-control.inp-dark.mb-3.h-'+ b, {
      textContent: c
    })
  },
  slug_inp_head: function(key_inp_slug, sel){
    return h('div.col-8',
      h('div.form-group',
        h('label.w-100.text-success', 'Enter a slug for your Crypto '+ sel),
        key_inp_slug
      )
    )
  },
  pad_ctext_msg: function(pad_index_inp,key_inp_slug, key_inp_id, key_inp_0,key_inp_1, cryptokey_inp,enc_ta,hm_inp,dec_ta){
    return h('textarea.form-control.inp-dark.mb-3', {
      autocomplete: 'off',
      rows: 3,
      placeholder: 'Start typing your message...',
      onkeyup: utils.debounce(function(evt){
        let padidx = parseInt(pad_index_inp.value),
        kf = ss.get_enc('mewtwo');

        if(!padidx || padidx < 1 || padidx > config.pad_max){
          return utils.toast('danger', 'invalid pad index')
        }

        padidx--

        if(!kf){
          enc.create_pad_data(function(err,res){
            if(err){
              return utils.toast('danger', 'failed to create crypto pad data')
            }
            utils.add_otp_data(
              js(res), key_inp_slug, key_inp_id, key_inp_0,
              key_inp_1, cryptokey_inp
            )
          })
        } else {

          let msg = evt.target.value,
          obj = enc.enc_pad(msg, kf.items[padidx], kf.HMAC);

          if(obj && obj.msg && obj.hmac){
            enc_ta.textContent = obj.msg;
            hm_inp.textContent = obj.hmac;
            dec_ta.textContent = obj.dec;
          } else {
            enc_ta.textContent = '';
            hm_inp.textContent = '';
            dec_ta.textContent = ''
          }
        }


      },1000)
    })
  },
  cipher_ctext_msg: function(key_inp_slug, key_inp_id, key_inp_0, key_inp_1, key_inp_2, key_inp_3, key_inp_4,cryptokey_inp,enc_ta,hm_inp,dec_ta){
    return h('textarea.form-control.inp-dark.mb-3', {
      autocomplete: 'off',
      rows: 3,
      placeholder: 'Start typing your message...',
      onkeyup: function(evt){
        let kf = ss.get_enc('charmander');
        if(!kf){
          enc.create_cipherkey_data(function(err,res){
            if(err){dest.append(h('h5.text-danger', 'failed to create crypto key data'))}
            utils.add_data(
              js(res), key_inp_slug, key_inp_id, key_inp_0,
              key_inp_1, key_inp_2, key_inp_3, key_inp_4,
              cryptokey_inp
            )
          })
        } else {
          let msg = evt.target.value,
          obj = enc.enc_msg(msg, [
            kf[config.crypt_order[0]],
            kf[config.crypt_order[1]],
            kf[config.crypt_order[2]]
          ], kf.HMAC);

          if(obj && obj.msg && obj.hmac){
            enc_ta.textContent = obj.msg;
            hm_inp.textContent = obj.hmac;
            dec_ta.textContent = obj.dec;
          } else {
            enc_ta.textContent = '';
            hm_inp.textContent = '';
            dec_ta.textContent = ''
          }
        }
      }
    })
  },
  cipher_slug_inp: function(key_inp_id, key_inp_0,key_inp_1, key_inp_2, key_inp_3, key_inp_4,cryptokey_inp){
    return h('input.form-control.inp-dark.mb-2',{
      type: 'text',
      autocomplete: 'new-password',
      onkeyup: function(evt){
        let kf = ss.get_enc('charmander');
        if(!kf){
          enc.create_cipherkey_data(function(err,res){
            if(err){dest.append(h('h5.text-danger', 'failed to create crypto key data'))}
            utils.add_data(
              js(res), evt.target, key_inp_id, key_inp_0,
              key_inp_1, key_inp_2, key_inp_3, key_inp_4,
              cryptokey_inp
            )
          })
        } else {
          kf.slug = evt.target.value;
          ss.set_enc('charmander', kf);
          cryptokey_inp.textContent = js(kf)
          db_update(kf.slug)
        }

      }
    })
  },
  cipher_key_create: function(key_inp_slug, key_inp_id, key_inp_0,key_inp_1, key_inp_2, key_inp_3, key_inp_4,cryptokey_inp){
    return h('small.float-right.cp.sh-95', {
      onclick: function(){
        enc.create_cipherkey_data(function(err,res){
          if(err){dest.append(h('h5.text-danger', 'failed to create crypto key data'))}
          utils.add_data(
            js(res), key_inp_slug, key_inp_id, key_inp_0,
            key_inp_1, key_inp_2, key_inp_3, key_inp_4,
            cryptokey_inp
          )
        })
      }
    }, 'New Crypto key')
  },
  pad_key_create: function(key_inp_slug, key_inp_id, key_inp_0,key_inp_1, cryptokey_inp){
    return h('small.float-right.cp.sh-95', {
      onclick: function(){
        enc.create_pad_data(function(err,res){
          if(err){dest.append(h('h5.text-danger', 'failed to create crypto pad data'))}
          utils.add_otp_data(
            js(res), key_inp_slug, key_inp_id, key_inp_0,key_inp_1, cryptokey_inp
          )
        })
      }
    }, 'New Crypto pad')
  },
  pad_slug_inp: function(key_inp_id, key_inp_0,key_inp_1,cryptokey_inp){
    return h('input.form-control.inp-dark.mb-2',{
      type: 'text',
      autocomplete: 'new-password',
      onkeyup: function(evt){
        let kf = ss.get_enc('mewtwo');
        if(!kf){
          enc.create_pad_data(function(err,res){
            if(err){
              return utils.toast('danger', 'failed to create crypto pad data')
            }
            utils.add_otp_data(
              js(res), evt.target, key_inp_id, key_inp_0, key_inp_1, cryptokey_inp
            )
          })
        } else {

          kf.slug = evt.target.value;
          ss.set_enc('mewtwo', kf);
          cryptokey_inp.textContent = js(kf)
          db_update(kf.slug)

        }

      }
    })
  },
  pad_index_inp: function(){
    return h('input.form-control.inp-dark.text-center',{
      type: 'number',
      min: 1,
      max: config.pad_max
    })
  },
  pad_index_group: function(pad_index_inp){
    return h('div.input-group.input-group-sm.mb-2',
      h('div.input-group-prepend',
        h('div.input-group-text.inp-dark', 'pad index')
      ),
      pad_index_inp
    )
  }
}

Object.freeze(tpl);

export { tpl }
