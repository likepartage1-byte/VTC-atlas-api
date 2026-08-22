// ─── Yalla VTC Lightweight Control Center Builder Types ─────────────────────────

export type WidgetType =
  | 'kpi-metrics'
  | 'live-map'
  | 'rides-table'
  | 'drivers-table'
  | 'financial-summary'
  | 'fraud-alerts'
  | 'support-tickets';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  colSpan?: number; // 1 to 12
  visible: boolean;
  settings?: Record<string, any>;
}

export interface ColumnConfig {
  id: string;
  widthRatio?: number; // percentage or flex ratio
  widgets: WidgetConfig[];
}

export interface SectionConfig {
  id: string;
  title?: string;
  columns: ColumnConfig[];
  visible: boolean;
  bgType?: 'card' | 'transparent' | 'dark';
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface PageConfig {
  id: string;
  name: string;
  device: DeviceType;
  sections: SectionConfig[];
  version: number;
}

export interface SelectedElementRef {
  type: 'section' | 'column' | 'widget';
  sectionId: string;
  columnId?: string;
  widgetId?: string;
}
