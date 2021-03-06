import { SVG_ICONS, SvgIconInfoProvider, SvgIconInfo } from '@ngld/icon';

export const UNLOCK_ICON_INFO: SvgIconInfo = {
  name: 'unlock_node',
  svgSource: `<svg>
      <defs>
        <style>.a{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}</style>
      </defs>
      <title>Unlock</title>
      <path class="a" d="M.75,9.75V6a5.25,5.25,0,0,1,10.5,0V9.75"></path>
      <rect class="a" x="6.75" y="9.75" width="16.5" height="13.5" rx="1.5" ry="1.5"></rect>
      <line class="a" x1="15" y1="15" x2="15" y2="18"></line>
    </svg>`,
};

export const UNLOCK_ICON_PROVIDER: SvgIconInfoProvider = {
  provide: SVG_ICONS,
  useValue: UNLOCK_ICON_INFO,
  multi: true,
};
