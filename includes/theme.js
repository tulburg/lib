import {
  Button, Container
} from '../core/components';

const LightenColor = (color, percent) => {
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
};

const DarkenColor = (color, percent)  => {
  return LightenColor(color, -percent);
};

export default {
  Colors: {
    primary: '#4286f4', white: '#FFFFFF', grey: '#686868'
  },

  Globals: {
    outline: '0', border: '0',
    margin: '0'
  },

  Button: () => {
    return new Button().padding([10, 25, 10, 25]).background(Default.Colors.white)
      .borderRadius(4).border('1px solid ' + DarkenColor(
        Default.Colors.white, 10
      )
    ).color(Default.Colors.grey);
  }
};
