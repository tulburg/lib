export default function () {
  this.events = {};

  this.emit = function (event, parameters) {
    if (this.events.hasOwnProperty(event)) {
      for (let i = 0; i < this.events[event].length; i++) {
        this.events[event][i](parameters);
      }
    } else {
      return false;
    }
    return true;
  };

  this.on = function (event, listener) {
    if (this.events.hasOwnProperty(event)) {
      this.events[event].push(listener);
    } else {
      this.events[event] = [listener];
    }
  };

  this.remove = function (event, listener) {
    if (this.events.hasOwnProperty(event)) {
      if (this.events[event].indexOf(listener)) {
        this.events[event] = this.events[event].splice(
          this.events[event].indexOf(listener), 1
        );
      } else {
        throw new Error(`Event ${event} doesn't have the ${listener} attached`);
      }
    } else {
      throw new Error(`Event ${event} doesn't exist on the bus `);
    }
  };

  this.once = function (event, listener) {
    this.on(event, function (p) {
      listener(p);
      this.remove(event, listener);
    });
  };
}
