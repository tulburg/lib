import {
  Button as DefaultButton,
  Container as DefaultContainer,
  PageComponent as DefaultPageComponent,
  Section as DefaultSection,
  H1 as DefaultH1,
  $RxElement
} from '../core/components';

export class Container extends DefaultContainer {
  constructor() {
    super();
    this.backgroundColor(Color.background)
  }
}

export class PageComponent extends DefaultPageComponent {
  constructor() {
    super();
  }
}

export class Section extends DefaultSection {
  constructor(padding, ...children) {
    super(padding, children);
    this.backgroundColor(Color.background)
      .padding(padding);
  }
}

export class GridContainer extends DefaultContainer {
  constructor(template, ...children) {
    super(template, children);
    this.display('grid')
      .gridTemplateColumns(template)
      .addChild(...children);
  }
}

export class Header extends DefaultH1 {
  constructor(text, size) {
    super(text, size);
    this.text(text).fontSize(size)
      .color(Color.textDark)
      .margin(0).padding([4, 0]);
  }
}

export class Button extends DefaultButton {
  constructor(text, size){
    super(text, size);
    this.text(text).fontSize(size)
      .color(Color.textDark)
      .padding(8, 15).border(0)
      .backgroundColor(Color.$.darken(Color.background, 30))
  }
}

export class Style {
  constructor(name) {
    this.className = name || 's'.toLowerCase() + Math.random().toString(36).substr(2, 9);
  }
}
/// Theme Utils -------------------------------------->

export const Color = {
  // Color definition
  white: '#FFFFFF',
  black: '#000000',
  blue: '#1C7DDF',
  background: '#F0F0F0',
  textLight: '#7C7C7F',
  textDark: '#202020',
  // Func definition
  // Utils
  $: {
    darken: (color, percent) => {
      return Color.$.lighten(color, -percent);
    },
    lighten: (color, percent) => {
      percent = percent / 100;
      /* Credit: https://github.com/PimpTrizkit/PJs/wiki
        12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)
       */
      const f = parseInt(color.slice(1), 16);
      const t = percent < 0 ? 0 : 255;
      const p = percent < 0 ? percent * -1 : percent;
      const R = f >> 16;
      const G = f >> 8 & 0x00FF;
      const B = f & 0x0000FF;
      return '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000
        + (Math.round((t - G) * p) + G) * 0x100
        + (Math.round((t - B) * p) + B)).toString(16).slice(1);
    }
  }
};

export const Font = {
  // Specs definition
  small: 8,
  medium: 10,
  normal: 14,
  large: 18,
  xLarge: 24,
  xxLarge: 28,
  xxxLarge: 34,
  huge: 64,
  // Func definition
  $: {
    rem: (px) => {
      return px/16 + 'rem';
    }
  }
}

export const Padding = {
  xsmall: 2,
  small: 5,
  medium: 8,
  normal: 10,
  large: 15,
  xLarge: 20,
  xxLarge: 30,
  xxxLarge: 40
}

export default {
  Colors: {
    primary: '#4286f4', white: '#FFFFFF', grey: '#686868'
  },

  Font: Font,
  Padding: Padding,

  Globals: {
    '*': {
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
      fontSize: Font.$.rem(14),
      outline: '0',
      border: '0',
      margin: '0'
    },
    html: {
      outline: 0,
      padding: 0,
      margin: 0,
      fontSize: '100%'
    }
  }
};
