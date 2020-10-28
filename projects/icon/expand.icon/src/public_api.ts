import { SVG_ICONS, SvgIconInfoProvider, SvgIconInfo } from '@ngld/icon';

export const EXPAND_ICON_INFO: SvgIconInfo = {
  name: 'expand_node',
  svgSource: `<svg>
      <defs>
        <style>.a{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}</style>
      </defs>
      <title>Expand / Collapse</title>
      <line class="a" x1="16.151" y1="7.848" x2="19.411" y2="4.588"></line>
      <line class="a" x1="16.794" y1="12.292" x2="19.079" y2="14.577"></line>
      <line class="a" x1="13.5" y1="14.248" x2="13.5" y2="18.748"></line>
      <line class="a" x1="10.851" y1="13.147" x2="4.59" y2="19.408"></line>
      <line class="a" x1="10.001" y1="9.149" x2="5.61" y2="6.514"></line>
    </svg>`,
};

export const EXPAND_ICON_PROVIDER: SvgIconInfoProvider = {
  provide: SVG_ICONS,
  useValue: EXPAND_ICON_INFO,
  multi: true,
};
