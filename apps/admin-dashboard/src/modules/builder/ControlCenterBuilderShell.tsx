import React, { useState, useCallback } from 'react';
import type {
  PageConfig,
  SelectedElementRef,
  DeviceType,
  WidgetType,
  SectionConfig,
  WidgetConfig,
} from './types/page-builder.types';
import { DEFAULT_CONTROL_CENTER_PAGE } from './defaults/default-page-config';
import { BuilderToolbar } from './components/BuilderToolbar';
import { ElementsSidebar } from './components/ElementsSidebar';
import { BuilderCanvas } from './components/BuilderCanvas';
import { InspectorSidebar } from './components/InspectorSidebar';

interface ControlCenterBuilderShellProps {
  lang: string;
}

export const ControlCenterBuilderShell: React.FC<ControlCenterBuilderShellProps> = ({ lang }) => {
  const isAr = lang === 'AR';
  const [page, setPage] = useState<PageConfig>(DEFAULT_CONTROL_CENTER_PAGE);
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [selected, setSelected] = useState<SelectedElementRef | null>({
    type: 'section',
    sectionId: 'sec-kpis',
  });

  // Section Management
  const handleUpdateSection = useCallback(
    (sectionId: string, updater: (s: SectionConfig) => SectionConfig) => {
      setPage((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => (sec.id === sectionId ? updater(sec) : sec)),
      }));
    },
    []
  );

  const handleDeleteSection = useCallback((sectionId: string) => {
    setPage((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
    setSelected(null);
  }, []);

  const handleAddSection = useCallback(() => {
    const newSectionId = `sec-${Date.now()}`;
    const newSection: SectionConfig = {
      id: newSectionId,
      title: 'New Control Center Section',
      visible: true,
      bgType: 'card',
      columns: [
        {
          id: `col-${Date.now()}-1`,
          widthRatio: 100,
          widgets: [],
        },
      ],
    };

    setPage((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));

    setSelected({ type: 'section', sectionId: newSectionId });
  }, []);

  // Widget Management
  const handleAddWidget = useCallback(
    (type: WidgetType) => {
      const newWidgetId = `w-${type}-${Date.now()}`;
      const newWidget: WidgetConfig = {
        id: newWidgetId,
        type,
        title: `Custom ${type}`,
        visible: true,
      };

      setPage((prev) => {
        if (prev.sections.length === 0) return prev;
        const targetSection = prev.sections[prev.sections.length - 1];
        const targetColumn = targetSection.columns[0];

        const updatedSections = prev.sections.map((sec) => {
          if (sec.id !== targetSection.id) return sec;
          return {
            ...sec,
            columns: sec.columns.map((col) => {
              if (col.id !== targetColumn.id) return col;
              return {
                ...col,
                widgets: [...col.widgets, newWidget],
              };
            }),
          };
        });

        return { ...prev, sections: updatedSections };
      });

      if (page.sections.length > 0) {
        const lastSection = page.sections[page.sections.length - 1];
        setSelected({
          type: 'widget',
          sectionId: lastSection.id,
          columnId: lastSection.columns[0].id,
          widgetId: newWidgetId,
        });
      }
    },
    [page.sections]
  );

  const handleUpdateWidget = useCallback(
    (sectionId: string, widgetId: string, updater: (w: WidgetConfig) => WidgetConfig) => {
      setPage((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;
          return {
            ...sec,
            columns: sec.columns.map((col) => ({
              ...col,
              widgets: col.widgets.map((w) => (w.id === widgetId ? updater(w) : w)),
            })),
          };
        }),
      }));
    },
    []
  );

  const handleDeleteWidget = useCallback((sectionId: string, widgetId: string) => {
    setPage((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          columns: sec.columns.map((col) => ({
            ...col,
            widgets: col.widgets.filter((w) => w.id !== widgetId),
          })),
        };
      }),
    }));
    setSelected(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden font-sans">
      {/* Top Toolbar */}
      <BuilderToolbar
        device={device}
        onChangeDevice={setDevice}
        pageName={page.name}
        isAr={isAr}
      />

      {/* Builder Workspace: Left Elements Sidebar, Center Canvas, Right Inspector */}
      <div className="flex-1 flex overflow-hidden">
        <ElementsSidebar
          onAddWidget={handleAddWidget}
          onAddSection={handleAddSection}
          isAr={isAr}
        />

        <BuilderCanvas
          page={{ ...page, device }}
          selected={selected}
          onSelect={setSelected}
        />

        <InspectorSidebar
          page={page}
          selected={selected}
          onUpdateSection={handleUpdateSection}
          onUpdateWidget={handleUpdateWidget}
          onDeleteSection={handleDeleteSection}
          onDeleteWidget={handleDeleteWidget}
          isAr={isAr}
        />
      </div>
    </div>
  );
};
