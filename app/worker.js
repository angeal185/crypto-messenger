const utils = {
  getJSON: function(url, cb){
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip',
        'Sec-Fetch-Dest': 'object',
        'Sec-Fetch-mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Cache-Control': 'max-age=180'
      }
    })
    .then(function(res){
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    })
    .then(function(data) {
      if(data.status === 'ok'){

      }
      cb(false, data)
    })
    .catch(function(err){
      cb(err)
    })
  },
  add_styles: function(styl){
    utils.getJSON('./data/styles.json', function(err,res){
      if(err){return console.log(err)}
      let sheet = new CSSStyleSheet();
      sheet.replaceSync(res.main);
      let theme = ls.get('theme');
      if(theme){
        sheet.deleteRule(0)
        sheet.insertRule(':root{--gr:'+ theme +'!important;}',0)
      }
      document.adoptedStyleSheets = [sheet];
      return;
    })
  },
  ud_theme: function(r){
    document.adoptedStyleSheets[0].deleteRule(0)
    document.adoptedStyleSheets[0].insertRule(':root{--gr:'+ r +'!important;}',0)
  },
  add_font: function(obj){
    let buff = new TextEncoder().encode(btoa(obj.data)).buffer;
    new FontFace(obj.name, buff, {
      style: obj.style,
      weight: obj.weight
    }).load().then(function(res) {
      document.fonts.add(res);
    }).catch(function(err) {
      console.log(obj.path +' failed to load')
    });
  }
}


onmessage = function(evt) {

  utils.getJSON('./data/fonts.json', function(err,res){
    if(err){return console.log(err)}
    for (let i = 0; i < res.length; i++) {
      utils.add_font(res[i]);
    }
    utils.add_styles('main');

    console.log(false)
  })

};
