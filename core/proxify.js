import { MOD_TYPE, type } from './util';
import { $RxElement } from './components';

const $observeArray = (object, value, key) => {
  const val = value;
  const oldObj = object;
  const oldVal = val;
  value.push = (item) => {
    Array.prototype.push.call(value, item);
    if(Native && Native.served) {
      Native.$notify({
        oldObj: oldObj, newObj: object, oldVal: oldVal, newVal: value,
        key: key, index: value.indexOf(item), count: 1
      }, MOD_TYPE.insert);
    }
  };

  value.pop = () => {
    const index = value.length - 1;
    Array.prototype.pop.call(value);
    if(Native && Native.served) {
      Native.$notify({
        oldObj: oldObj, index: index, count: 1
      }, MOD_TYPE.delete);
    }
  };

  value.shift = () => {
    Array.prototype.shift.call(value);
    if(Native && Native.served) {
      Native.$notify({
        oldObj: oldObj, index: 0, count: 1
      }, MOD_TYPE.delete);
    }
  };

  value.unshift = (item) => {
    Array.prototype.unshift.call(value, item);
    if(Native && Native.served) {
      Native.$notify({
        oldObj: oldObj, newObj: object, oldVal: oldVal, newVal: value,
        key: key, index: 0, count: 1
      }, MOD_TYPE.insert);
    }
  };

  value.splice = (index, count, replace) => {
    if(value[index] && value[index].$level === 0) {
      const c = value[index];
      delete Native.components[c.name][c.nid];
    }
    if(Native && Native.served) {
      if(replace) {
        Native.$notify({
          oldObj: oldObj.$children[index], newObj: replace
        }, MOD_TYPE.replace);
      }else {
        // send delete
        Native.$notify({
          oldObj: oldObj, index: index, count: 1
        }, MOD_TYPE.delete);
      }
    }
    Array.prototype.splice.call(value, index, count, replace);
  };

  value.sort = (fn) => {
    Array.prototype.sort.call(value, fn);
    if(Native && Native.served) {
      Native.$notify({
        oldObj: oldObj, newObj: object, oldVal: oldVal, newVal: value,
        key: key, index: 0, count: 0
      }, MOD_TYPE.sort);
    }
  };

  value.reverse = () => {
    Array.prototype.reverse.call(value);
    if(Native && Native.served) {
      Native.$notify({
        oldObj: oldObj, newObj: object, oldVal: oldVal, newVal: value,
        key: key, index: 0, count: 0
      }, MOD_TYPE.reverse);
    }
  };
};


export const Proxify = (object) => {
  // proxify children
  if(object.$children) $observeArray(object, object.$children, '$children');
  return new Proxy(object, {
    get: (object, name, receiver) => {
      if(name == '__proxy__') return true;
      return Reflect.get(object, name, receiver);
    },
    set: (object, name, value, receiver) => {
      const old = object[name];
      const oldObj = object;
      if (value && typeof value == 'object' && name != '__proto__'
        && name != 'root' && name != 'events' && name != 'node' && name != '$model') {
        if(value instanceof Array) {
          $observeArray(object, value, name);
        }else if(!value.__proxy__){
          value = Proxify(value);
        }
      }
      object[name] = value;
      if(name != '__proto__' && name != '$native' && object.tagName != 'window.RxElement'
        && name != 'tagName' && name != 'animations' && name != 'node' && name != 'root'
        && name != 'className' && name != '$children' && name != 'cssRules') {
        if(Native && Native.served) {
          Native.$notify({
            oldObj: oldObj, newObj: object, oldVal: old,
            newVal: value, key: name
          }, MOD_TYPE.update);
        }
      }
      return Reflect.set(object, name, value, receiver);
    }
  });
};

export const ProxifyComponent = (object, componentName, nid) => {
  // proxify children
  if(object.$children) $observeArray(object, object.$children, '$children');
  return new Proxy(object, {
    get: (object, name, receiver) => {
      if(name == '__proxy__') return true;
      Native.lock = Native.lock || {};
      if(object.name === undefined && type(object[name]) !== 'function'
        && type(name) === 'string') {
        Native.lock.key = Native.lock.key + '.' + name;
      }
      if(type(name) !== 'symbol' && type(object[name]) !== 'function') {
        Native.lock.key = componentName + '.' + name;
      }
      Native.lock.type = 'property';
      Native.lock.className = componentName;
      Native.lock.nid = nid;
      return Reflect.get(object, name, receiver);
    },
    set: (object, name, value, receiver) => {
      const old = object[name];
      const oldObj = object;
      if(type(value) === 'object' && name != '$children'
        && name != '__root__' && name != 'state') {
        if(value instanceof $RxElement && !value.__proxy__) {
          value = Proxify(value);
        }else if(!value.__proxy__) {
          value = ProxifyComponent(value, componentName, nid);
        }
      } else if (type(value) == 'array') {
        // statelyArray or something
      } else if (type(value) == 'function') {
        // do nothing
      }
      if(name != '__proto__') {
        object[name] = value;
        const instance = Native.components[componentName][nid];
        if(instance && instance.served) {
          // send notification to watchlist
          for(let i = 0; i < instance.watchlist.length; i++) {
            const w = instance.watchlist[i];
            if(Native.lock && Native.lock.key + '.' +name === w.prop) {
              w.function(value);
              w.oldvalue = value;
            }
          }
        }
      }
      if(name != '__proto__' && name != '$native' && object.tagName != 'window.RxElement'
        && name != 'tagName' && name != 'animations' && name != 'node' && name != 'root'
        && name != 'className' && name != '$children' && name != 'cssRules') {
        if(Native && Native.served) {
          Native.$notify({
            oldObj: oldObj, newObj: object, oldVal: old,
            newVal: value, key: name
          }, MOD_TYPE.update);
        }
      }
      return Reflect.set(object, name, value, receiver);
    }
  });
};

// const oldConsoles = [console.log, console.warn, console.table, console.

[Boolean.prototype, Number.prototype, String.prototype, Array.prototype].map(o => {
  o.watch = function(fn) {
    if(fn) {
      const watcher = {
        prop: Native.lock.key, oldvalue: this, function: fn
      };
      const lock = Native.lock;
      if(Native.lock.type === 'state') {
        watcher.object = Native.components[lock.className][lock.nid].state;
      } else if(lock.type === 'property') {
        watcher.object = Native.components[lock.className][lock.nid];
      }
      Native.components[lock.className][lock.nid]
        = Native.components[lock.className][lock.nid] || { watchlist: [] };
      if(Native.components[lock.className][lock.nid].watchlist.filter(i => {
        return ''+i.function == ''+watcher.function && i.prop == watcher.prop;
      }).length < 1) {
        Native.components[lock.className][lock.nid].watchlist.push(watcher);
      }
    }
  };
});
export const ProxifyState = (object, componentName, nid) => {
  const setName = (object) => {
    for(let prop in object) {
      if(type(object[prop]) === 'object') {
        if(!object[prop].__proxy__) {
          object[prop] = ProxifyState(object[prop], componentName, nid);
        }
      }
    }
  }
  setName(object);
  return new Proxy(object, {
    get: (object, name, receiver) => {
      if(name == '__proxy__') return true;
      Native.lock = Native.lock || {};
      if(object.name === undefined && type(object[name]) !== 'function'
        && type(name) === 'string') {
        Native.lock.key = Native.lock.key + '.' + name;
      }
      if(object.__state__ && type(name) === 'string') {
        Native.lock.key = componentName + '.' + name;
      }
      Native.lock.type = 'state';
      Native.lock.className = componentName;
      Native.lock.nid = nid;
      return Reflect.get(object, name, receiver);
    },
    set: (object, name, value, receiver) => {
      const oldvalue = object[name];
      if(type(value) === 'object' && name != '$children' && name != '__root__') {
        if(value instanceof $RxElement) {
          throw new Error(`Object of RxElement (${value}) cannot be set as stateful`);
        }else {
          if(!value.__proxy__) {
            value = ProxifyState(value, componentName, nid);
          }
        }
      } else if (type(value) == 'array') {
        // statelyArray or something
      } else if (type(value) == 'function') {
        // throw error
      }
      object[name] = value;
      if(window.Native && Native.components[componentName][nid].served) {
        // send notification to watchlist
        for(let i = 0; i < Native.components[componentName][nid].watchlist.length; i++) {
          const w = Native.components[componentName][nid].watchlist[i];
          if(Native.lock.key + '.' + name === w.prop && w.oldvalue == oldvalue) {
            w.function(value);
            w.oldvalue = value;
          }
        }
        // trigger component redraw
        window.Native.updateState(componentName, nid);
      }
      return Reflect.set(object, name, value, receiver);
    }
  });
};
