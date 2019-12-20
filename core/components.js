import { ProxifyComponent, ProxifyState, Proxify } from '../core/proxify';
import { Handler, protoSet, type, Animation } from './util';
import Parser from './parser';

export class Component {

  events = {};

  constructor(args) {
    this.$level = 0;
    this.$children = [];
    this.tagName = this.constructor.name;
    this.className = this.tagName[0]+Math.random().toString(36).substr(2, 9);
    this.$nid = Math.random().toString(36).substr(2, 9);
    Native.serving = this.name + "-" + this.$nid;
    Native.components[this.name] = Native.components[this.name] || { structure: this.constructor };
    Native.components[this.name][this.$nid] = { served: false, watchlist: [] };
    Native.components[this.name][this.$nid].args
      = Native.components[this.name][this.$nid].args || args;

    // additional styling (default div styling)?
    this.$display = 'block';

    return ProxifyComponent(this, this.name, this.$nid);
  }

  addChild(...children) {
    if(children[0] instanceof Array) {
      Handler.Error(Handler.Codes.noArrayChild, this.name);
    }
    if(this.$children) {
      for(let i = 0; i < children.length; i++) {
        if(children[i].root != undefined) {
          Handler.Error(Handler.Codes.doubleParent, children[i].name);
        }
        this.$children.push(children[i]);
        children[i].root = this;
      }
      return this;
    }else {
      Handler.Error(Handler.Codes.noChildren, this.name);
    }
  }

  removeChild(child) {
    if(this.$children.indexOf(child) > -1) {
      this.$children.splice(this.$children.indexOf(child), 1);
      this.$children = this.$children.filter(c => c !== undefined);
      return this;
    }else {
      Handler.Error(Handler.Codes.noChildExist, 'RemoveChild:', child.name, this.name);
    }
    return false;
  }

  replaceChild(child, newChild) {
    if(this.$children.indexOf(child) > -1) {
      if(newChild.root != undefined) {
        Handler.Error(Handler.Codes.doubleParent, newChild.name);
      }
      this.$children.splice(this.$children.indexOf(child), 1, newChild);
      newChild.root = this;
      return this;
    } else {
      throw 'Child doesnt exist on parent';
      // child doesnt exist on parent
    }
  }

  get name() {
    return this.constructor.name;
  }

  get nid() {
    return this.$nid;
  }

  set nid(v) {
    this.$nid = v;
  }

  set state(v) {
    if(type(v) !== 'object') {
      throw new Error('Invalid state format, state must be an object');
    }
    if(!Native.components[this.name][this.$nid]){
      Handler.Error(Handler.Codes.stateOnDestroy, this.name);
    }
    v.__state__ = true;
    Native.components[this.name][this.$nid].state =
      Native.components[this.name][this.$nid].state
      || Native.components[this.name].state
      || ProxifyState(v, this.name, this.$nid);
  }

  get state() {
    if(!Native.components[this.name][this.$nid]){
      Handler.Error(Handler.Codes.getStateOnDestroy, this.name + '-' + this.$nid);
    }
    return Native.components[this.name][this.$nid].state;
  }

  get route() {
    if(!Native.components[this.name][this.$nid]) {
      Handler.Error(Handler.Codes.getStateOnDestroy, this.name);
    }
    return window.Native.components[this.name][this.$nid].route;
  }

  parent() {
    return this.root;
  }

  children() {
    return this.$children;
  }

  $init(tagName) {
    this.tagName = tagName;
    this.className = this.tagName[0]+Math.random().toString(36).substr(2, 9);
  }

  on(fns) {
    this.$events = this.$events || [];
    for(const fn in fns) {
      const event = {};
      event[fn] = fns[fn];
      Native.bindings[this.$nid]
        = Native.bindings[this.$nid] || [];
      const binding = Native.bindings[this.$nid];
      binding.push({ event: fns[fn], object: this, name: fn });
      // this.events.push(event);
    }
    return this;
  }

  emit(event, payload) {
    if(this.events.hasOwnProperty(event)) {
      for(let i = 0; i < this.events[event].length; i++) {
        this.events[event][i](payload);
      }
    }else {
      return false;
    }
    return this;
  }

  addListener(event, listener) {
    if(this.events.hasOwnProperty(event)) {
      this.events[event].push(listener);
    }else {
      this.events[event] = [listener];
    }
    return this;
  }

  removeListener(event, listener) {
    if(this.events.hasOwnProperty(event)) {
      if(this.events[event].indexOf(listener)) {
        this.events[event] = this.events[event].splice(this.events[event].indexOf(listener), 1);
      }else {
        throw new Error(`Event ${event} doesn't have the ${listener} attached`);
      }
    }else {
      throw new Error(`Event ${event} doesn't exist on ${this.name} `);
    }
    return this;
  }

  listenOnce(event, listener) {
    this.on(event, function(p) {
      listener(p);
      this.remove(event, listener);
    });
    return this;
  }
}

export class $RxElement {
  constructor() {
    this.$level = 1;
    this.$children = [];
    this.tagName = 'window.$RxElement';
    this.root = undefined;
    this.events = undefined;
    this.$hostComponent = Native.serving;
    return Proxify(this);
  }

  addChild(...children) {
    if(children[0] instanceof Array) {
      Handler.Error(Handler.Codes.noArrayChild, this.name);
    }
    if(this.$children) {
      for(let i = 0; i < children.length; i++) {
        if(children[i].root != undefined) {
          Handler.Error(Handler.Codes.doubleParent, children[i].name);
        }
        this.$children.push(children[i]);
        children[i].root = this;
      }
      return this;
    }else {
      Handler.Error(Handler.Codes.noChildren, this.name);
    }
  }

  removeChild(child) {
    if(this.$children.indexOf(child) > -1) {
      this.$children.splice(this.$children.indexOf(child), 1);
      this.$children = this.$children.filter(i => i !== undefined);
      return this;
    }else {
      Handler.Error(Handler.Codes.noChildExist, 'RemoveChild:', child.name, this.name);
    }
    return false;
  }

  replaceChild(child, newChild) {
    if(this.$children.indexOf(child) > -1) {
      if(newChild.root != undefined) {
        Handler.Error(Handler.Codes.doubleParent, newChild.name);
      }
      this.$children.splice(this.$children.indexOf(child), 1, newChild);
      newChild.root = this;
      return this;
    } else {
      // child doesnt exist on parent
    }
  }

  get name() { return this.constructor.name; }

  parent() {
    return this.root;
  }

  children() {
    return this.$children;
  }

  on(fns) {
    this.$events = this.$events || [];
    for(const fn in fns) {
      const event = {};
      event[fn] = fns[fn];
      if(type(fns[fn]) !== 'function') throw `${fns[fn]} is not a function`;
      // console.log(Function.prototype.bind.apply(fns[fn], this), this);
      this.$events.push({
        event: fns[fn].bind(this),
        name: fn, object: this
      });
      // Native.bindings[Native.serving.split('-')[1]]
      //   = Native.bindings[Native.serving.split('-')[1]] || [];
      // const binding = Native.bindings[Native.serving.split('-')[1]];
      // binding.push({ event: fns[fn], object: this, name: fn });
      // this.events.push(event);
    }
    return this;
  }

  bind(object) {
    if(Native.serving) {
      const bonds = Native.components[Native.serving].bonds || [];
      if(bonds.indexOf(object) < 0) {
        for(const prop in object) {
          object[prop].source = this;
        }
        bonds.push(object);
      }
      Native.components[Native.serving].bonds = bonds;
    }
    return this;
  }

  text(string) {
    if(string != undefined) {
      if(typeof this.$children[0] == 'string') this.$children.splice(0, 1, string);
      else this.$children.unshift(string);
      return this;
    }
    if(Object.prototype.toString.call(this.$children[0]) === '[object String]') {
      return this.$children[0];
    }
    return;
  }

  $init(tagName) {
    this.tagName = tagName;
    this.className = this.tagName[0]+Math.random().toString(36).substr(2, 9);
  }
}

window.RxElement = $RxElement;

const LayoutFunctions = {
  absCenter: function(v) {
    if(v) {
      if(this.root) {
        this.root.position('relative');
        this.position('absolute').top('50%').left('50%')
          .transform('translate(-50%, -50%)');
        this.$absCenter = v;
        return this;
      }else {
        Handler.Warning(Handler.Codes.absParent);
        return;
      }
    }
    return this.$absCenter;
  },
  absCenterRight: function(v) {
    if(v) {
      if(this.root) {
        this.root.position('relative');
        this.position('absolute').top('50%').right(v)
          .transform('translateY(-50%)');
        this.$absCenterRight = v;
        return this;
      }else {
        Handler.Warning(Handler.Codes.absParent);
        return;
      }
    }
    return this.$absCenterRight;
  },
  absCenterLeft: function(v) {
    if(v) {
      if(this.root) {
        this.root.position('relative');
        this.position('absolute').top('50%').left(v)
          .transform('translateY(-50%)');
        this.$absCenterLeft = v;
        return this;
      }else {
        Handler.Warning(Handler.Codes.absParent);
        return;
      }
    }
    return this.$absCenterLeft;
  },
  absCenterTop: function(v) {
    if(v) {
      if(this.root) {
        this.root.position('relative');
        this.position('absolute').left('50%').top(v)
          .transform('translateX(-50%)');
        this.$absCenterTop = v;
        return this;
      }else {
        Handler.Warning(Handler.Codes.absParent);
        return;
      }
    }
    return this.$absCenterTop;
  },
  absCenterBottom: function(v) {
    if(v) {
      if(this.root) {
        this.root.position('relative');
        this.position('absolute').left('50%').bottom(v)
          .transform('translateX(-50%)');
        this.$absCenterBottom = v;
        return this;
      }else {
        Handler.Warning(Handler.Codes.absParent);
        return;
      }
    }
    return this.$absCenterBottom;
  },
  absPosition: function(v) {
    if(arguments.length > 0) {
      const v = arguments.length === 1 ? arguments[0] : Array.from(arguments);
      if(this.root) {
        this.root.position('relative');
        this.position('absolute').top(v[0]).right(v[1]).bottom(v[2])
          .left(v[3]);
        this.$absPosition = v;
        return this;
      }else {
        Handler.Warning(Handler.Codes.absParent);
        return;
      }
    }
    return this.$absPosition;
  },
  absTopRight: function(v) {
    if(arguments.length > 0) {
      const v = arguments.length === 1 ? arguments[0] : Array.from(arguments);
      if(this.root) {
        this.root.position('relative');
        this.position('absolute').top(v[0]).right(v[1]);
        this.$absTopRight = v;
        return this;
      }else {
        Handler.Warning(Handler.Codes.absParent);
        return;
      }
    }
    return this.$absTopRight;
  },
  absTopLeft: function() {
    if(arguments.length > 0) {
      const v = arguments.length === 1 ? arguments[0] : Array.from(arguments);
      if(this.root) {
        this.root.position('relative');
        this.position('absolute').top(v[0]).left(v[1]);
        this.$absTopLeft = v;
        return this;
      }else {
        Handler.Warning(Handler.Codes.absParent);
        return;
      }
    }
    return this.$absTopLeft;
  },
  absBottomRight: function(v) {
    if(arguments.length > 0) {
      const v = arguments.length === 1 ? arguments[0] : Array.from(arguments);
      if(this.root) {
        this.root.position('relative');
        this.position('absolute').bottom(v[0]).right(v[1]);
        this.$absBottomRight = v;
        return this;
      }else {
        Handler.Warning(Handler.Codes.absParent);
        return;
      }
    }
    return this.$absBottomRight;
  },
  absBottomLeft: function(v) {
    if(arguments.length > 0) {
      const v = arguments.length === 1 ? arguments[0] : Array.from(arguments);
      if(this.root) {
        this.root.position('relative');
        this.position('absolute').bottom(v[0]).left(v[1]);
        this.$absBottomLeft = v;
        return this;
      }else {
        Handler.Warning(Handler.Codes.absParent);
        return;
      }
    }
    return this.$absBottomLeft;
  },
  absCenterVertical: function(v) {
    if(v) {
      if(this.root) {
        this.root.position('relative');
        this.position('absolute').top('50%').transform('translateY(-50%)');
        this.$absCenterVertical = v;
        return this;
      }else {
        Handler.Warning(Handler.Codes.absParent);
        return;
      }
    }
    return this.$absCenterVertical;
  },
  absCenterHorizontal: function(v) {
    if(v) {
      if(this.root) {
        this.root.position('relative');
        this.position('absolute').left('50%').transform('translateX(-50%)');
        this.$absCenterHorizontal = v;
        return this;
      }else {
        Handler.Warning(Handler.Codes.absParent);
        return;
      }
    }
    return this.$absCenterHorizontal;
  },
  addClassName: function(name) {
    if(this.$node) {
      if(!this.$node.classList || !this.$node.classList.contains(name)) {
        this.$node.classList.add(name);
      }
    }else {
      if(!this.className.match(name)) {
        this.className = this.className + ' ' + name;
      }
    }
    return this;
  },
  animate: function(...args) {
    const animation = args[0];
    let completion;
    if(args.length === 2) {
      completion = args[1];
    }

    if(type(animation) === 'object' && !(animation instanceof Animation)) {
      const oldFrame = {}, options = animation.$ || {};
      animation.$ && delete animation.$;
      for(let prop in animation) {
        if(this.hasOwnProperty(prop)) {
          oldFrame[prop] = this[prop];
        }else {
          oldFrame[prop] = "initial";
        }
      }
      const anim = new Animation();
      anim.keyframes([
        { key: 'from', frame: oldFrame },
        { key: 'to', frame: animation }
      ]).duration(options.duration || 0.35)
        .timingFunction(options.timingFunction || Animation.$.TimingFunction.EaseInOut)
        .fillMode(options.fillMode || Animation.$.FillMode.Forwards);
      this.$animation = anim;
    } else {
      if(!animation.$fillMode) animation.$fillMode = Animation.$.FillMode.Forwards;
      this.$animation = animation;
    }

    const styles = Parser.parseAnimation(this.$animation);
    for(let i = 0; i < styles.length; i++) {
      try {
        Native.sheet.insertRule(styles[i], Native.sheet.cssRules.length - 1);
      }catch(e){ console.log(e); }
    }
    if(this.node) {
      if(this.$animation) {
        this.node.className = this.className + ' ' + this.$animation.$name;
        // this.className = this.className + ' ' + this.$animation.$name;
      }
    }else {
      this.className = this.className + ' ' + this.$animation.$name;
    }
    setTimeout(() => {
      completion && Function.prototype.call.apply(completion);
      const keyframe = this.$animation.$keyframes[this.$animation.$keyframes.length - 1];
      for(const prop in keyframe.frame) {
        this[prop] = keyframe.frame[prop];
      }
      // this.node.classList.remove(this.$animation.$name);
      // this.className = Array.from(this.node.classList).join(' ');
    }, (this.$animation.$duration||1 + this.$animation.$delay||1) * 1000);
    return this;
  },
  animation: function(animation) {
    if(animation) {
      if(type(animation) === 'object' && !(animation instanceof Animation)) {
        const oldFrame = {}, options = animation.$ || {};
        animation.$ && delete animation.$;
        for(let prop in animation) {
          if(this.hasOwnProperty(prop)) {
            oldFrame[prop] = this[prop];
          }else {
            oldFrame[prop] = "initial";
          }
        }
        const anim = new Animation();
        anim.keyframes([
          { key: 'from', frame: oldFrame },
          { key: 'to', frame: animation }
        ]).duration(options.duration || 0.35)
          .timingFunction(options.timingFunction || Animation.$.TimingFunction.EaseInOut)
          .fillMode(options.fillMode || Animation.$.FillMode.Forwards);
        this.$animation = anim;
      } else {
        if(!animation.$fillMode) animation.$fillMode = Animation.$.FillMode.Forwards;
        this.$animation = animation;
      }
      return this;
    }
    return this.$animation;
  },
  aspectRatio: function() {
    if(arguments.length > 0) {
      const v = arguments.length === 1 ? arguments[0] : Array.from(arguments);
      this.position('relative');
      this.pseudoBefore({
        display: 'block', content: '', width: '100%',
        paddingTop: `(${v[1]} / ${v[0]}) * 100%`
      });
      this.pseudoFirstChild({
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0
      });
      this.$aspectRatio = v;
      return this;
    }
    return this.$aspectRatio;
  },
  backgroundLinearGradient: function() {
    if(arguments.length > 0) {
      const v = arguments.length === 1 ? arguments[0] : Array.from(arguments);
      this.background(`linear-gradient(${v[0]}, ${v[1]}, ${v[2]})`);
      this.$backgroundGradient = v;
      return this;
    }
    return this.$backgroundGradient;
  },
  childVerticalSpacing: function(margin) {
    if(margin) {
      this.globalStyle({ margin: [ margin / 2, 0, margin / 2, 0] })
        .pseudoFirstChild({ margin: [ 0, 0, margin / 2, 0 ] })
        .pseudoLastChild({ margin: [ margin / 2, 0, 0, 0] });
      this.$childVerticalSpacing = margin;
      return this;
    }
    return this.$childVerticalSpacing;
  },
  childHorizontalSpacing: function(margin) {
    if(margin) {
      this.globalStyle({ margin: [ 0, margin / 2, 0, margin / 2] })
        .pseudoFirstChild({ margin: [ 0, margin / 2, 0, 0] })
        .pseudoLastChild({ margin: [ 0, 0, 0, margin / 2] });
      this.$childVerticalSpacing = margin;
      return this;
    }
    return this.$childHorizontalSpacing;
  },
  clearFix: function(v) {
    if(v) {
      this.pseudoAfter({
        content: '', display: 'table', clear: 'both'
      });
      this.$clearFix = v;
      return this;
    }
    return this.$clearFix;
  },
  flexSpaceBetween: function(v) {
    if(v) {
      this.display('flex').justifyContent('space-between');
      this.$flexSpaceBetween = v;
      return this;
    }
    return this.$flexSpaceBetween;
  },
  flexCenter: function(v) {
    if(v) {
      this.display('flex').justifyContent('center').alignItems('center');
      this.$flexCenter = v;
      return this;
    }
    return this.$flexCenter;
  },
  tag: function(tag) {
    if(tag !== undefined) {
      this.$tag = tag;
      return this;
    }
    return this.$tag;
  },
  getChild(predicate) {
    const matches = [];
    const children = this.$children.filter((child, i) => {
      const keys = window.Object.keys(predicate), check = keys.length;
      let valid = 0;
      keys.forEach((key, index) => {
        if(predicate[key] === child['$' + key]) {
          valid += 1;
        }
      });
      if(valid === check) return true;
    });
    return children[0];
  },
  node: function(v) {
    if(v) {
      this.$node = v;
      return this;
    }
    return this.$node;
  },
  relCenterHorizontal: function(v) {
    if(v){
      this.margin(['auto', 'auto']);
      this.$relCenterHorizontal = v;
      return this;
    }
    return this.$relCenterHorizontal;
  },
  removeClassName: function(name) {
    if(this.$node) {
      this.$node.classList.remove(name);
    }else if(this.className.match(name)) {
      this.className.replace(' '+name, '');
    }
    return this;
  },
  replaceTextTag: function(text, tagObject) {
    const all = text.match(/([\${\w]+\([\w,\s]*\)})/g),
    children = [],
    p = (t) => {
      all.map((i, inx) => {
        const tag = i.match(/{([\w]+\()/g)[0].replace('{','').replace('(',''),
        args = i.match(/(\([\w,]+)/g).map(i => i.replace('(', ''));
        children.push(t.slice(0, t.indexOf(i)));
        children.push(tagObject[tag](...args));
        t = t.slice(t.indexOf(i) + i.length);
        if(inx === all.length - 1) {
          if(t.length > 0) children.push(t);
        }
      });
    };
    p(text);
    this.$children = this.$children.concat(children);
    return this;
  },
  respond: function(key, props) {
    // Check all

    this.$responsiveness = this.$responsiveness || [];
    this.$responsiveness.push({key: key, props: props});
    return this;
  },
  size: function(...v) {
    if(arguments.length > 0) {
      const v = arguments.length === 1 ? arguments[0] : Array.from(arguments);
      this.height(v[1]).width(v[0]);
      this.$size = v;
      return this;
    }
    return this.$size;
  },
  stack: function(children, options) {
    const o = options||{};
    for (let i = 0; i < children.length; i++) {
      this.addChild(children[i]);
    }
    (o.vertical)
      ? this.childVerticalSpacing(o.margin||0)
      : this.childHorizontalSpacing(o.margin||0);
    this.display('flex').flexDirection((o.vertical)
      ? 'column' : 'row');
    return this;
  },
  stackVertical: function(margin) {
    if(margin != undefined) {
      this.display('flex').flexDirection('column')
        .globalStyle({ margin: [ margin / 2, 0, margin / 2, 0] })
        .pseudoFirstChild({ margin: [ 0, 0, margin / 2, 0 ] })
        .pseudoLastChild({ margin: [ margin / 2, 0, 0, 0 ] });
      this.$stackVertical = true;
      return this;
    }
    return this.$stackVertical;
  },
  truncateText: function(v) {
    if(v) {
      this.overflow('hidden').textOverflow('ellipsis')
        .whiteSpace('nowrap');
      this.$truncateText = v;
      return this;
    }
    return this.$truncateText;
  }
}

for(let fns in LayoutFunctions) {
  $RxElement.prototype[fns] = LayoutFunctions[fns];
  Component.prototype[fns] = LayoutFunctions[fns];
}

export class Container extends $RxElement {
  constructor() {
    super();
    this.$children = [];
    this.$init('div');
  }

  host(routes) {
    if(this.$children.length > 0) {
      throw new Error('Host container must be empty!');
    }
    if(Object.prototype.toString.call(routes) == '[object Object]') {
      routes = [routes];
    }
    Native.router.host(this, routes);
    return this;
  }
}

export class Root extends Component {
  constructor() {
    super();
    this.id = 'root';
    this.$init('div');
  }
}

export class PageComponent extends Component {
  constructor() {
    super();
    this.$init('PageComponent');
  }
}

export class Button extends $RxElement {
  constructor() {
    super();
    this.text('Button');
    this.$init('button', 'button');
  }
}

export class A extends $RxElement {
  constructor() {
    super();
    this.$init('a');
  }
}

export class Abbr extends $RxElement {
  constructor() {
    super();
    this.$init('abbr');
  }
}

export class Applet extends $RxElement {
  constructor() {
    super();
    this.$init('applet');
  }
}

export class Area extends $RxElement {
  constructor() {
    super();
    this.$init('area');
  }
}

export class Article extends $RxElement {
  constructor() {
    super();
    this.$init('article');
  }
}

export class Aside extends $RxElement {
  constructor() {
    super();
    this.$init('aside');
  }
}

export class Audio extends $RxElement {
  constructor() {
    super();
    this.$init('audio');
  }
}

export class Base extends $RxElement {
  constructor() {
    super();
    this.$init('base');
  }
}

export class BaseFont extends $RxElement {
  constructor() {
    super();
    this.$init('basefont');
  }
}

export class BDO extends $RxElement {
  constructor() {
    super();
    this.$init('bdo');
  }
}

export class BlockQuote extends $RxElement {
  constructor() {
    super();
    this.$init('blockquote');
  }
}

export class Body extends $RxElement {
  constructor() {
    super();
    this.$init('body');
  }
}

export class BR extends $RxElement {
  constructor() {
    super();
    this.$init('br');
  }
}

export class Canvas extends $RxElement {
  constructor() {
    super();
    this.$init('canvas');
  }
}

export class Caption extends $RxElement {
  constructor() {
    super();
    this.$init('caption');
  }
}

export class Code extends $RxElement {
  constructor() {
    super();
    this.$init('code');
  }
}

export class Col extends $RxElement {
  constructor() {
    super();
    this.$init('col');
  }
}

export class ColGroup extends $RxElement {
  constructor() {
    super();
    this.$init('colgroup');
  }
}

export class Data extends $RxElement {
  constructor() {
    super();
    this.$init('data');
  }
}

export class Details extends $RxElement {
  constructor() {
    super();
    this.$init('details');
  }
}

export class DFN extends $RxElement {
  constructor() {
    super();
    this.$init('dfn');
  }
}

export class Dialog extends $RxElement {
  constructor() {
    super();
    this.$init('dialog');
  }
}

export class DIR extends $RxElement {
  constructor() {
    super();
    this.$init('dir');
  }
}

export class Div extends $RxElement {
  constructor() {
    super();
    this.$init('div');
  }
}

export class DL extends $RxElement {
  constructor() {
    super();
    this.$init('dl');
  }
}

export class Embed extends $RxElement {
  constructor() {
    super();
    this.$init('embed');
  }
}

export class FieldSet extends $RxElement {
  constructor() {
    super();
    this.$init('fieldset');
  }
}

export class FigCaption extends $RxElement {
  constructor() {
    super();
    this.$init('figcaption');
  }
}

export class Figure extends $RxElement {
  constructor() {
    super();
    this.$init('figure');
  }
}

export class Font extends $RxElement {
  constructor() {
    super();
    this.$init('font');
  }
}

export class Footer extends $RxElement {
  constructor() {
    super();
    this.$init('footer');
  }
}

export class Form extends $RxElement {
  constructor() {
    super();
    this.$init('form');
  }
}

export class Del extends $RxElement {
  constructor() {
    super();
    this.$init('del');
  }
}

export class Frame extends $RxElement {
  constructor() {
    super();
    this.$init('frame');
  }
}

export class FrameSet extends $RxElement {
  constructor() {
    super();
    this.$init('frameset');
  }
}

export class H1 extends $RxElement {
  constructor() {
    super();
    this.$init('h1');
  }
}

export class H2 extends $RxElement {
  constructor() {
    super();
    this.$init('h2');
  }
}

export class H3 extends $RxElement {
  constructor() {
    super();
    this.$init('h3');
  }
}

export class H4 extends $RxElement {
  constructor() {
    super();
    this.$init('h4');
  }
}

export class H5 extends $RxElement {
  constructor() {
    super();
    this.$init('h5');
  }
}

export class H6 extends $RxElement {
  constructor() {
    super();
    this.$init('h6');
  }
}

export class Head extends $RxElement {
  constructor() {
    super();
    this.$init('head');
  }
}

export class Header extends $RxElement {
  constructor() {
    super();
    this.$init('header');
  }
}

export class HR extends $RxElement {
  constructor() {
    super();
    this.$init('hr');
  }
}

export class HTML extends $RxElement {
  constructor() {
    super();
    this.$init('html');
  }
}

export class IFrame extends $RxElement {
  constructor() {
    super();
    this.$init('iframe');
  }
}

export class IMG extends $RxElement {
  constructor() {
    super();
    this.$init('img');
  }
}

export class Input extends $RxElement {
  constructor() {
    super();
    this.$init('input');
  }

  model(object) {
    this.$model = {
      key: Native.lock.key,
      type: Native.lock.type,
      nid: Native.lock.nid,
      className: Native.lock.className
    };

    const notifyWatchlist = (lock, value) => {
      const instance = Native.components[lock.className][lock.nid];
      if(instance && instance.served) {
        for(let i = 0; i < instance.watchlist.length; i++) {
          const w = instance.watchlist[i];
          if(lock.key === w.prop) {
            w.function(value);
            w.oldvalue = value;
          }
        }
      }
    }

    if(object) this.value(object);
    this.on({
      input: () => {
        const lock = this.$model;
        if(lock.type === 'state') {
          const chain = lock.key.replace(lock.className+'.', '').split('.');
          protoSet(Native.components[lock.className][lock.nid].state, chain, this.node.value);
          notifyWatchlist(lock, this.node.value);
        }else if(lock.type === 'property') {
          const chain = lock.key.replace(lock.className+'.', '').split('.');
          protoSet(Native.components[lock.className][lock.nid].instance, chain, this.node.value);
          notifyWatchlist(lock, this.node.value);
        }
      }
    });
    return this;
  }
}

export class Ins extends $RxElement {
  constructor() {
    super();
    this.$init('ins');
  }
}

export class IsIndex extends $RxElement {
  constructor() {
    super();
    this.$init('isindex');
  }
}

export class Label extends $RxElement {
  constructor() {
    super();
    this.$init('label');
  }

}

export class Legend extends $RxElement {
  constructor() {
    super();
    this.$init('legend');
  }
}

export class LI extends $RxElement {
  constructor() {
    super();
    this.$init('li');
  }
}

export class Main extends $RxElement {
  constructor() {
    super();
    this.$init('main');
  }
}

export class Map extends $RxElement {
  constructor() {
    super();
    this.$init('map');
  }
}

export class Mark extends $RxElement {
  constructor() {
    super();
    this.$init('mark');
  }
}

export class Menu extends $RxElement {
  constructor() {
    super();
    this.$init('menu');
  }
}

export class Meta extends $RxElement {
  constructor() {
    super();
    this.$init('meta');
  }
}

export class Meter extends $RxElement {
  constructor() {
    super();
    this.$init('meter');
  }
}

export class Nav extends $RxElement {
  constructor() {
    super();
    this.$init('nav');
  }
}

export class Object extends $RxElement {
  constructor() {
    super();
    this.$init('object');
  }
}

export class OL extends $RxElement {
  constructor() {
    super();
    this.$init('ol');
  }
}

export class OptGroup extends $RxElement {
  constructor() {
    super();
    this.$init('optgroup');
  }
}

export class Option extends $RxElement {
  constructor() {
    super();
    this.$init('option');
  }
}

export class Output extends $RxElement {
  constructor() {
    super();
    this.$init('output');
  }
}

export class P extends $RxElement {
  constructor() {
    super();
    this.$init('p');
  }
}

export class Param extends $RxElement {
  constructor() {
    super();
    this.$init('param');
  }
}

export class Pre extends $RxElement {
  constructor() {
    super();
    this.$init('pre');
  }
}

export class Progress extends $RxElement {
  constructor() {
    super();
    this.$init('progress');
  }
}

export class Q extends $RxElement {
  constructor() {
    super();
    this.$init('q');
  }
}

export class Script extends $RxElement {
  constructor() {
    super();
    this.$init('script');
  }
}

export class Section extends $RxElement {
  constructor() {
    super();
    this.$init('section');
  }
}

export class Select extends $RxElement {
  constructor() {
    super();
    this.$init('select');
  }
}

export class Slot extends $RxElement {
  constructor() {
    super();
    this.$init('slot');
  }
}

export class Source extends $RxElement {
  constructor() {
    super();
    this.$init('source');
  }
}

export class Span extends $RxElement {
  constructor() {
    super();
    this.$init('span');
  }
}

export class Style extends $RxElement {
  constructor() {
    super();
    this.$init('style');
  }
}

export class Summary extends $RxElement {
  constructor() {
    super();
    this.$init('summary');
  }
}

export class Table extends $RxElement {
  constructor() {
    super();
    this.$init('table');
  }
}

export class TBody extends $RxElement {
  constructor() {
    super();
    this.$init('tbody');
  }
}

export class TD extends $RxElement {
  constructor() {
    super();
    this.$init('td');
  }
}

export class Textarea extends $RxElement {
  constructor() {
    super();
    this.$init('textarea');
  }
}

export class TFoot extends $RxElement {
  constructor() {
    super();
    this.$init('tfoot');
  }
}

export class TH extends $RxElement {
  constructor() {
    super();
    this.$init('th');
  }
}

export class THead extends $RxElement {
  constructor() {
    super();
    this.$init('thead');
  }
}

export class Time extends $RxElement {
  constructor() {
    super();
    this.$init('time');
  }
}

export class TR extends $RxElement {
  constructor() {
    super();
    this.$init('tr');
  }
}

export class Track extends $RxElement {
  constructor() {
    super();
    this.$init('track');
  }
}

export class UL extends $RxElement {
  constructor() {
    super();
    this.$init('ul');
  }
}

export class Video extends $RxElement {
  constructor() {
    super();
    this.$init('video');
  }
}

export class Link extends A {
  constructor() {
    super();
    this.$init('a');
  }
}

export class Image extends IMG {
  constructor() {
    super();
    this.$init('img');
  }
}
