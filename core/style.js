export const createSheet = function (data) {
  let style;
  const allStyles = document.head.getElementsByTagName('style');
  for(let n = 0; n < allStyles.length; n++) {
    if(allStyles[n].childNodes[0].nodeType == allStyles[n].TEXT_NODE
      && allStyles[n].childNodes.length == 1) {
      style = allStyles[n];
    }
  }
  if(!style) {
    style = document.createElement('style');
    style.appendChild(document.createTextNode(''));
    document.head.appendChild(style);
  }
  for (let i = 0; i < data.length; i++) {
    if (data[i].trim().length > 0 && !data[i].trim().match('{ }')) {
      const rule = data[i].trim();
      try {
        style.sheet.insertRule(rule, style.sheet.cssRules.length);
      } catch (e) {
        throw Error('Rule not applied: ' + rule + ' ', e.message);
      }
    }
  }
  return style.sheet;
};

export const updateRules = function (sheet, rules) {
  // This should merge same selectors
  const added = [];
  const extract = (rule) => {
    return rule.trim().substring(rule.indexOf('{') + 1, rule.indexOf('}') - 2)
      .trim().split(';').map(s => s.trim());
  };
  const pair = (v) => {
    const value = v.split(':').map(s => s.trim());
    return { name: value[0], value: value[1]};
  };
  const depair = (n, v) => {
    return `${n}: ${v}`;
  };
  rules.map(css => {
    const selector = css.slice(0, css.indexOf('{')).trim();
    const maxLength = sheet.cssRules.length;
    for(let i = 0; i < maxLength; i++) {
      if(sheet.cssRules[i].selectorText == selector) {
        const oldX = extract(sheet.cssRules[i].cssText);
        const newX = extract(css);
        for(let j = 0; j < newX.length; j++) {
          let set = false;
          for(let k = 0; k < oldX.length; k++) {
            if(pair(oldX[k]).name == pair(newX[j]).name){
              if(pair(oldX[k]).value != pair(newX[j]).value) {
                oldX[k] = depair(pair(oldX[k]).name, pair(newX[j]).value);
              }
              set = true;
            }
          }
          if(!set) {
            oldX.push(depair(pair(newX[j]).name, pair(newX[j]).value));
          }
        }
        const newRule = sheet.cssRules[i].selectorText + ' { ' + oldX.join('; ')+';' + ' } ';
        try{
          sheet.insertRule(newRule, i);
          sheet.deleteRule(i+1);
        }catch(e) { throw Error('Rule not applied '+newRule); }
        added.push(css);
      }
    }
  });
  for(let i = 0; i < rules.length; i++) {
    if(added.indexOf(rules[i]) < 0) {
      try {
        sheet.insertRule(rules[i], sheet.cssRules.length);
      }catch(e) {
        throw Error('Rule not applied: ' + rules[i] + ' ', e.message);
      }
    }
  }
};

