import React from "react";
import DataGrid, { Column, DataGridTypes } from "devextreme-react/data-grid";

interface CommonDataGridProps {
  dataSource: unknown[];
  storageKey?: string;
  onExporting?: (e: DataGridTypes.ExportingEvent) => void;
  onSelectionChanged?: (e: DataGridTypes.SelectionChangedEvent) => void;
  children?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow any additional props
}

const CommonDataGrid: React.FC<CommonDataGridProps> = ({
  dataSource,
  storageKey,
  onExporting,
  onSelectionChanged,
  children,
  ...rest
}) => {
  return (
    <DataGrid
      className="dx-datagrid-borders"
      columnAutoWidth={true}
      columnChooser={{ enabled: true, title: "Zgjidh Kolonat", emptyPanelText: "Shtoni kolona këtu për ta fshehur atë" }}
      columnFixing={{
        enabled: true,
        texts: {
          fix: "Fikso",
          leftPosition: "Në të majtë",
          rightPosition: "Në të djathtë",
          stickyPosition: "Ngjit në vend",
          unfix: "Ç'fikso"
        }
      }}
      dataSource={dataSource}
      export={{ enabled: true, allowExportSelectedData: true, formats: ["xlsx", "pdf"] }}
      grouping={{
        texts: {
          groupByThisColumn: "Grupo sipas kësaj kolone",
          groupContinuedMessage: "Vazhdon nga faqja e mëparshme",
          groupContinuesMessage: "Vazhdon në faqen tjetër",
          ungroup: "Ç'grupo",
          ungroupAll: "Ç'grupo të gjitha"
        }
      }}
      groupPanel={{ visible: false, emptyPanelText: "Bëji drag një header kolone këtu për ta grupuar sipas asaj kolone" }}
      headerFilter={{ visible: true }}
      hoverStateEnabled={true}
      keyExpr="id"
      loadPanel={{ enabled: false }}
      noDataText="Nuk ka të dhëna."
      onExporting={onExporting}
      onSelectionChanged={onSelectionChanged}
      pager={{
        allowedPageSizes: [10, 25, 50, 100],
        infoText: 'Faqe {0} nga {1} ({2} rekorde)',
        showInfo: true,
        showNavigationButtons: true
      }}
      paging={{ enabled: true, pageSize: 25 }}
      rowAlternationEnabled={true}
      searchPanel={{ visible: true, highlightCaseSensitive: true, placeholder: "Kërko..." }}
      selection={{ mode: "multiple" }}
      showBorders={true}
      showColumnLines={true}
      showRowLines={true}
      sorting={{
        mode: "multiple",
        ascendingText: "Rendit në rritje",
        clearText: "Pastro klasifikimin",
        descendingText: "Rendit në zbritje"
      }}
      stateStoring={
        storageKey
          ? {
              enabled: true,
              type: "localStorage",
              storageKey: storageKey
            }
          : { enabled: false }
      }
      {...rest}
    >
      {/* Row Number Column - Always First */}
      <Column
        dataField="rowNumber"
        caption="#"
        width={60}
        allowSorting={false}
        allowFiltering={false}
        allowGrouping={false}
        dataType="number"
      />
      
      {/* Additional columns passed as children */}
      {children}
    </DataGrid>
  );
};

export default CommonDataGrid;
