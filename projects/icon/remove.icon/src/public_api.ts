import { SVG_ICONS, SvgIconInfoProvider, SvgIconInfo } from '@ngld/icon';

export const REMOVE_ICON_INFO: SvgIconInfo = {
  name: 'remove_node',
  svgSource: `<svg>
  <defs>
    <style>.a{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}</style>
  </defs>
  <title>Remove</title>
  <path class="a" d="M8.153,13.664a12.271,12.271,0,0,1-5.936-4.15L1.008,7.96a.75.75,0,0,1,0-.92L2.217,5.486A12.268,12.268,0,0,1,11.9.75h0a12.269,12.269,0,0,1,9.684,4.736L22.792,7.04a.748.748,0,0,1,0,.92L21.584,9.514"></path>
  <path class="a" d="M10.4,10.937A3.749,3.749,0,1,1,15.338,9"></path>
  <circle class="a" cx="17.15" cy="17.25" r="6"></circle>
  <line class="a" x1="14.15" y1="17.25" x2="20.15" y2="17.25"></line>
</svg>`,
};

export const REMOVE_ICON_PROVIDER: SvgIconInfoProvider = {
  provide: SVG_ICONS,
  useValue: REMOVE_ICON_INFO,
  multi: true,
};
