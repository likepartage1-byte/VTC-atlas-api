import type { PageConfig } from '../types/page-builder.types';

export const DEFAULT_CONTROL_CENTER_PAGE: PageConfig = {
  id: 'control-center-home',
  name: 'Control Center Operations Dashboard',
  device: 'desktop',
  version: 1,
  sections: [
    {
      id: 'sec-kpis',
      title: 'Operational Telemetry & System Health',
      visible: true,
      bgType: 'dark',
      columns: [
        {
          id: 'col-kpis-1',
          widthRatio: 100,
          widgets: [
            {
              id: 'w-kpi-metrics',
              type: 'kpi-metrics',
              title: 'Live Platform KPIs',
              visible: true,
              colSpan: 12,
            },
          ],
        },
      ],
    },
    {
      id: 'sec-ops-split',
      title: 'Live Fleet Tracking & Dispatch',
      visible: true,
      bgType: 'card',
      columns: [
        {
          id: 'col-ops-map',
          widthRatio: 60,
          widgets: [
            {
              id: 'w-live-map',
              type: 'live-map',
              title: 'Live Operations Map',
              visible: true,
            },
          ],
        },
        {
          id: 'col-ops-rides',
          widthRatio: 40,
          widgets: [
            {
              id: 'w-rides-table',
              type: 'rides-table',
              title: 'Active Rides Stream',
              visible: true,
            },
          ],
        },
      ],
    },
    {
      id: 'sec-monitoring',
      title: 'Fleet Compliance & Integrity',
      visible: true,
      bgType: 'transparent',
      columns: [
        {
          id: 'col-mon-drivers',
          widthRatio: 50,
          widgets: [
            {
              id: 'w-drivers-table',
              type: 'drivers-table',
              title: 'Active Drivers Overview',
              visible: true,
            },
          ],
        },
        {
          id: 'col-mon-alerts',
          widthRatio: 50,
          widgets: [
            {
              id: 'w-fraud-alerts',
              type: 'fraud-alerts',
              title: 'Realtime Fraud & Security Feed',
              visible: true,
            },
          ],
        },
      ],
    },
  ],
};
