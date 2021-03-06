import Parser from './parser';
import { createSheet, createRules, updateRules, updateClassRules } from './style';
import { MOD_TYPE } from './util';
import { $RxElement } from './components';

class Native {
  constructor (router) {
    window.Native = this;
    this.router = router;
    this.bonds = {};
    this.bindings = {};
    this.components = {};
    this.createEventQueue = [];
    this.sheet = createSheet([]);
    return this;
  }

  writeGlobals (theme) {
    const styles = [];
    const globals = theme.globals || theme.Globals;
    if (globals) {
      for(const key in globals) {
        styles.push(key +' { ' + Parser.parseNativeStyle(globals[key]) + ' } ');
      }
      return createRules(this, styles);
    }
  }

  // data: { oldObj, newObj, oldVal, newVal, key, index, count }
  // type: MOD_TYPE
  $notify (data, type) {
    const $ = (id) => document.querySelector('.'+id);
    // console.log(data, type);
    let newNode, node, styles;
    if (type == MOD_TYPE.insert) {
      if(data.key != 'animations') {
        // parsed = Parser.parse(data.newVal[data.index]);
        styles = [];
        newNode = this.createElement(data.newVal[data.index], true);
      }
    } else if (type == MOD_TYPE.update || type == MOD_TYPE.replace) {
      // parsed = Parser.parse(data.newObj);
      styles = [];
      // newNode = this.createElement(data.newObj, false);
    }

    if (type == MOD_TYPE.insert) {
      node = data.oldObj.$node;
      if(data.key == 'animations') {
        // Todo: animation would still be tricky, if there's no way
        // to remove applied css styles
        if(data.newObj.animations) {
          for(let i = 0; i < data.newObj.animations.length; i++) {
            const anim = data.newObj.animations[i];
            this.patchCSS(node, `{ transition: all
              ${(anim.options.duration) ? anim.options.duration / 1000 : '0.35'}s
              ${(anim.options.function) ? anim.options.function : 'ease-in-out' }; }`);
            for(const prop in anim.styles) {
              data.oldObj['$'+prop] = anim.styles[prop];
            }
            const css = Parser.parseNativeStyle(anim.styles, []);
            this.patchCSS(node, '{ '+css+' }');
            setTimeout(() => {
              this.patchCSS(node, '{ transition: unset; }');
            }, anim.options.duration);
          }
        }
      }else if(node) {
        const object = data.newVal[data.index];
        for(let i = 0; i < object.cssRules.length; i++) {
          try {
            this.sheet.insertRule(object.cssRules[i]);
          } catch(err) { console.error ('Could\'nt insert rule '+err); }
        }
        if(data.index == 0) {
          node.insertBefore(newNode, node.childNodes[0]);
        }else {
          node.appendChild(newNode);
        }
      }
    } else if (type == MOD_TYPE.update) {
      // if (!Util.props.hasOwnProperty(data.key)) {
        // if(!data.newObj.cssRules) {
          const styles = [];
          // if(data.newObj instanceof $RxElement) {
            Parser.parseProperties(data.newObj, styles);
          // }
          data.newObj.cssRules = styles;
          // console.log(data.newObj, styles);
        // }

        this.patchAttrs(data.oldObj.$node, data.newObj.$node);
        this.patchProps(data.oldObj, data.newObj);
        // this.patchCSSRules(data.oldObj, data.newObj);
        updateRules(data.oldObj, updateClassRules(data.oldObj, styles));
        // if(node) node.parentNode.replaceChild(newNode, node);
      // }

    } else if(type == MOD_TYPE.replace) {

      const node = data.oldObj.$node;
      this.createElement(data.newObj, false);
      const newNode = data.newObj.$node;
      if(node) node.parentNode.replaceChild(newNode, node);

    } else if (type == MOD_TYPE.delete) {
      // check if its a component and delete the native instance
      if(data.oldObj.$children[data.index].$level === 0) {
        const c = data.oldObj.$children[data.index];
        // delete shadow
        delete this.components[c.name][c.nid];
      }

      for(let i = 0; i < data.count; i++) {
        const rNode = data.oldObj.$children[data.index + i].$node;
        if(rNode && rNode.parentNode) {
          rNode.parentNode.removeChild(rNode);
        }
      }
    } else if (type == MOD_TYPE.sort) {
      node = $(data.oldObj.className);
      for(let i = 0; i < data.newVal.length; i++) {
        for(let j = 0; j < node.childNodes.length; j++) {
          if(data.newVal[i].className == node.childNodes[j].className) {
            node.appendChild(node.childNodes[j]);
          }
        }
      }
    } else if(type == MOD_TYPE.reverse) {
      node = $(data.oldObj.className);
      for(let i = 0; i < node.childNodes.length; i++) {
        node.appendChild(node.childNodes[node.childNodes.length - i - 1]);
      }
    }

    // if (styles) {
    //   if (this.sheet != undefined) {
    //     updateRules(this.sheet, styles);
    //   }
    // }
  }

  $toggleActive(node) {
    if(node.className.match('active')) {
      node.className.replace(' active', '');
    }else {
      node.className = node.className + ' active';
    }
    return node.className;
  }

  $updateObjectCSS(obj, css) {
    const selector = obj.tagName + '.' + obj.className.split(' ')[0];
    let found = false;
    for(let i = 0; i < this.sheet.cssRules.length; i++) {
      const selectorText = this.sheet.cssRules[i].selectorText;
      if(selectorText == selector) {
        // const oldRule = this.sheet.cssRules[i].cssText;
        const rule = this.sheet.cssRules[i].cssText;
        const newRule = rule.replace('{', '{ '+css);
        found = true;
        this.sheet.deleteRule(i);
        this.sheet.insertRule(newRule, this.sheet.cssRules.length);
      }
    }
    if(!found) {
      const newRule = selector + ' { ' + css + ' }';
      this.sheet.insertRule(newRule, this.sheet.cssRules.length);
    }
  }

  patchAttrs(oldEl, newEl) {
    const patches = [];
    if(oldEl != undefined && oldEl != null) {
      for(let i = 0; i < newEl.attributes.length; i++) {
        let set = false;
        for(let j = 0; j < oldEl.attributes.length; j++) {
          if(oldEl.attributes[j].name == newEl.attributes[i].name){
            if(oldEl.attributes[j].value != newEl.attributes[i].value) {
              if(newEl.attributes[i].name != 'class') {
                // oldEl.removeAttribute(newEl.attributes[j].name);
                oldEl.attributes[j].value = newEl.attributes[i].value;
                oldEl.setAttribute(newEl.attributes[i].name, newEl.attributes[i].value);
              }
            }
            set = true;
            patches.push({ name: newEl.attributes[i].name, value: newEl.attributes[i].value});
          }
        }
        if(!set) {
          if(newEl.attributes[i].name != 'class') {
            oldEl.setAttribute(newEl.attributes[i].name, newEl.attributes[i].value);
          }
          patches.push({ name: newEl.attributes[i].name, value: newEl.attributes[i].value});
        }
      }
      for(let i = 0; i < oldEl.attributes.length; i++) {
        let found = false;
        for(let j = 0; j < patches.length; j++) {
          if(patches[j].name == 'class') {
            found = true;
          }
          if(patches[j].name == oldEl.attributes[i].name &&
            patches[j].value == oldEl.attributes[i].value){
            found = true;
          }
        }
        if(!found){
          oldEl.removeAttribute(oldEl.attributes[i].name);
        }
      }
    }
  }

  patchCSS(oldEl, rules) {
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
    const selector = oldEl.tagName.toLowerCase() + '.' + oldEl.className.split(' ')[0];
    for(let m = 0; m < rules.length; m++) {
      const css = rules[m];
      for(let i = 0; i < this.sheet.cssRules.length; i++) {
        if(this.sheet.cssRules[i].selectorText == selector) {
          const oldX = extract(this.sheet.cssRules[i].cssText);
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
          const newRule = this.sheet.cssRules[i].selectorText + ' { ' + oldX.join('; ')+';' + ' } ';
          try{
            this.sheet.insertRule(newRule, i);
            this.sheet.deleteRule(i+1);
          }catch(e) { throw Error('Rule not applied '+newRule + '-> '+ e); }
        }
      }
    }
  }

  patchProps(object, newObject) {
    const props = Object.getOwnPropertyNames(newObject);
    const oldProps = Object.getOwnPropertyNames(object);
    for(let i = 0; i < props.length; i++) {
      const p = props[i];
      if(p != '$children' && p != 'node' && p != 'className'
        && p != 'root' && p != '$level' && p != 'cssRules' && p != '__proto__' && p != '$model') {
          object[p] = newObject[p];
      }else if(p == '$model') { // update only the key
        object[p].key = newObject[p].key;
        object[p].type = newObject[p].type;
      }
    }
    for(let k = 0; k < oldProps.length; k++) {
      if(props.indexOf(oldProps[k]) < 0) {
        object[oldProps[k]] = undefined;
      }
    }
  }

  patchCSSRules(object, newObject ) {
    updateRules(newObject, newObject.cssRules);
  }

  updateState(name, nid) {
    this.served = false;
    this.serving = name + '-' + nid;
    this.components[name][nid].served = false;
    // parse new state
    this.components[name].state = this.components[name][nid].state;
    // spawn a patch instance
    const oldServing = this.serving;
    const instanceNID = Math.random().toString(36).substr(2, 9);
    this.serving = name + '-' + instanceNID;
    const newInstance = new this.components[name].structure(this.components[name][nid].args);
    // get running instance
    // fetch old instance
    const oldInstance = this.components[name][nid].instance;
    if(this.bindings[instanceNID]) {
      for(let i = 0; i < this.bindings[instanceNID].length; i++) {
        const event = this.bindings[instanceNID][i];
        const o = {};
        o[event.name] = event.event.bind(oldInstance);
        event.object.$events.push(o);
        this.bindings[instanceNID].splice(i, 1);
        i--;
      }
      if(this.bindings[instanceNID].length < 1) {
        delete this.bindings[instanceNID];
      }
    }

    this.serving = oldServing;
    this.createElement(newInstance, true); // createElement(parsed.tree);
    // loop through, and throw diffs
    this.patchAttrs(oldInstance.$node, newInstance.$node);
    this.loop(oldInstance.$children, newInstance.$children, oldInstance, newInstance, 0);
    // update rootNode
    // update the instance
    // this.components[name].instance = newInstance;
    // update the css rules
    // updateRules(this.sheet, newInstance.cssRules);
    //-------- why?
    // if(oldInstance.onCreate) {
    //   oldInstance.onCreate();
    // }
    // For the window update
    // document.dispatchEvent(new Event('DOMContentLoaded'));
    // window.dispatchEvent(new Event('load'));
    //
    oldInstance.emit('update', this.components[name][nid].state);
    if(oldInstance.onUpdate) {
      oldInstance.onUpdate(this.components[name][nid].state);
    }
    this.served = true;
    this.serving = undefined;
    this.components[name][nid].served = true;
    // delete the spawn
    delete this.components[name][newInstance.nid];
  }

  createElement(object, updateState) {
    let rules = [];
    const create = (parent, item) => {
      const c = document.createElement(item.tagName);
      let rule = [];
      const parsedProperties = Parser.parseProperties(item, rule);
      if(item.$animation) {
        rule = rule.concat(Parser.parseAnimation(item.$animation));
      }
      if(item.$responsiveness) {
        rule = rule.concat(Parser.parseResponsive(item));
      }
      for(const prop in parsedProperties) {
        if(prop == '$events') {
          for(let i = 0; i < parsedProperties[prop].length; i++) {
            const e = parsedProperties[prop][i];
            c.addEventListener(e.name, e.event, { capture: true });
          }
        }else {
          c.setAttribute(prop, parsedProperties[prop]);
        }
      }
      item.$node = c;
      item.cssRules = rule;
      // rules = rules.concat(rule);
      createRules(item, rule);
      if(parent) parent.appendChild(c);
      if(item.$level === 0 && parent != undefined) {
        const oldServing = this.serving;
        // get a sub component load instance
        const component = item;
        this.components[component.name]
          = this.components[component.name] || { structure: component.constructor };
        const newInstance = item;
        const nid = newInstance.nid;
        // this.serving = component.name + '-' + nid;
        this.components[component.name][nid].route = this.router.current;
        this.components[component.name][nid].instance = newInstance;

        if(this.bindings[nid]) {
          for(let i = 0; i < this.bindings[nid].length; i++) {
            const event = this.bindings[nid][i];
            const o = {};
            o[event.name] = event.event.bind(newInstance);
            event.object.$events.push(o);
            c.addEventListener(event.name, event.event, { capture: true });
            this.bindings[nid].splice(i, 1);
            i--;
          }
          if(this.bindings[nid].length < 1) {
            delete this.bindings[nid];
          }
        }

        queueMicrotask(() => {
          // updateRules(this.sheet, newInstance.cssRules);

          if(this.components[component.name][nid].rootNode == undefined) {
            this.components[component.name][nid].rootNode = item.$node;
          }
        })

        queueMicrotask(() => {
          if(!updateState) {
            newInstance.emit('create', true);
            if(newInstance.onCreate) {
              this.createEventQueue.push(newInstance.onCreate.bind(newInstance));
            }
          }
        })
        this.serving = oldServing;
        this.components[component.name][nid].served = true;
      }
      for(let i = 0; i < item.$children.length; i++) {
        if(typeof item.$children[i] === 'string') {
          c.appendChild(document.createTextNode(item.$children[i]));
        }else {
          create(c, item.$children[i]);
        }
      }
      return c;
    };
    const result = create(undefined, object);
    object.cssRules = rules;
    return result;
  }

  load(parentSelector, route, sub) {
    const parent = document.querySelector(parentSelector);
    const component = route.component;
    this.served = false;
    if(!component) {
      throw new Error('Can\'t find component '+route.name);
    }
    this.components[component.name] = this.components[component.name] || { structure: component };
    const newInstance = new route.component();
    const nid = newInstance.nid;
    if(sub) this.components[component.name][nid].sub = sub;
    this.components[component.name][nid].route = this.router.current;
    this.components[component.name][nid].instance = newInstance;

    if(this.bindings[nid]) {
      for(let i = 0; i < this.bindings[nid].length; i++) {
        const event = this.bindings[nid][i];
        const o = {};
        o[event.name] = event.event.bind(newInstance);
        event.object.$events.push(o);
        this.bindings[nid].splice(i, 1);
        i--;
      }
      if(this.bindings[nid].length < 1) {
        delete this.bindings[nid];
      }
    }
    // const parsed = Parser.parse(this.components[route.name].instance);
    const rootNode = this.createElement(newInstance);// createElement(parsed.tree);
    // updateRules(this.sheet, newInstance.cssRules);
    if(this.components[component.name][nid].rootNode == undefined) {
      this.components[component.name][nid].rootNode = rootNode;
    }
    for(let c = 0; c < parent.childNodes.length; c++) {
      if(parent.childNodes[c].nodeType !== parent.TEXT_NODE) {
    //     const existingInstance = this.components[parent.childNodes[c].className];
    //     if(existingInstance) {
    //       if(existingInstance.onDestroy) {
    //         existingInstance.onDestroy();
    //       }
    //       if(parent.childNodes[c].className != route.name) {
    //         delete this.components[parent.childNodes[c].className];
    //       }
    //       existingInstance.served = false;
    //     }
        parent.removeChild(parent.childNodes[c]);
      }
    }
    if(parent.childNodes.length > 2) {
      console.warn('Loading a component on a non empty container!');
    }
    queueMicrotask(() => parent.appendChild(rootNode));
    // setup tree
    // this.components[route.name].tree = parsed.tree;
    // notify component
    queueMicrotask(() => {
      newInstance.emit('create', true);
      if(newInstance.onCreate) {
        newInstance.onCreate();
      }
      this.createEventQueue.forEach(i => Function.prototype.call.apply(i));
      this.createEventQueue = [];
    });
    this.serving = undefined;
    this.components[component.name][nid].served = true;
    this.served = true;

    if(route.subs && route.subs.length > 0) {
      this.router.loadSubs(route.subs);
    }
  }

  loop(arr1, arr2, p1, p2, index) {
    const a = arr1[index], b = arr2[index];
    // console.log(arr1, arr2, p1, p2);
    if(a == undefined && b == undefined) return;
    if(type(a) == 'String' || type(b) == 'String') {
      if(arr2.indexOf(a) < 0) {
        // setText(p1, getText(p2));
        p1.$children[index] = b;
        if(p1.$node.childNodes[index].nodeType === Element.TEXT_NODE) {
          p1.$node.childNodes[index].textContent = b;
        }
        this.loop(arr1, arr2, p1, p2, index);
      }
    }else if(a != undefined) {
      if(b != undefined) {
        if(a.tagName == b.tagName) {
          const similarity = similar(props(a), props(b));
          if(similarity >= 0.5) {
            if(similarity < 1) {
              if(a.$level === 0 && b.$level === 0) {
                // console.log('got components', a);
                this.served = false;
                const name = a.name;
                const nid = a.nid;
                const oldInstance = this.components[name][nid].instance;
                this.components[name][nid].served = false;
                this.components[name].state = this.components[name][nid].state;
                this.patchAttrs(oldInstance.$node, b.$node);
                this.loop(oldInstance.$children, b.$children, oldInstance, b, 0);

                oldInstance.emit('update', this.components[name][nid].state);
                if(oldInstance.onUpdate) {
                  oldInstance.onUpdate(this.components[name][nid].state);
                }
                this.served = true;
                this.components[name][nid].served = true;
                this.components[name][nid].args = this.components[b.name][b.nid].args;
                delete this.components[b.name][b.nid];
              } else {
                // must patch strongly
                // console.log("> must patch", props(a), props(b))
                this.patchAttrs(a.$node, b.$node);
                // this.patchCSS(a.$node, b.cssRules);
                this.patchProps(a, b);
                this.patchCSSRules(a, b);
                b.$node = a.$node;

                // todo: i think you should the Native instance of
                // b if, its a component
                if(b.$level === 0) {
                  delete this.components[b.name][b.nid];
                }
              }
            }
          } else {
            if(visible(arr2, a)) {
              // insert b
              // console.log("> insert", props(a), props(b))
              arr1.splice(index, 0, b);
              this.$notify({ oldObj: p1, newVal: arr1, index: index }, MOD_TYPE.insert);
              index++;
              p1.$children = arr1;
              this.loop(arr1, arr2, p1, p2, index);
            } else {
              // delete a;
              // console.log("> delete", props(a), props(b))
              arr1 = arr1.filter((_, i) => i != index);
              this.$notify({ oldObj: p1, index: index, count: 1 }, MOD_TYPE.delete);
              p1.$children = arr1;
              this.loop(arr1, arr2, p1, p2, index);
            }
          }
          if(a.$children && b.$children) {
            this.loop(a.$children, b.$children, a, b, 0);
          }
          index++;
          this.loop(arr1, arr2, p1, p2, index);
        } else {
          if(visible(arr2, a)) {
            // insert b
            // console.log("> insert", props(a), props(b))
            arr1.splice(index, 0, b);
            this.$notify({ oldObj: p1, newVal: arr1, index: index }, MOD_TYPE.insert);
            index++;
            p1.$children = arr1;
            this.loop(arr1, arr2, p1, p2, index);
          } else {
            // delete a;
            // console.log("> delete", props(a), props(b))
            arr1 = arr1.filter((_, i) => i != index);
            this.$notify({ oldObj: p1, index: index, count: 1 }, MOD_TYPE.delete);
            p1.$children = arr1;
            this.loop(arr1, arr2, p1, p2, index);
          }
        }
      } else {
        // delete a;
        // console.log("> delete", props(a))
        arr1 = arr1.filter((_, i) => i != index);
        this.$notify({ oldObj: p1, index: index, count: 1 }, MOD_TYPE.delete);
        p1.$children = arr1;
        this.loop(arr1, arr2, p1, p2, index);
      }
    } else {
      // insert b;
      // console.log("> insert", props(b))
      arr1.splice(index, 0, b);
      this.$notify({ oldObj: p1, newVal: arr1, index: index }, MOD_TYPE.insert);
      index++;
      p1.$children = arr1;
      this.loop(arr1, arr2, p1, p2, index);
    }
  }
}

const type = o => Object.prototype.toString.call(o).substr(8).replace(']','');

const same = function(a, b) {
  if(type(a) == 'Object') {
    if(type(b) != 'Object') return false;
    let count = 0;
    const objA = (Object.keys(a).length > Object.keys(b).length) ? a : b;
    const objB = (Object.keys(a).length > Object.keys(b).length) ? b : a;
    for(const prop in props(objA)) {
      if(!objB.hasOwnProperty(prop)) return false;
      const r = same(objA[prop], objB[prop]);
      if(r == false) return false;
      else count++;
    }
    if(count == Object.keys(objA).length) return true;
  }else if(type(a) == 'Array') {
    if(type(b) != 'Array') return false;
    let count = 0;
    for(let i = 0; i < Math.max(a.length, b.length); i++) {
      const r = same(a[i], b[i]);
      if(r == false) return false;
      else count++;
    }
    if(count == Math.max(a.length, b.length)) return true;
  } else {
    return a == b;
  }
};

const similar = function(a, b) {
  const objA = (Object.keys(a).length > Object.keys(b).length) ? a : b;
  const objB = (Object.keys(a).length > Object.keys(b).length) ? b : a;
  const quest = Object.keys(objA).length * 2;
  let test = 0;
  for(const prop in objA) {
    if(objB.hasOwnProperty(prop)) {
      test += 1;
      if(same(objB[prop], objA[prop])) {
        test += 1;
      }
    }
  }
  return test / quest;
};

const props = (c) => {
  const all = {};
  const ps = Object.getOwnPropertyNames(c);
  for(let i = 0; i < ps.length; i++) {
    const p = ps[i];
    if(p != '$children' && p != 'node' && p != 'className' && p != '__proto__'
      && p != 'root' && p != '$level' && p != 'cssRules' && p != '$events') {
      if(type(c[p] !== 'Object') && c[p] !== undefined) all[p] = c[p];
    }
  }
  if(c.__proxy__ && c.$children && c.$children.length > 0){
    if(getText(c) != '') all['text'] = getText(c);
  }
  return all;
};

const getText = (c) => {
  if(Object.prototype.toString.call(c.$children[0]) === '[object String]') {
    return c.$children[0];
  }
  return undefined;
};

const visible = (arr, child) => {
  for(let i = 0; i < arr.length; i++) {
    if(arr[i].tagName === child.tagName
      && similar(props(arr[i]), props(child)) >= 0.5) {
      return true;
    }
  }
  return false;
};

export default Native;
