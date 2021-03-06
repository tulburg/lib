const parseStyleValue = (value) => {
  if (typeof value === 'number') {
    return value + 'px';
  } else if (value instanceof (Array)) {
    return value.map(v => parseStyleValue(v)).join(' ');
  }
  return value;
};

const parseNativeStyle = (obj) => {
  let objStyles = '';
  for (let prop in obj) {
    prop = '$' + prop;
    if (PropUtil.props.hasOwnProperty(prop)) {
      const f = PropUtil.props[prop];
      if (typeof f === 'string') {
        if (f.match('css.')) {
          objStyles += f.split('.')[1] + ': '
            + parseStyleValue(obj[prop.slice(1)]) + '; ';
        }
      }
    } else {
      if (PropUtil.excludes.indexOf(prop.toLowerCase()) < 0 && obj.$level != 0) {
        throw new Error('Invalid css property ' + prop);
      }
    }
  }
  return objStyles;
};

const PropUtil = {
  props: {
    // css styling
    '$alignContent': 'css.align-content',
    '$alignItems': 'css.align-items',
    '$alignSelf': 'css.align-self',
    // '$animation': 'css.animation', // Parsed in component.js already
    '$animationDelay': 'css.animation-delay',
    '$animationDirection': 'css.animation-direction',
    '$animationDuration': 'css.animation-duration',
    '$animationFillMode': 'css.animation-fill-mode',
    '$animationIterationCount': 'css.animation-iteration-count',
    '$animationName': 'css.animation-name',
    '$animationPlayState': 'css.animation-play-state',
    '$animationTimingFunction': 'css.animation-timing-function',
    '$backfaceVisibility': 'css.backface-visibility',
    '$background': 'css.background',
    '$backgroundAttachment': 'css.background-attachment',
    '$backgroundClip': 'css.background-clip',
    '$backgroundColor': 'css.background-color',
    '$backgroundImage': 'css.background-image',
    '$backgroundOrigin': 'css.background-origin',
    '$backgroundPosition': 'css.background-position',
    '$backgroundRepeat': 'css.background-repeat',
    '$backgroundSize': 'css.background-size',
    '$border': 'css.border',
    '$borderBottom': 'css.border-bottom',
    '$borderBottomColor': 'css.border-bottom-color',
    '$borderBottomLeftRadius': 'css.border-bottom-left-radius',
    '$borderBottomRightRadius': 'css.border-bottom-right-radius',
    '$borderBottomStyle': 'css.border-bottom-style',
    '$borderBottomWidth': 'css.border-bottom-width',
    '$borderCollapse': 'css.border-collapse',
    '$borderColor': 'css.border-color',
    '$borderImage': 'css.border-image',
    '$borderImageOutset': 'css.border-image-outset',
    '$borderImageRepeat': 'css.border-image-repeat',
    '$borderImageWidth': 'css.border-image-width',
    '$borderLeft': 'css.border-left',
    '$borderLeftColor': 'css.border-left-color',
    '$borderLeftStyle': 'css.border-left-style',
    '$borderLeftWidth': 'css.border-left-width',
    '$borderRadius': 'css.border-radius',
    '$borderRight': 'css.border-right',
    '$borderRightColor': 'css.border-right-color',
    '$borderRightStyle': 'css.border-right-style',
    '$borderRightWidth': 'css.border-right-width',
    '$borderSpacing': 'css.border-spacing',
    '$borderStyle': 'css.border-style',
    '$borderTop': 'css.border-top',
    '$borderTopColor': 'css.border-top-color',
    '$borderTopLeftRadius': 'css.border-top-left-radius',
    '$borderTopRightRadius': 'css.border-top-right-radius',
    '$borderTopStyle': 'css.border-top-style',
    '$borderTopWidth': 'css.border-top-width',
    '$borderWidth': 'css.border-width',
    '$bottom': 'css.bottom',
    '$boxDecorationBreak': 'css.decoration-break',
    '$boxShadow': 'css.box-shadow',
    '$boxSizing': 'css.box-sizing',
    '$breakAfter': 'css.break-after',
    '$breakBefore': 'css.break-before',
    '$breakInside': 'css.break-inside',
    '$captionSide': 'css.caption-side',
    '$caretColor': 'css.caret-color',
    '$clear': 'css.clear',
    '$clip': 'css.clip',
    '$color': 'css.color',
    '$columnCount': 'css.column-count',
    '$columnFill': 'css.column-fill',
    '$columnGap': 'css.column-gap',
    '$columnRule': 'css.column-rule',
    '$columnRuleColor': 'css.column-rule-color',
    '$columnRuleStyle': 'css.column-rule-style',
    '$columnRuleWidth': 'css.column-rule-width',
    '$columnSpan': 'css.column-span',
    '$columnWidth': 'css.column-width',
    '$columns': 'css.columns',
    '$content': 'css.content',
    '$counterIncrement': 'css.counter-increment',
    '$counterReset': 'css.counter-reset',
    '$cursor': 'css.cursor',
    '$direction': 'css.direction',
    '$display': 'css.display',
    '$emptyCells': 'css.emptyCells',
    '$filter': 'css.filter',
    '$flex': 'css.flex',
    '$flexBasis': 'css.flex-basis',
    '$flexDirection': 'css.flex-direction',
    '$flexFlow': 'css.flex-flow',
    '$flexGrow': 'css.flex-grow',
    '$flexShrink': 'css.flex-shrink',
    '$flexWrap': 'css.flex-wrap',
    '$float': 'css.float',
    '$font': 'css.font',
    '$fontFamily': 'css.font-family',
    '$fontFeatureSettings': 'css.font-feature-settings',
    '$fontKerning': 'css.font-kerning',
    '$fontLanguageOverride': 'css.font-language-override',
    '$fontSize': 'css.font-size',
    '$fontSizeAdjust': 'css.font-size-adjust',
    '$fontStretch': 'css.font-stretch',
    '$fontStyle': 'css.font-style',
    '$fontSynthesis': 'css.font-synthesis',
    '$fontVariant': 'css.font-variant',
    '$fontVariantAlternates': 'css.font-variant-alternates',
    '$fontVariantCaps': 'css.font-variant-caps',
    '$fontVariantEastAsian': 'css.font-variant-east-asian',
    '$fontVariantLigatures': 'css.font-variant-ligatures',
    '$fontVariantNumeric': 'css.font-variant-numeric',
    '$fontVariantPosition': 'css.font-variant-position',
    '$fontWeight': 'css.font-weight',
    '$grid': 'css.grid',
    '$gridArea': 'css.grid-area',
    '$gridAutoColumns': 'css.grid-auto-columns',
    '$gridAutoFlow': 'css.grid-auto-flow',
    '$gridColumn': 'css.grid-column',
    '$gridColumnEnd': 'css.grid-column-end',
    '$gridColumnGap': 'css.grid-column-gap',
    '$gridColumnStart': 'css.grid-column-start',
    '$gridGap': 'css.grid-gap',
    '$gridRow': 'css.grid-row',
    '$gridRowEnd': 'css.grid-row-end',
    '$gridRowStart': 'css.grid-row-start',
    '$gridTemplate': 'css.grid-template',
    '$gridTemplateAreas': 'css.grid-template-areas',
    '$gridTemplateColumns': 'css.grid-template-columns',
    '$gridTemplateRows': 'css.grid-template-rows',
    '$hangingPunctuation': 'css.hangingPunctuation',
    '$height': 'css.height',
    '$hyphens': 'css.hyphens',
    '$isolation': 'css.isolation',
    '$inset': 'css.inset',
    '$insetBottom': 'css.inset-bottom',
    '$insetLeft': 'css.inset-left',
    '$insetRight': 'css.inset-right',
    '$insetTop': 'css.inset-top',
    '$justifyContent': 'css.justify-content',
    '$justifySelf': 'css.justify-self',
    '$justifyItems': 'css.justify-items',
    '$left': 'css.left',
    '$letterSpacing': 'css.letter-spacing',
    '$lineBreak': 'css.line-break',
    '$lineHeight': 'css.line-height',
    '$lineStyle': 'css.line-style',
    '$lineStyleImage': 'css.line-style-image',
    '$lineStylePosition': 'css.line-style-position',
    '$lineStyleType': 'css.line-style-type',
    '$margin': 'css.margin',
    '$marginBottom': 'css.margin-bottom',
    '$marginLeft': 'css.margin-left',
    '$marginRight': 'css.margin-right',
    '$marginTop': 'css.margin-top',
    '$maxHeight': 'css.max-height',
    '$maxWidth': 'css.max-width',
    '$minHeight': 'css.min-height',
    '$minWidth': 'css.min-width',
    '$mixBlendMode': 'css.mix-blend-mode',
    '$objectFit': 'css.object-fit',
    '$objectPosition': 'css.object-position',
    '$opacity': 'css.opacity',
    '$order': 'css.order',
    '$orphans': 'css.orphans',
    '$outline': 'css.outline',
    '$outlineColor': 'css.outline-color',
    '$outlineOffset': 'css.outline-offset',
    '$outlineStyle': 'css.outline-style',
    '$outlineWidth': 'css.outline-width',
    '$overflow': 'css.overflow',
    '$overflowWrap': 'css.overflow-wrap',
    '$overflowX': 'css.overflow-x',
    '$overflowY': 'css.overflow-y',
    '$padding': 'css.padding',
    '$paddingBottom': 'css.padding-bottom',
    '$paddingLeft': 'css.padding-left',
    '$paddingRight': 'css.padding-right',
    '$paddingTop': 'css.padding-top',
    '$pageBreakAfter': 'css.page-break-after',
    '$pageBreakBefore': 'css.page-break-before',
    '$pageBreakInside': 'css.page-break-inside',
    '$perspective': 'css.perspective',
    '$perspectiveOrigin': 'css.perspective-origin',
    '$pointerEvents': 'css.pointer-events',
    '$position': 'css.position',
    '$quotes': 'css.quotes',
    '$resize': 'css.resize',
    '$right': 'css.right',
    '$scrollBehavior': 'css.scroll-behavior',
    '$tabSize': 'css.tab-size',
    '$tableLayout': 'css.table-layout',
    '$textAlign': 'css.text-align',
    '$textAlignLast': 'css.text-align-last',
    '$textCombineUpright': 'css.text-combine-upright',
    '$textDecoration': 'css.text-decoration',
    '$textDecorationColor': 'css.text-decoration-color',
    '$textDecorationLine': 'css.text-decoration-line',
    '$textDecorationStyle': 'css.text-decoration-style',
    '$textIndent': 'css.text-indent',
    '$textJustify': 'css.text-justify',
    '$textOrientation': 'css.text-orientation',
    '$textOverflow': 'css.text-overflow',
    '$textShadow': 'css.text-shadow',
    '$textTransform': 'css.text-transform',
    '$textUnderlinePosition': 'css.text-underline-position',
    '$top': 'css.top',
    '$transform': 'css.transform',
    '$transformOrigin': 'css.transform-origin',
    '$transformStyle': 'css.transform-style',
    '$transition': 'css.transition',
    '$transitionDelay': 'css.transition-delay',
    '$transitionDuration': 'css.transition-duration',
    '$transitionProperty': 'css.transition-property',
    '$transitionTimingFunction': 'css.transition-timing-function',
    '$unicodeBidi': 'css.unicode-bidi',
    '$userSelect': 'css.user-select',
    '$verticalAlign': 'css.vertical-align',
    '$visibility': 'css.visibility',
    '$whiteSpace': 'css.white-space',
    '$width': 'css.width',
    '$wordBreak': 'css.word-break',
    '$wordWrap': 'css.word-wrap',
    '$writingMode': 'css.writing-mode',
    '$zIndex': 'css.z-index',
    // custom specials
    '$cornerRadius': 'css.border-radius',

    // attributes
    '$abbr': 'attr.abbr',
    '$acceptCharset': 'attr.accept-charset',
    '$accessKey': 'attr.accesskey',
    '$action': 'attr.action',
    '$alink': 'attr.alink',
    '$allow': 'attr.allow',
    '$allowFullscreen': 'attr.allowfullscreen',
    '$allowPaymentRequest': 'attr.allowpaymentrequest',
    '$allowUserMedia': 'attr.allowusermedia',
    '$alt': 'attr.alt',
    '$archive': 'attr.archive',
    '$as': 'attr.as',
    '$async': 'attr.async',
    '$attrHeight': 'attr.height',
    '$attrWidth': 'attr.width',
    '$autoCapitalize': 'attr.autocapitalize',
    '$autoComplete': 'atrr.autocomplete',
    '$autoFocus': 'attr.autofocus',
    '$autoPlay': 'attr.autoplay',
    '$axis': 'attr.axis',
    '$cellPadding': 'attr.cellpadding',
    '$cellSpacing': 'attr.cellspacing',
    '$char': 'attr.char',
    '$charOff': 'attr.charoff',
    '$charset': 'attr.charset',
    '$checked': 'attr.checked',
    '$cite': 'attr.cite',
    '$classId': 'attr.classid',
    '$className': 'attr.className',
    '$clearAttr': 'attr.clear',
    '$code': 'attr.code',
    '$codeBase': 'attr.codebase',
    '$codeType': 'attr.codetype',
    '$cols': 'attr.cols',
    '$colSpan': 'attr.colspan',
    '$compact': 'attr.compact',
    '$contentEditable': 'attr.contenteditable',
    '$controls': 'attr.controls',
    '$coords': 'attr.coords',
    '$crossOrigin': 'attr.crossorigin',
    '$data': 'attr.data',
    '$datetime': 'attr.datetime',
    '$declare': 'attr.declare',
    '$decoding': 'attr.decoding',
    '$dir': 'attr.dir',
    '$dirname': 'attr.dirname',
    '$disabled': 'attr.disabled',
    '$download': 'attr.download',
    '$draggable': 'attr.draggable',
    '$enctype': 'attr.enctype',
    '$enterKeyHint': 'attr.enterkeyhint',
    '$form': 'attr.form',
    '$formAction': 'attr.formaction',
    '$formEnctype': 'attr.formenctype',
    '$formMethod': 'attr.formmethod',
    '$formNoValidate': 'attr.formnovalidate',
    '$formTarget': 'attr.formtarget',
    '$frame': 'attr.frame',
    '$frameBorder': 'attr.frameborder',
    '$headers': 'attr.headers',
    '$hidden': 'attr.hidden',
    '$high': 'attr.high',
    '$href': 'attr.href',
    '$hrefLang': 'attr.hreflang',
    '$hSpace': 'attr.hspace',
    '$id': 'attr.id',
    '$imageSizes': 'attr.imagesizes',
    '$imageSrcSet': 'attr.imagesrcset',
    '$inputMode': 'attr.inputmode',
    '$integrity': 'attr.integrity',
    '$is': 'attr.is',
    '$isMap': 'attr.ismap',
    '$itemId': 'attr.itemid',
    '$itemProp': 'attr.itemprop',
    '$itemRef': 'attr.itemref',
    '$itemScope': 'attr.itemscope',
    '$itemType': 'attr.itemtype',
    '$kind': 'attr.kind',
    '$label': 'attr.label',
    '$lang': 'attr.lang',
    '$link': 'attr.link',
    '$list': 'attr.list',
    '$longDesc': 'attr.longdesc',
    '$loop': 'attr.loop',
    '$low': 'attr.low',
    '$marginHeight': 'attr.marginheight',
    '$marginWidth': 'attr.marginwidth',
    '$max': 'attr.max',
    '$maxLength': 'attr.maxlength',
    '$media': 'attr.media',
    '$method': 'attr.method',
    '$min': 'attr.min',
    '$minLength': 'attr.minlength',
    '$multiple': 'attr.multiple',
    '$muted': 'attr.muted',
    '$attrName': 'attr.name',
    '$nonce': 'attr.nonce',
    '$noResize': 'attr.noresize',
    '$noShade': 'attr.noshade',
    '$noValidate': 'attr.novalidate',
    '$noWrap': 'attr.nowrap',
    '$object': 'attr.object',
    '$open': 'attr.open',
    '$optimum': 'attr.optimum',
    '$pattern': 'attr.pattern',
    '$ping': 'attr.ping',
    '$placeholder': 'attr.placeholder',
    '$playsInline': 'attr.playsinline',
    '$poster': 'attr.poster',
    '$preload': 'attr.preload',
    '$profile': 'attr.profile',
    '$prompt': 'attr.prompt',
    '$readOnly': 'attr.readonly',
    '$referrerPolicy': 'attr.referrerpolicy',
    '$rel': 'attr.rel',
    '$required': 'attr.required',
    '$rev': 'attr.rev',
    '$reversed': 'attr.reversed',
    '$rows': 'attr.rows',
    '$rowSpan': 'attr.rowspan',
    '$rules': 'attr.rules',
    '$sandBox': 'attr.sandbox',
    '$scope': 'attr.scope',
    '$scrolling': 'attr.scrolling',
    '$selected': 'attr.selected',
    '$shape': 'attr.shape',
    '$sizes': 'attr.sizes',
    '$slot': 'attr.slot',
    '$span': 'attr.span',
    '$spellCheck': 'attr.spellcheck',
    '$src': 'attr.src',
    '$srcDoc': 'attr.srcdoc',
    '$srcSet': 'attr.srcset',
    '$standBy': 'attr.standby',
    '$start': 'attr.start',
    '$step': 'attr.step',
    '$summary': 'attr.summary',
    '$tabIndex': 'attr.tabindex',
    '$target': 'attr.target',
    '$title': 'attr.title',
    '$translate': 'attr.translate',
    '$type': 'attr.type',
    '$typeMustMatch': 'attr.typemustmatch',
    '$useMap': 'attr.usemap',
    '$vAlign': 'attr.valign',
    '$value': 'attr.value',
    '$valueType': 'attr.valuetype',
    '$vLink': 'attr.vlink',
    '$vSpace': 'attr.vspace',
    '$wrap': 'attr.wrap',
    'className': 'attr.class',
    "attrDefault": 'attr.default',
    "attrFor": 'attr.for',

    // functional attributes
    '$globalStyle': (v) => {
      return `
        & * { ${parseNativeStyle(v)} }
      `;
    },
    '$pseudoFirstChild': (v) => {
      return `
        &::first-child { ${parseNativeStyle(v)} }
      `;
    },
    '$pseudoLastChild': (v) => {
      return `
        &::last-child { ${parseNativeStyle(v)} }
      `;
    },
    '$pseudoBefore': (v) => {
      return `
        &::before { ${parseNativeStyle(v)} }
      `;
    },
    '$pseudoAfter': (v) => {
      return `
        &::after { ${parseNativeStyle(v)} }
      `;
    },
    '$pseudoSelection': (v) => {
      return `
        & > ::selection { ${parseNativeStyle(v)} }
      `;
    },
    '$show': (v, c) => {
      if(!v) return `display: none;`;
      else return (c.$display) ? `display: ${c.$display};` : `display: block;`;
    },
    '$fontSizeRem': (v) => {
      return `font-size: ${v[0]}; font-size: (${v[0]} / ${v[1]}) * 1rem;`;
    },
    '$centerBlock': (v) => {
      if (v) return `display: block; margin-left: auto; margin-right: auto; `;
    },

    // pseudos
    '$hover': (v) => {
      if (typeof v === 'function') return v();
      let value = '';
      for (const a in v) {
        value += `${PropUtil.props['$' + a].split('.')[1]}: ${parseStyleValue(v[a])}; `; }
      return `&:hover { ${value} }`;
    },
    '$focus': (v) => {
      if (typeof v === 'function') return v();
      let value = '';
      for (const a in v) {
        value += `${PropUtil.props['$' + a].split('.')[1]}: ${parseStyleValue(v[a])}; `; }
      return `&:focus { ${value} }`;
    },
    '$active': (v) => {
      if (typeof v === 'function') return v();
      let value = '';
      for (const a in v) { value += `${PropUtil.props['$' + a].split('.')[1]}: ${v[a]}; `; }
      return `&:active { ${value} }`;
    },
    '$before': (v) => {
      let value = '';
      for (const a in v) { value += `${PropUtil.props['$' + a].split('.')[1]}: ${v[a]}; `; }
      return `&::before { ${value} }`;
    },
    '$after': (v) => {
      let value = '';
      for (const a in v) { value += `${PropUtil.props['$' + a].split('.')[1]}: ${v[a]}; `; }
      return `&::after { ${value} }`;
    },
    '$disabledCSS': (v) => {
      let value = '';
      for (const a in v) { value += `${PropUtil.props['$' + a].split('.')[1]}: ${v[a]}; `; }
      return `&::disabled { ${value} }`;
    }
  },
  excludes: [
    '$native',
    '$children',
    '$level',
    '$model',
    '$node',
    'id',
    'tagName',
    '$animation',
    'cssRules',
    'options',
    '$events',
    'root',
    'value',
    'get',
    'set',

    // states
    '$stackVertical',
    '$childVerticalSpacing',
    '$size',
    '$absPosition',
    '$absCenter',
    '$absCenterRight',
    '$absCenterLeft',
    '$absCenterTop',
    '$absCenterBottom',
    '$absTopRight',
    '$absTopLeft',
    '$absBottomRight',
    '$absBottomLeft',
    '$absCenterVertical',
    '$absCenterHorizontal',
    '$aspectRation',
    '$truncateText',
    '$relCenterHorizontal',
    '$clearFix',
    '$backgroundGradient',
    '$flexSpaceBetween',
    '$flexCenter',
    '$responsiveness',
    '$styles'
  ],
  anims: {
    '$timingFunction': 'animation-timing-function',
    '$direction': 'animation-direction',
    '$fillMode': 'animation-fill-mode',
    '$iterationCount': 'animation-iteration-count',
    '$delay': 'animation-delay',
    '$duration': 'animation-duration',
    '$name': 'animation-name',
    '$playState': 'animation-play-state'
  }
};

export { PropUtil };
