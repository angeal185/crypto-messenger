import { xcrypt } from './xcrypt.mjs';
import { config } from './config.mjs';
import { enc } from './enc.mjs';

function BitShift(){

  const MIN = 0,
  MAX = 255,
  ITER = 3;


  const utils = {
    secRand: function(i) {
      return window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295 * i;
    },
    randomBytes: function (n) {
      var bytes = new Uint8Array(n)
      for (let i = 0; i < n; i++) {
        bytes[i] = Math.round(utils.secRand(MAX));
      }
      return bytes;
    },
    pad_gen: function(obj){
      obj.items = [];
      for (let i = 0; i < 30; i++) {
        obj.items.push(xcrypt.pack(xcrypt.hex_encode(utils.randomBytes(config.max_len))))
      }
      return obj;
    },
    sup: function(i, shift) {
      if ((i + shift) > MAX) {
        i = MIN + i + shift - MAX;
      } else {
        i = i + shift;
      }
      return i;
    },
    sdown: function(i, shift) {
      if ((i - shift) < MIN) {
        i = MAX + i - shift - MIN;
      } else {
        i = i - shift;
      }
      return i;
    }
  };


  return {
    enc: function(plain, key) {

      key = xcrypt.hex_decode(key);
      plain = xcrypt.str2utf8(plain)

      let pl = plain.length,
      ctext = Array.from(pl);


      for (let i = 0; i < pl; i++) {
        ctext[i] = utils.sup(plain[i], key[i]);
      }

      for (let x = 0; x < ITER; x++) {
        for (let i = 0; i < pl; i++) {
          ctext[i] = utils.sup(ctext[i], key[i]);
        }
      }

      return xcrypt.hex_encode(ctext);

    },
    dec: function(ctext, key) {

      ctext = Uint8Array.from(xcrypt.hex_decode(ctext)),
      key = xcrypt.hex_decode(key)

      let plain = ctext.subarray();

      for (let i = 0; i < ctext.length; i++) {
        plain[i] = utils.sdown(ctext[i], key[i]);
      }

      for (let x = 0; x < ITER; x++) {
        for (let i = 0; i < ctext.length; i++) {
          plain[i] = utils.sdown(plain[i], key[i]);
        }
      }

      return xcrypt.utf82str(plain);

    },
    utils: utils
  }
}


const bitshift = new BitShift()

export { bitshift }
