import { PropUtil as Util } from '../utils/prop-util';
import { type } from './util';

const Parser = {
  parse: function (component) {
    const styles = [];
    const tree = Parser.parseComponent(component, styles);
    return { tree: tree, styles: styles };
  },

  // parseComponent: function (component, styles) {
  //   const props = Parser.parseProperties(component, styles);
  //   return h(component.tagName, props,
  //     [ component.$children ? component.$children.map(c => {
  //       return Parser.parseComponent(c, styles);
  //     }).concat([component.$text]) : '']);
  // },

  parseFncStyles: function (fnc, comp, styles) {
    if (fnc.match(/(&|>)/)) {
      fnc = fnc.trim();
      const start = fnc.indexOf('&');
      const end = start + fnc.substr(start).indexOf('}') + 1;
      const rule = fnc.substr(start, end);
      const cssRule = rule.replace('&', comp.tagName + '.'
        + comp.className.replace(' ', '')).trim();
      if(cssRule.length > 20) {
        styles.push(cssRule);
      }
      const rem = fnc.replace(rule, '');
      if (rem.trim().length > 0) {
        Parser.parseFncStyles(rem, comp, styles);
      }
    } else if(fnc.match(/</)) {
      const start = fnc.indexOf('<');
      const end = start + fnc.substr(start).indexOf('}') + 1;
      const rule = fnc.substr(start, end);
      // Todo: Add exception to adding rules that involves the parent
      // during animation, or any term that will include external components

      // if(comp.root) {
      //   const cssRule = rule.replace('<', comp.root.tagName + '.' + comp.root.className).trim();
      //   if(cssRule.length > 20){
      //     styles.push(cssRule);
      //   }
      // }
      const rem = fnc.replace(rule, '');
      if (rem.trim().length > 0) {
        Parser.parseFncStyles(rem, comp, styles);
      }
    }else {
      return fnc;
    }
  },

  parseProperties: function (component, styles) {
    const properties = {};
    let componentStyles = component.tagName+'.'
      + component.className.replace(' ', '.') + ' { ';
    const props = Object.getOwnPropertyNames(component);
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      if (Util.props.hasOwnProperty(prop)) {
        const f = Util.props[prop];
        if (typeof f === 'string') {
          if (f.match('attr.')) {
            properties[f.split('.')[1]] = component[prop];
          } else {
            componentStyles += f.split('.')[1] + ': '
              + Parser.parseStyleValue(component[prop]) + '; ';
          }
        } else if (typeof f === 'function') {
          if(component[prop]) {
            const fnc = f(component[prop], component);
            if(fnc != undefined) {
              const parsed = Parser.parseFncStyles(fnc, component, styles);
              if (parsed != undefined) componentStyles += parsed;
            }
          }
        }
      } else {
        if (prop === '$events' && component[prop] !== undefined) {
          properties[prop] = component[prop];
        } else if (Util.excludes.indexOf(prop) < 0 && component.$level != '0') {
          // console.log(component);
          // throw new Error('Invalid property ' + prop);
        }
      }
    }
    if(componentStyles.length > 20) { styles.push(componentStyles + '} '); }
    return properties;
  },

  parseNativeStyle: function (obj, styles) {
    let objStyles = '';
    for (let prop in obj) {
      prop = '$' + prop;
      if (Util.props.hasOwnProperty(prop)) {
        const f = Util.props[prop];
        if (typeof f === 'string') {
          if (f.match('css.')) {
            objStyles += f.split('.')[1] + ': '
              + Parser.parseStyleValue(obj[prop.slice(1)]) + '; ';
          }
        } else if (typeof f === 'function') {
          const fnc = f(obj[prop]);
          const parsed = Parser.parseFncStyles(fnc, obj, styles);
          if (parsed != undefined) objStyles += parsed;
        }
      } else {
        if (Util.excludes.indexOf(prop.toLowerCase()) < 0 && obj.$level != 0) {
          throw new Error('Invalid css property ' + prop);
        }
      }
    }
    return objStyles;
  },

  parseStyleValue: function (value) {
    if(value == null) {
      return 'unset';
    }else if(typeof value == 'string') {
      return value;
    }else if (typeof value == 'number') {
      return value + 'px';
    } else if (value instanceof Array) {
      return value.map(v => Parser.parseStyleValue(v)).join(' ');
    }
    return value;
  },

  parseAnimation: function(animation) {
    const rules = [];
    const parseValues = function(p, v) {
      if(p === '$delay' || p === '$duration') return v + 's';
      return v;
    }
    const parseKey = function(key) {
      if(type(key) === 'number') {
        return key+'%';
      }
      return key;
    }
    if((!animation.$keyframe && !animation.$keyframes)
      || (!animation.$keyframe && animation.$keyframes && animation.$keyframes.length < 1)) {
      console.trace();
      throw "Invalid animation definition: keyframes expected";
    }
    let animRule = '.' + animation.$name + ' { ';
    for(let prop in animation) {
      if(prop !== '$name' && Util.anims.hasOwnProperty(prop)) {
        const f = Util.anims[prop];
        const value = animation[prop];
        animRule += f + ': ' + parseValues(prop, value) + '; ';
      }
    }
    animRule += 'animation-name: '+animation.$name + '-keyframes; ';
    animRule += '}';
    rules.push(animRule);

    let keyframeRule = '@keyframes '+animation.$name + '-keyframes { ';
    if(animation.$keyframe) animation.$keyframes.push(animation.$keyframe);
    if(animation.$keyframes.length === 1) {
      throw "Minimun of two frames required!";
    }
    for(let j = 0; j < animation.$keyframes.length; j++) {
      const keyframe = animation.$keyframes[j];
      keyframeRule += parseKey(keyframe.key) + ' { ';
      keyframeRule += Parser.parseNativeStyle(keyframe.frame);
      keyframeRule += '} ';
    }
    keyframeRule += '}';
    rules.push(keyframeRule);
    return rules;
  },

  parseResponsive: function(component) {
    const rules = [], res = component.$responsiveness;
    for(let i = 0; i < res.length; i++) {
      const item = res[i], rule = item.key + ' { ';
      rule += component.tagName + '.' + component.className.replace(' ', '.') + ' { ';
      rule += Parser.parseNativeStyle(item.props);
      rule += '} } ';
      rules.push(rule);
    }
    return rules;
  }
};

export default Parser;
