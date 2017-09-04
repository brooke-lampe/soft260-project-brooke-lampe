/* exported transitVisualizationDefaultOptions */

/* eslint-disable no-magic-numbers */

const transitVisualizationDefaultOptions = {
  worldPadding: 12.0,
  zoomMultiplier: 0.9,
  zoomLimit: 12.0,
  selectorPadding: 4.0,
  strokeSelectorStyle: {
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    stroke: 'rgba(255, 128, 0, 0.5)',
    fill: 'none',
  },
  fillSelectorStyle: {
    strokeWidth: 0,
    stroke: 'none',
    fill: 'rgba(255, 128, 0, 0.5)',
  },
  vertexRadius: 7.0,
  vertexStyle: {
    stroke: 'rgba(0, 0, 0, 1.0)',
    strokeWidth: 3.0,
    fill: 'rgba(255, 255, 255, 1.0)',
  },
  edgePavementStyle: {
    stroke: 'rgba(96, 96, 96, 1.0)',
    strokeWidth: 11.0,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    fill: 'none',
  },
  edgeStripeStyle: {
    stroke: 'rgba(255, 240, 0, 1.0)',
    strokeWidth: 1.0,
    strokeDashArray: '3,9',
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    fill: 'none',
  },
  passengerOffset: 7.0,
  passengerRadius: 5.0,
  passengerStyle: {
    stroke: 'rgba(80, 56, 44, 0.75)',
    strokeWidth: 1.0,
    fill: 'rgba(80, 56, 44, 0.75)',
  },
  routeStripeStyle: {
    stroke: 'rgba(128, 128, 128, 0.5)', // fallback
    strokeWidth: 6.0,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    fill: 'none',
  },
  patchStyle: {stroke: 'rgba(255, 128, 0, 0.5)'},
  patchPreviewStyle: {stroke: 'rgba(255, 128, 0, 0.25)'},
  routeStyles: [
    {
      stripe: {stroke: 'rgba(255, 0, 0, 0.5)'},
      bus: {
        stroke: 'rgba(128, 0, 0, 1.0)',
        fill: 'rgba(255, 0, 0, 1.0)',
      },
    },
    {
      stripe: {stroke: 'rgba(255, 255, 0, 0.5)'},
      bus: {
        stroke: 'rgba(128, 128, 0, 1.0)',
        fill: 'rgba(255, 255, 0, 1.0)',
      },
    },
    {
      stripe: {stroke: 'rgba(0, 255, 0, 0.5)'},
      bus: {
        stroke: 'rgba(0, 128, 0, 1.0)',
        fill: 'rgba(0, 255, 0, 1.0)',
      },
    },
    {
      stripe: {stroke: 'rgba(0, 255, 255, 0.5)'},
      bus: {
        stroke: 'rgba(0, 128, 128, 1.0)',
        fill: 'rgba(0, 255, 255, 1.0)',
      },
    },
    {
      stripe: {stroke: 'rgba(0, 0, 255, 0.5)'},
      bus: {
        stroke: 'rgba(0, 0, 128, 1.0)',
        fill: 'rgba(0, 0, 255, 1.0)',
      },
    },
    {
      stripe: {stroke: 'rgba(255, 0, 255, 0.5)'},
      bus: {
        stroke: 'rgba(128, 0, 128, 1.0)',
        fill: 'rgba(255, 0, 255, 1.0)',
      },
    },
  ],
  retiredStyle: {
    stripe: {stroke: 'rgba(128, 128, 128, 0.5)'},
    bus: {
      stroke: 'rgba(64, 64, 64, 1.0)',
      fill: 'rgba(128, 128, 128, 1.0)',
    },
  },
  busOffset: 2.75,
  busLength: 38.0,
  busWidth: 15.0,
  busRounding: 4.0,
  busStyle: {
    stroke: 'rgba(128, 128, 128, 0.5)', // fallback
    strokeWidth: 1.0,
  },
  riderRadius: 2.5,
};
