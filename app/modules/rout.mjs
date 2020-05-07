import { h } from './h.mjs';
import { config } from './config.mjs';
import { tpl } from './tpl.mjs';
import { utils } from './utils.mjs';
import { enc } from './enc.mjs';
import { ls,ss } from "./storage.mjs";
import { xcrypt } from './xcrypt.mjs';



const rout = {
  crypto_key: function(dest){


    let key_inp_slug = h('input.form-control.inp-dark.mb-2',{
      type: 'text',
      autocomplete: 'new-password',
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
          kf.slug = evt.target.value;
          ss.set_enc('charmander', kf);
          cryptokey_inp.textContent = js(kf)
          db_update(kf.slug)
        }

      }
    }),
    key_inp_id = tpl.sec_inp(),
    key_inp_0 = tpl.sec_inp(),
    key_inp_1 = tpl.sec_inp(),
    key_inp_2 = tpl.sec_inp(),
    key_inp_3 = tpl.sec_inp(),
    key_inp_4 = tpl.sec_inp(),
    key_inp_5 = tpl.sec_inp(),
    enc_ta = h('sec-ta.form-control.inp-dark.mb-2.h-5', {
      textContent: 'Encrypted text'
    }),
    hm_inp = h('sec-inp.form-control.inp-dark.mb-3', {
      textContent: 'Message HMAC'
    }),
    dec_ta = h('sec-ta.form-control.inp-dark.mb-3.h-5', {
      textContent: 'Decrypted text'
    }),
    cryptokey_inp = h('sec-ta.form-control.inp-dark.h-10.sec-txt', {
      rows: 6
    }),
    import_inp = h('input.hidden', {type: 'file'}),
    export_key = h('small.float-right.cp.sh-95', {
      onclick: function(){
        let data = cryptokey_inp.textContent;
        utils.fs_write(data, 'cryptokey')
      }
    }, 'Export Cryptokey'),
    new_key = h('small.float-right.cp.sh-95', {
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
    }, 'New Cryptokey'),
    key_pass = h('input.form-control.inp-dark', {
      type: 'password',
      autocomplete: 'new-password',
      placeholder: 'Enter keyfile password'
    }),
    create_cipherkey = h('div.row',
      h('div.col-lg-6',
        h('h5.text-success', 'Cryptokey',
          h('i.icon-eye.float-right.cp.ml-4.float-right', {
            onclick: function(){
              cryptokey_inp.classList.toggle('sec-txt')
            }
          }),
          export_key,
          h('span.float-right.ml-2.mr-2', ' / '),
          new_key
        ),
        cryptokey_inp,
        h('div.input-group.input-group-sm.mt-2.mb-2',
          key_pass,
          h('div.input-group-append.ch',
            h('span.input-group-text.inp-dark.text-success', {
              title: 'Keyfile encryption method'
            }, 'AES-256-GCM')
          )
        ),
        h('button.btn.btn-sm.btn-outline-success.mt-2.sh-95.mr-2', {
          type: 'button',
          onclick: function(evt){
            utils.add_sp(evt.target, 'Selecting');
            import_inp.click();
            utils.del_sp(evt.target, 'Select file');
          }
        }, 'Select file'),
        h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.sh-95', {
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
                    return utils.toast('success', 'Cryptokey loaded');
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
        }, 'Load data'),
        h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.sh-95', {
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

        }, 'Encrypt keyfile'),
        h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.sh-95', {
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
        }, 'Decrypt keyfile'),
        h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.sh-95', {
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
                ls.set('eve', res);
                utils.toast('success','Encrypted Keyfile Stored locally');
              }
              utils.del_sp(evt.target, 'Store Local')
            })
          }
        }, 'Store Local'),
        h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.sh-95', {
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
        }, 'Load Local'),
        h('h5.text-success.mt-4', 'Create Message'),
        h('div.form-group.mt-4',
          h('textarea.form-control.inp-dark.mb-3', {
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
          }),
          enc_ta,
          hm_inp,
          dec_ta
        ),
        h('button.btn.btn-sm.btn-outline-success.mt-2.mr-2.mb-4.sh-95', {
          type: 'button',
          onclick: function(){
            let msg = enc_ta.textContent;

            if(msg.length < 1){
              return utils.toast('info','no message to send');
            }

            let kf = ss.get_enc('charmander');
            if(kf.slug === ''){
              return utils.toast('info', 'slug cannot be empty')
            }

            if(enc_ta.textContent === '' || enc_ta.textContent === 'Encrypted text'){
              return utils.toast('info', 'you have no encrypted message to send')
            }

            if(hm_inp.textContent === '' || hm_inp.textContent === 'Message HMAC'){
              return utils.toast('info', 'invalid HMAC')
            }

            let obj = {
              url: 'https://jsonbox.io/'+ kf.ID,
              api: kf.UUID,
              method: 'POST',
              body: {
                ctext: enc_ta.textContent,
                hmac: hm_inp.textContent,
                date: Date.now()
              }
            }
            // create here
            utils.box_add(obj, function(err,res){
              if(err){
                ce(err)
                return utils.toast('danger', 'failed to create new message')
              }
              cl(res)
              utils.toast('success', "new message stored");
              return
            });
          }
        }, 'Send Message'),
        import_inp
      ),
      h('div.col-lg-6',
        h('div.row',
          tpl.box_c_data('Cryptokey slug', 'SLUG', 'Enter a slug for your Cryptokey'),
          h('div.col-8',
            h('div.form-group',
              h('label.w-100.text-success', 'Enter a slug for your Cryptokey'),
              key_inp_slug
            )
          ),
          tpl.box_c_data('Cryptokey id', 'ID', 'Your unique Cryptokey id'),
          tpl.box_c_inp(key_inp_id),
          tpl.box_c_data('Cryptokey token', 'UUID', 'Cryptokey api auth token'),
          tpl.box_c_inp(key_inp_0),
          tpl.box_c_data('Cipher first round', config.crypt_order[0], 'Cipher used for the first round of encryption'),
          tpl.box_c_inp(key_inp_1),
          tpl.box_c_data('Cipher second round', config.crypt_order[1], 'Cipher used for the second round of encryption'),
          tpl.box_c_inp(key_inp_2),
          tpl.box_c_data('Cipher final round', config.crypt_order[2], 'Cipher used for the final round of encryption'),
          tpl.box_c_inp(key_inp_3),
          tpl.box_c_data('HMAC', 'SHA3-512', 'Authentication method to detect data tamper'),
          tpl.box_c_inp(key_inp_4),
          tpl.box_c_info('Mode', 'CBC', 'Block mode used by all ciphers'),
          tpl.box_c_info('Bits', '256 * 4', '256 bit encryption used by all ciphers'),
          tpl.box_c_info('KDF', 'PBKDF2', 'Key derivation function used to generate cipher keys'),
          h('div.col-12.text-right',
            h('button.btn.btn-sm.btn-outline-success.mt-2.sh-95', {
              type: 'button',
              onclick: function(evt){
                evt.target.setAttribute('disabled', true);
                let kf = ss.get_enc('charmander');
                if(kf.slug === ''){
                  return utils.toast('info', 'slug cannot be empty')
                }

                if(enc_ta.textContent === '' || enc_ta.textContent === 'Encrypted text'){
                  return utils.toast('info', 'you have no encrypted message to send')
                }

                if(hm_inp.textContent === '' || hm_inp.textContent === 'Message HMAC'){
                  return utils.toast('info', 'invalid HMAC')
                }

                let obj = {
                  url: 'https://jsonbox.io/'+ kf.ID,
                  api: kf.UUID,
                  method: 'POST',
                  body: {
                    ctext: enc_ta.textContent,
                    hmac: hm_inp.textContent,
                    date: Date.now()
                  }
                }
                // create here
                utils.box_add(obj, function(err,res){
                  if(err){
                    ce(err)
                    kf.UUID = enc.uuidv4();
                    ss.set_enc('charmander', kf);
                    cryptokey_inp.textContent = js(kf);
                    evt.target.removeAttribute('disabled');
                    return utils.toast('danger', 'unable to create crypto store, try again.')
                  }
                  cl(res)
                  utils.toast('success', "crypto store created. Export your keyfile");
                  return
                });

              }
            },'Create Store')
          )
        )
      )
    )

    dest.append(create_cipherkey)

  },
  crypto_store: function(dest){

    let kf = ss.get_enc('charmander');
    cl(kf)

    let info_div = h('div',
      tpl.box_info('Slug', kf.slug, 'Crypto store slug'),
    ),
    message_div = h('div.list-group list-group-flush')

    let store_base = h('div.row',
      h('div.col-md-3.col-sm-4',
        info_div
      ),
      h('div.col-md-9.col-sm-8',
        message_div
      )
    )

    utils.getJSON('https://jsonbox.io/_meta/'+ kf.ID, function(err,res){
      if(err){
        ce(err)
        return
      }

      if(res._count === 0){
        info_div.append(
          tpl.box_info('Message count', res._count, 'Crypto store items'),
          tpl.box_info('Status', 'Crypto store empty', 'Crypto store status')
        )
        return
      }

      res._createdOn = res._createdOn.replace('T', ' ').split('.')[0];

      info_div.append(
        tpl.box_info('Message count', res._count, 'Crypto store items'),
        tpl.box_info('Created', res._createdOn, 'Crypto store items'),
        tpl.box_info('Status', 'ok', 'Crypto store status')
      )

      if(res._updatedOn){
        res._updatedOn = res._updatedOn.replace('T', ' ').split('.')[0]
         info_div.append(tpl.box_info('Last update', res._updatedOn, 'Crypto store items'));
      }

      info_div.append(
        h('button.btn.btn-block.btn-sm.btn-outline-success.mt-2.sh-95', {
          type: 'button',
          onclick: function(evt){
            utils.add_sp(evt.target, 'Deleting');
            let kf = ss.get_enc('charmander');
            let url = 'https://jsonbox.io/'+ kf.ID + '?q=date:>0';
            utils.box_del({url: url, api: kf.UUID},function(err,res){
              if(err){
                utils.toast('danger', 'Failed to delete messages.');
                cl(err)
              } else {
                utils.toast('success', res.message);
                utils.emptySync(message_div)
              }
              utils.del_sp(evt.target, 'Delete All');
            })
          }
        }, 'Delete All')
      )

      utils.getJSON('https://jsonbox.io/'+ kf.ID, function(err,res){
        if(err){
          ce(err)
          return
        }
        let ptext;
        for (let i = 0; i < res.length; i++) {

          res[i].ctext = enc.dec_txt(res[i].ctext, [
            kf[config.crypt_order[0]],
            kf[config.crypt_order[1]],
            kf[config.crypt_order[2]]
          ], kf.HMAC) || 'invalid'


            res[i].is_valid = 'Valid'

          message_div.append(tpl.msg_item(res[i]))

        }

        cl(res)
      })
    })

    dest.append(store_base)
  },
  crypto_tools: function(dest){
    dest.append(h('p','crypto_tools'))
  },
  about: function(dest){
    dest.append(h('p','about'))
  }
}

Object.freeze(rout);

export { rout }
