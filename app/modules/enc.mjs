import { config } from './config.mjs';
import { xcrypt } from './xcrypt.mjs';
import  jsSHA  from "./sha.mjs";


const enc = {
  rnd: function(i){
    return window.crypto.getRandomValues(new Uint8Array(i))
  },
  rnd_id: function(){
    return xcrypt.hex_encode(window.crypto.getRandomValues(new Uint8Array(16)))
  },
  uuidv4: function() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c){
      return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    });
  },
  pbkdf2_rnd: function(len,cb){
    wcs.importKey('raw', enc.rnd(512),{name: 'PBKDF2'},false,['deriveBits'])
    .then(function(key) {
      wcs.deriveBits({
        "name": "PBKDF2",
        salt: enc.rnd(512),
        iterations: 10000,
        hash: {name: "SHA-512"}},
        key, len
      )
      .then(function(bits){
        cb(false, new Uint8Array(bits));
      })
      .catch(function(err){
        cb(err);
      });
    })
    .catch(function(err){
      cb(err);
    });
  },
  create_cipherkey_data: function(cb){

    enc.pbkdf2_rnd(1280, function(err, res){
      if(err){
        cb(true)
        return ce(err)
      }

      res = xcrypt.hex_encode(res);

      let obj = {
        slug: '',
        ID: xcrypt.hex_encode(enc.rnd(16)),
        UUID: enc.uuidv4(),
        HMAC: res.substring(192, 256)
      }

      obj[config.crypt_order[0]] = res.substring(0, 64)
      obj[config.crypt_order[1]] = res.substring(64, 128)
      obj[config.crypt_order[2]] = res.substring(128, 192)

      cb(false, obj)
    })
  },
  is_equal: function(x,y){
    return xcrypt.utf82str(x) === xcrypt.utf82str(y)
  },
  enc_msg: function(ptext, arr, hkey){
    try {
      if(ptext.length < 1){
        return undefined
      }

      ptext = xcrypt.str2utf8(ptext);

      let final = xcrypt.enc3x(ptext, arr, config.crypt_order, 'hex'),
      sha_ob = new jsSHA('SHA3-512', 'UINT8ARRAY');

      sha_ob.setHMACKey(hkey, 'HEX');
      sha_ob.update(final);

      let obj = {
        msg: xcrypt.hex_encode(final),
        hmac: sha_ob.getHMAC('HEX'),
        dec: xcrypt.utf82str(xcrypt.dec3x(final, arr, config.crypt_order, 'hex'))
      };

      return obj;

    } catch (err) {
      ce(err)
      return undefined;
    }
  },
  dec_txt: function(ctext, arr, hkey){
    try {

      ctext = xcrypt.hex_decode(ctext)

      let sha_ob = new jsSHA('SHA3-512', 'UINT8ARRAY');

      sha_ob.setHMACKey(hkey, 'HEX');
      sha_ob.update(ctext);
      sha_ob.getHMAC('HEX');

      return {
        ptext: xcrypt.utf82str(xcrypt.dec3x(ctext, arr, config.crypt_order, 'hex')),
        hmac: sha_ob.getHMAC('HEX')
      }

    } catch (err) {
      ce(err)
      return undefined;
    }
  },
  create_box: function(cb){


    let key_obj = {
      id: xcrypt.hex_encode(enc.rnd(16)),
      api: enc.uuidv4()
    }

  },
  aes_gcm: function(password, data, mode, cb){

    let shaObj = new jsSHA("SHA3-512", "TEXT", { encoding: "UTF8" }),
    iv;

    shaObj.update(password);

    let hash = shaObj.getHash("UINT8ARRAY");

    wcs.importKey('raw', hash.slice(0,32),{name: 'PBKDF2'},false,["deriveKey"])
    .then(function(key) {
      wcs.deriveKey({"name": "PBKDF2",salt: hash.slice(32,64),iterations: 1000,hash: {name: "SHA-512"}},key,{name: "AES-GCM",length: 256},false,["encrypt", "decrypt"])
      .then(function(ekey){

        if(mode === 'enc'){
          //encrypt
          iv = window.crypto.getRandomValues(new Uint8Array(12));
          data = Uint8Array.from(xcrypt.str2utf8(data));
          wcs.encrypt({name: "AES-GCM",iv: iv,tagLength: 128},ekey,data)
          .then(function(encrypted){
            cl(xcrypt.hex_encode(iv).length)
            let ctext = xcrypt.pack(xcrypt.hex_encode(iv) + xcrypt.hex_encode(new Uint8Array(encrypted)));
            cb(false, ctext);
          })
          .catch(function(err){
            cb(err);
          });

        } else if(mode === 'dec'){
          //decrypt

          iv = Uint8Array.from(xcrypt.hex_decode(data.slice(0,24)));
          data = Uint8Array.from(xcrypt.hex_decode(data.slice(24)));
          wcs.decrypt({name: "AES-GCM",iv: iv,tagLength: 128},ekey,data)
          .then(function(decrypted){
            cl(xcrypt.utf82str(new Uint8Array(decrypted)))
            cb(false, xcrypt.utf82str(new Uint8Array(decrypted)));
          })
          .catch(function(err){

            ce(err);
          });

        }
      })
      .catch(function(err){
        cb(err);
      });
    })
    .catch(function(err){
      cb(err);
    });

  }
}

Object.freeze(xcrypt);
export { enc }
