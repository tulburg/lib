import _Native from './native';
import Bus from './bus';
import Config from '@src/config';
import Theme from '../includes/theme';
import { $RxElement, Component } from '../core/components';
import { PropUtil } from '../utils/prop-util';

export default class Router {
  constructor () {
    this.routes = Config.routes;
    window.RxElement = $RxElement;
    window.Bus = window.Bus || new Bus();
    window.Theme = window.Theme || (Config.theme != undefined) ? Config.theme : Theme;
    window.Config = Config;
    new _Native(this);
    window.Native.writeGlobals(window.Theme);

    const props = Object.getOwnPropertyNames(PropUtil.props);
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const fn = new Function(
        prop, `return function() {
          if(arguments.length > 0) {
            Object.defineProperty(this, '${prop}', {
              value: '',
              writable: true,
              enumerable: true,
              configurable: true
            });
            this['${prop}'] = arguments.length === 1 ? arguments[0] : Array.from(arguments);
          }else return this.${prop};
          return this;
        }`
      )();
      window.RxElement.prototype[prop.slice(1)] = fn;
      Component.prototype[prop.slice(1)] = fn;
    }
    window.onpopstate = (e) => {
      if(e.state) {
        // let loaded = false;
        for (let i = 0; i < this.routes.length; i++) {
          const route = this.routes[i];
          const data = this.pathData(route);
          if (data) {
            this.current = route;
            this.current.data = data.data;
            Native.load('#app', route);
            // loaded = true;
          }
        }
      }
      this.loadSubs(this.current.subs);
    };
    let loaded = false;
    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];
      const data = this.pathData(route);
      if (data) {
        this.current = route;
        this.current.subs = [];
        this.current.data = data.data;
        Native.load('#app', route);
        loaded = true;
      }
    }
    for (let i = 0; i < this.routes.length; i++) {
      if(!loaded && this.routes[i].subs) {
        for(let j = 0; j < this.routes[i].subs.length; j++) {
          this.current = this.routes[i];
          const data = this.pathData(this.routes[i].subs[j], true);
          if(data) {
            this.current.data = data.data;
            this.current.subs = [];
            Native.load('#app', this.routes[i]);
          }
        }
      }
    }
  }

  host(host, routes) {
    this.current.subs = this.current.subs || [];
    this.current.subs.push({ host: host, routes: routes });
  }

  loadSubs(subs) {
    for(let i = 0; i < subs.length; i++) {
      const routes = subs[i].routes;
      for(let j = 0; j < routes.length; j++) {
        const route = routes[j];
        const data = this.pathData(route, true);
        if (data) {
          Object.assign(this.current.data, data.data);
          Native.load('.'+subs[i].host.className, route, true);
        }
      }
    }
  }

  go (path) {
    window.history.pushState(Object.create(this.current), '', path);
    let loaded = false;
    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];
      const data = this.pathData(route);
      if (data) {
        this.current = route;
        this.current.data = data.data;
        loaded = true;
        Native.load('#app', route);
      }
    }
    if(!loaded) {
      this.loadSubs(this.current.subs);
    }
  }

  pathData(route, sub) {
    let path = (sub) ? this.current.path + route.path : route.path;
    let current = window.location.pathname;
    if(current[current.length - 1] == '/') current = current.substring(0, current.length - 1);
    if(path[path.length - 1] == '/') path = path.substring(0, path.length - 1);

    const variables = {};
    path.split('/').map((i, index) => {
      if(i.indexOf(':') > -1) {
        variables[index] = i.slice(1);
      }
    });

    if(route.path == current) {
      return { path: current, data: {} };
    }

    if(path.split('/').length == current.split('/').length) {
      const values = {};
      current.split('/').map((i, index) => {
        if(variables[index]) values[variables[index]] = i;
      });
      const rebuild = path.split('/').map((i, index) => {
        if(variables[index]) return values[variables[index]];
        return i;
      }).join('/');
      if(rebuild == current) {
        return { path: current, data: values };
      }
    }
    return;
  }
}
