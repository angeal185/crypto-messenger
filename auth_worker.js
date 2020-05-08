const cl = console.log,
ce = console.error;

const utils = {
  get: function(obj, cb){
    fetch(obj.url, {
      method: 'GET',
      headers: {
        'Accept-Encoding': 'gzip',
        'Sec-Fetch-Dest': 'object',
        'Sec-Fetch-mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
      }
    })
    .then(function(res){
      if (res.status >= 200 && res.status < 300) {
        return res[obj.encode]();
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    })
    .then(function(data) {
      cb(false, data)
    })
    .catch(function(err){
      cb(false)
    })
  },
  U82HEX: function(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  },
  sha: function(buff,cb){
    crypto.subtle.digest({name: "SHA-512"},new Uint8Array(buff))
    .then(function(hash){
      hash = utils.U82HEX(new Uint8Array(hash));
      cb(false, hash);
    })
    .catch(function(err){
      cb(true);
    });
  },
  get_hash: function(url, cb){
    utils.get({url: url, encode: 'arrayBuffer'}, function(err,res){
      if(err){return cb(null)}
      utils.sha(res, function(err,hash){
        if(err){return cb(null)}
        cb(false,hash)
      })
    })
  },
  build: function(){
    utils.get({url: './app/data/hash.json', encode: 'json'}, function(err,res){
      if(err){return cl(err)}
      let len = res.length;
      for (let i = 0; i < len; i++) {

        utils.get_hash(res[i].src, function(err,data){
          if(err){return cb(null)}
          res[i].hash = data;
          if(i === len -1){
            cl(JSON.stringify(res))
          }
        })
      }
    })
  },
  verify: function(cb){
    //let url = 'https://glcdn.rawgit.org/angeal185/auth/master/crypto-messenger/hash.json'
    let url = './app/data/hash.json'
    utils.get({url: url, encode: 'json'}, function(err,res){
      if(err){return cb(undefined)}
      //return utils.build();
      let len = res.length,
      arr = [];
      for (let i = 0; i < len; i++) {
        utils.get_hash(res[i].src, function(err,data){
          if(err){
            arr.push(res[i].src)
          } else if(res[i].hash !== data){
            arr.push(res[i].src)
          }

          if(i === len -1){
            return cb(arr)
          }
        })

      }
    })
  }
}

onmessage = function(evt) {

  if(evt.isTrusted && evt.userActivation === null){
    let data = evt.data;
    if(data.type === 'verify'){
      utils.verify(function(res){
        if(!res || typeof res !== 'object'){
          return postMessage({
            type: 'verify',
            status: false,
            msg: 'unable to verify the file integrity of site data'
          });
        }
        if(res.length > 0){
          return postMessage({
            type: 'verify',
            status: false,
            msg: 'Site file integrity test failed'
          });
        }
        return postMessage({
          type: 'verify',
          status: true,
          msg: 'Site file integrity pass'
        });
      })
    }
  } else {
    postMessage({
      type: 'error',
      msg: 'untrusted worker event blocked'
    });
  }

};
