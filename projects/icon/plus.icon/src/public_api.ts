import { SVG_ICONS, SvgIconInfoProvider, SvgIconInfo } from '@ngld/icon';

export const PLUS_ICON_INFO: SvgIconInfo = {
  name: 'plus_node',
  svgSource: `<svg version="1.1" viewBox="0 0 1024 1024" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
  <path d="M512 0a512 512 0 1 0 512 512A512 512 0 0 0 512 0z m0 938.666667a426.666667 426.666667 0 1 1 426.666667-426.666667 426.666667 426.666667 0 0 1-426.666667 426.666667z" p-id="1139">
  </path>
  <path d="M725.333333 462.933333h-162.56V298.666667a42.666667 42.666667 0 1 0-85.333333 0v162.986666H300.8a42.666667 42.666667 0 1 0 0 85.333334h176.64V725.333333a42.666667 42.666667 0 0 0 85.333333 0v-177.066666H725.333333a42.666667 42.666667 0 0 0 0-85.333334z" p-id="1140"></path>
  </svg>`,
};

export const PLUS_ICON_PROVIDER: SvgIconInfoProvider = {
  provide: SVG_ICONS,
  useValue: PLUS_ICON_INFO,
  multi: true,
};
