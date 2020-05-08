function cnsl(txt, color){
  try {
    if(typeof txt === 'string' && typeof color === 'string'){
      return console.log('%c'+ txt, 'color: '+ color +';');
    } else if(typeof txt === 'object' && typeof color === 'object' && txt.length === color.length){
      let str = '"%c';

      for (let i = 0; i < txt.length; i++) {
        if(typeof txt[i] === 'string'){
          txt[i] = txt[i].replace(/[!$^&*()_+|~=`{}\/;<>?,@#]/g,'');
        } else if(typeof txt[i] !== 'number'){
          throw '[cnsl]: input type is not of string or number';
        }
      }

      str += txt.join('%c') + '"';
      for (let i = 0; i < color.length; i++) {
        if(typeof color[i] !== 'string'){
          throw '[cnsl]: input type error';
        } else {
          str += ',"color: '+ encodeURI(color[i]) +';"';
        }
      }
      return Function('console.log(' + str + ')')();
    } else {
      throw '[cnsl]: invalid input data';
    }
  } catch (err) {
    console.error(err)
  }
}

export { cnsl }
