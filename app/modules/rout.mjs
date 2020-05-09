import { h } from './h.mjs';
import { config } from './config.mjs';
import { tpl } from './tpl.mjs';
import { utils } from './utils.mjs';
import { enc } from './enc.mjs';
import { ls,ss } from "./storage.mjs";
import { xcrypt } from './xcrypt.mjs';



const rout = {
  crypto_key: function(dest){

    utils.change_mode('charmander');

    let key_inp_id = tpl.sec_inp(),
    key_inp_0 = tpl.sec_inp(),
    key_inp_1 = tpl.sec_inp(),
    key_inp_2 = tpl.sec_inp(),
    key_inp_3 = tpl.sec_inp(),
    key_inp_4 = tpl.sec_inp(),
    key_inp_5 = tpl.sec_inp(),
    enc_ta = tpl.sec_inp_base('ta', '5', 'Encrypted text'),
    hm_inp = tpl.sec_inp_base('inp', '3', 'Message HMAC'),
    dec_ta = tpl.sec_inp_base('ta', '5', 'Decrypted text'),
    cryptokey_inp = h('sec-ta.form-control.inp-dark.h-10.sec-txt'),
    key_inp_slug = tpl.cipher_slug_inp(key_inp_id, key_inp_0,key_inp_1, key_inp_2, key_inp_3, key_inp_4,cryptokey_inp),
    import_inp = tpl.import_inp(),
    export_key = tpl.export_btn(cryptokey_inp, 'Crypto key'),
    new_key = tpl.cipher_key_create(key_inp_slug, key_inp_id, key_inp_0,key_inp_1, key_inp_2, key_inp_3, key_inp_4,cryptokey_inp),
    key_pass = tpl.key_pass(),
    welcome_div = tpl.welcome_div(config.cipher_info, 'bulbasaur'),
    create_cipherkey = h('div.row',
      h('div.col-12'),
      h('div.col-lg-6',
        tpl.key_type_head('Crypto key', cryptokey_inp, export_key, new_key),
        cryptokey_inp,
        tpl.key_enc_group(key_pass),
        tpl.select_file(import_inp),
        tpl.load_data_cipher(import_inp, key_inp_slug, key_inp_id, key_inp_0,key_inp_1, key_inp_2, key_inp_3, key_inp_4,cryptokey_inp),
        tpl.enc_file(key_pass, cryptokey_inp),
        tpl.dec_cipher_file(key_pass, key_inp_slug, key_inp_id, key_inp_0,key_inp_1, key_inp_2, key_inp_3, key_inp_4,cryptokey_inp),
        tpl.store_local_btn('eve', key_pass, cryptokey_inp),
        tpl.load_local_cipher(key_pass,key_inp_slug, key_inp_id, key_inp_0,key_inp_1, key_inp_2, key_inp_3, key_inp_4,cryptokey_inp),
        h('h5.text-success.mt-4', 'Create Message'),
        h('div.form-group.mt-4',
          tpl.cipher_ctext_msg(key_inp_slug, key_inp_id, key_inp_0, key_inp_1, key_inp_2, key_inp_3, key_inp_4,cryptokey_inp,enc_ta,hm_inp,dec_ta),
          enc_ta,hm_inp,dec_ta
        ),
        tpl.cipher_send_btn(enc_ta, hm_inp, 'charmander', 0),
        import_inp
      ),
      h('div.col-lg-6',
        h('div.row',
          tpl.box_c_data('Cryptokey slug', 'SLUG', 'Enter a slug for your Cryptokey'),
          tpl.slug_inp_head(key_inp_slug, 'key'),
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
          tpl.box_c_data('HMAC', config.hash, 'Authentication method to detect data tamper'),
          tpl.box_c_inp(key_inp_4),
          tpl.box_c_info('Mode', 'CBC', 'Block mode used by all ciphers'),
          tpl.box_c_info('Bits', '256 * 3', '256 bit encryption used by all ciphers'),
          tpl.box_c_info('KDF', 'PBKDF2', 'Key derivation function used to generate cipher keys')
        )
      )
    )

    if(!ls.get('bulbasaur')){
      create_cipherkey.firstChild.append(welcome_div)
    }

    dest.append(create_cipherkey)

    let cdata = ss.get_enc('charmander');
    if(cdata && typeof cdata === 'object'){
      utils.add_data(
        js(cdata), key_inp_slug, key_inp_id, key_inp_0,
        key_inp_1, key_inp_2, key_inp_3, key_inp_4,
        cryptokey_inp
      )
    }

  },
  crypto_store: function(dest){


    let mode = ss.get('mode'),
    kf = ss.get_enc(mode);


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

    utils.getJSON([config.box, '_meta', kf.ID].join('/'), function(err,res){
      if(err){
        ce(err)
        utils.toast('danger', 'failed to fetch Crypto store data')
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
            let kf = ss.get_enc('charmander'),
            url = [config.box, kf.ID].join('/') + '?q=date:>0';
            utils.box_del({url: url, api: kf.UUID},function(err,res){
              if(err){
                utils.toast('danger', 'Failed to delete messages.');
                ce(err)
              } else {
                utils.toast('success', res.message);
                utils.emptySync(message_div)
              }
              utils.del_sp(evt.target, 'Delete All');
            })
          }
        }, 'Delete All'),
        h('button.btn.btn-block.btn-sm.btn-outline-success.mt-2.sh-95', {
          type: 'button',
          onclick: function(evt){
            utils.add_sp(evt.target, 'Exporting Store');
            let data = ss.get_enc('lapras');
            if(!data || typeof data !== 'object'){
              utils.toast('info', 'No data to export');
            } else {
              utils.fs_write(js(data), kf.slug, 'application/json');
            }
            utils.del_sp(evt.target, 'Export Store');
          }
        }, 'Export Store')
      )

      utils.getJSON([config.box, kf.ID].join('/'), function(err,res){
        if(err || !res){
          ce(err)
          return
        }
        cl(res)
        let len = res.length,
        ptext;
        if(len > 0){
          ss.set_enc('lapras', res)

          if(mode === 'charmander'){
            for (let i = 0; i < res.length; i++) {

              let dec_data = enc.dec_msg(res[i].ctext, [
                kf[config.crypt_order[0]],
                kf[config.crypt_order[1]],
                kf[config.crypt_order[2]]
              ], kf.HMAC)

              res[i].ptext = dec_data.ptext;

              if(dec_data.hmac === res[i].hmac){
                res[i].is_valid = 'Valid'
              } else {
                res[i].is_valid = 'invalid'
              }

              message_div.append(tpl.msg_item(res[i], kf))

            }
          } else if(mode === 'mewtwo'){
            for (let i = 0; i < res.length; i++) {
              let dec_data = enc.dec_pad(res[i].ctext, kf.items[res[i].idx - 1], kf.HMAC)

              res[i].ptext = dec_data.ptext;

              if(dec_data.hmac === res[i].hmac){
                res[i].is_valid = 'Valid'
              } else {
                res[i].is_valid = 'invalid'
              }

              message_div.append(tpl.msg_item(res[i], kf))
            }
          }

        } else {
          ss.del('lapras')
        }

      })
    })

    dest.append(store_base)
  },
  crypto_otp: function(dest){

    utils.change_mode('mewtwo');

    let key_inp_id = tpl.sec_inp(),
    key_inp_0 = tpl.sec_inp(),
    key_inp_1 = tpl.sec_inp(),
    key_inp_2 = tpl.sec_inp(),
    enc_ta = tpl.sec_inp_base('ta', '5', 'Encrypted text'),
    hm_inp = tpl.sec_inp_base('inp', '3', 'Message HMAC'),
    dec_ta = tpl.sec_inp_base('ta', '5', 'Decrypted text'),
    cryptokey_inp = h('sec-ta.form-control.inp-dark.h-10.sec-txt'),
    key_inp_slug = tpl.pad_slug_inp(key_inp_id, key_inp_0, key_inp_1,cryptokey_inp),
    import_inp = tpl.import_inp(),
    pad_index_inp = tpl.pad_index_inp(),
    export_key = tpl.export_btn(cryptokey_inp, 'Crypto pad'),
    new_key = tpl.pad_key_create(key_inp_slug, key_inp_id, key_inp_0,key_inp_1, cryptokey_inp),
    key_pass = tpl.key_pass(),
    welcome_div = tpl.welcome_div(config.otp_info, 'diglett'),
    create_cipherkey = h('div.row',
      h('div.col-12'),
      h('div.col-lg-6',
        tpl.key_type_head('Crypto pad', cryptokey_inp, export_key, new_key),
        cryptokey_inp,
        tpl.key_enc_group(key_pass),
        tpl.select_file(import_inp),
        tpl.load_data_pad(import_inp,key_inp_slug, key_inp_id, key_inp_0,key_inp_1, cryptokey_inp),
        tpl.enc_file(key_pass, cryptokey_inp),
        tpl.dec_pad_file(key_pass,key_inp_slug, key_inp_id, key_inp_0, key_inp_1, cryptokey_inp),
        tpl.store_local_btn('vaporeon', key_pass, cryptokey_inp),
        tpl.load_local_pad(key_pass,key_inp_slug, key_inp_id, key_inp_0,key_inp_1, cryptokey_inp),
        h('h5.text-success.mt-4', 'Create Message'),
        h('div.form-group.mt-4',
          tpl.pad_index_group(pad_index_inp),
          tpl.pad_ctext_msg(pad_index_inp, key_inp_slug, key_inp_id, key_inp_0, key_inp_1, cryptokey_inp, enc_ta, hm_inp, dec_ta),
          enc_ta, hm_inp, dec_ta
        ),
        tpl.cipher_send_btn(enc_ta, hm_inp, 'mewtwo', pad_index_inp),
        import_inp
      ),
      h('div.col-lg-6',
        h('div.row',
          tpl.box_c_data('Crypto pad slug', 'SLUG', 'Enter a slug for your Crypto pad'),
          tpl.slug_inp_head(key_inp_slug, 'pad'),
          tpl.box_c_data('Crypto pad id', 'ID', 'Your unique Cryptokey id'),
          tpl.box_c_inp(key_inp_id),
          tpl.box_c_data('Crypto pad token', 'UUID', 'Crypto pad api auth token'),
          tpl.box_c_inp(key_inp_0),
          tpl.box_c_data('HMAC', config.hash, 'Authentication method to detect data tamper'),
          tpl.box_c_inp(key_inp_1),
          tpl.box_c_info('Mode', 'OTP', 'Cipher used'),
          tpl.box_c_info('KDF', 'PBKDF2', 'Key derivation function used')
        )
      )
    )

    let cdata = ss.get_enc('mewtwo');
    if(cdata && typeof cdata === 'object'){
      utils.add_otp_data(
        js(cdata), key_inp_slug, key_inp_id, key_inp_0,
        key_inp_1, cryptokey_inp
      )
    }

    if(!ls.get('diglett')){
      create_cipherkey.firstChild.append(welcome_div)
    }

    dest.append(create_cipherkey)

  },
  crypto_tools: function(dest){
    dest.append(h('p','crypto_tools'))
  },
  about: function(dest){
    dest.append(h('p','silence is golden'))
  }
}

Object.freeze(rout);

export { rout }
