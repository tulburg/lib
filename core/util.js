export const MOD_TYPE = {
  insert: 1,
  update: 2,
  delete: 3,
  replace: 4,
  sort: 5,
  reverse: 6,
  state: 7,
  toString(val) {
    switch(val) {
      case 1: return 'insert';
      case 2: return 'update';
      case 3: return 'delete';
      case 4: return 'replace';
      case 5: return 'sort';
      case 6: return 'reverse';
      case 7: return 'state';
    }
  }
};

export const Handler = {
  // Error codes
  // > 1000 = Basics
  // > 1100 = Critical
  // Warning codes
  // > 1200
  Codes: {
    // Errors
    doubleParent: {
      code: 1001,
      message: 'Child $1 already has a parent'
    },
    noChildren: {
      code: 1002,
      messgae: '$1 doesn\'t seem to accept children'
    },
    noArrayChild: {
      code: 1003,
      message: '$1 doesn\'t seem to accept children'
    },
    stateOnDestroy: {
      code: 1004,
      message: 'Set state called on a destroyed component: $1'
    },
    getStateOnDestroy: {
      code: 1005,
      message: 'Get state called on a destroyed component: $1'
    },
    noChildExist: {
      code: 1006,
      message: '$1: Child $2 doesn\'t exists on $3'
    },
    InvalidAnimType: {
      code: 1007,
      message: '$1: Invalid animations type, array expected'
    },
    // Warnings
    absParent: {
      code: 1201,
      message: 'No parent found, abs layout requires child attached to parent'
    },
  },

  Error: (error, ...args) => {
    let message = error.message;
    for(let i = 0; i < args.length; i++) {
      message = message.replace('$'+(i+1), args[i]);
    }
    throw new Error(error.code + ': ' + message);
  },

  Warning: (error, ...args) => {
    let message = error.message;
    for(let i = 0; i < args.length; i++) {
      message = message.replace('$'+(i+1), args[i]);
    }
    console.warn(error.code + ': ' + message);
  }
};

export function protoSet(base, chain, value) {
  if(base.hasOwnProperty(chain[0]) && chain.length > 1) {
    const newBase = base[chain[0]];
    chain.shift();
    protoSet(newBase, chain, value);
  }else {
    base[chain[0]] = value;
  }
}

export function type(object) {
  return Object.prototype.toString.apply(object).split(' ')[1].slice(0, -1).toLowerCase();
}

export class Animation {
  constructor(options) {
    this.$name = 'anim-' + Math.random().toString(36).substr(2, 9);
    if(options) {
      this.$timingFunction = options.timingFunction || Animation.$.TimingFunction.Ease;
      this.$direction = options.direction || Animation.$.Direction.Normal;
      this.$fillMode = options.fillMode || Animation.$.FillMode.Forwards;
      this.$iterationCount = options.iterationCount || 1;
      this.$delay = options.delay || 0;
      this.$duration = options.duration || 0.35;
      this.$keyframes = options.keyframes;
      this.$keyframe = options.keyframe;
    } else {
      this.$timingFunction = Animation.$.TimingFunction.Ease;
      this.$direction = Animation.$.Direction.Normal;
      this.$fillMode = Animation.$.FillMode.Forwards;
      this.$iterationCount = 1;
      this.$delay = 0;
      this.$duration = 0.35;
    }
  }

  duration(v) {
    if(v) { this.$duration = v; return this; }
    return this.$duration;
  }

  delay(v) {
    if(v) { this.$delay = v; return this; }
    return this.$delay;
  }

  timingFunction(v) {
    if(v) { this.$timingFunction = v; return this; }
    return this.$timingFunction;
  }

  direction(v) {
    if(v) { this.$direction = v; return this; }
    return this.$direction;
  }

  fillMode(v) {
    if(v) { this.$fillMode = v; return this; }
    return this.$fillMode;
  }

  iterationCount(v) {
    if(v) { this.$iterationCount = v; return this; }
    return this.$iterationCount;
  }

  keyframe(v) {
    if(v) { this.$keyframe = v; return this; }
    return this.$keyframe;
  }

  keyframes(v) {
    if(v) { this.$keyframes = v; return this; }
    return this.$keyframes;
  }

  static $ = {
    Direction: {
      Normal: 'normal', Reverse: 'reverse', Alternate: 'alternate',
      AlternateReverse: 'alternate-reverse', NormalReverse: 'normal, reverse',
      AlternateReverseNormal: 'alternate, reverse, normal'
    },
    FillMode: {
      None: 'none', Forwards: 'forwards', Backwards: 'backwards', Both: 'both',
      NoneBackwards: 'none, backwards', BothForwardsNode: 'both, forwards, none'
    },
    IterationCount: { Infinite: 'infinite' },
    TimingFunction: {
      Ease: 'ease', EaseIn: 'ease-in', EaseOut: 'ease-out', EaseInOut: 'ease-in-out',
      Linear: 'linear', StepStart: 'step-start', StepEnd: 'step-end',
      easeInOutQuart: 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
      Steps: function(frame, position) { return `steps(${frame}, ${position})`; },
      CubicBezier: function(x1, y1, x2, y2) { return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})` },
      Group: function(...args) {
        const r = "";
        for(let i = 0; i < args.length; i++) {
          r += args[i];
        }
        return r;
      }
    },
    Keyframe: class {
      constructor(options) {
        this.$key = options.key;
        this.$frame = options.frame;
      }

      key(v) {
        if(v) { this.$key = v; return this; }
        return this.$key;
      }

      frame(v) {
        if(v) { this.$frame = v; return this; }
        return this.$frame;
      }
    }
  }
}
