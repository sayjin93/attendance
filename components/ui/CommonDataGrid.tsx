import React, { useImperativeHandle, useMemo, useRef } from "react";
import DataGrid, { Column, DataGridTypes, DataGridRef } from "devextreme-react/data-grid";

// Static config objects extracted to module level to preserve referential stability
// across re-renders. New inline objects on every render cause DevExtreme to re-apply
// options, which resets internal grid state (selection, scroll position, etc.).
const DEFAULT_COLUMN_CHOOSER = { enabled: true, title: "Zgjidh Kolonat", emptyPanelText: "Shtoni kolona këtu për ta fshehur atë" };
const COLUMN_FIXING = {
    enabled: true,
    texts: {
        fix: "Fikso",
        leftPosition: "Në të majtë",
        rightPosition: "Në të djathtë",
        stickyPosition: "Ngjit në vend",
        unfix: "Ç'fikso"
    }
};
const EXPORT_CONFIG = { enabled: true, allowExportSelectedData: true, formats: ["xlsx", "pdf"] };
const GROUPING = {
    texts: {
        groupByThisColumn: "Grupo sipas kësaj kolone",
        groupContinuedMessage: "Vazhdon nga faqja e mëparshme",
        groupContinuesMessage: "Vazhdon në faqen tjetër",
        ungroup: "Ç'grupo",
        ungroupAll: "Ç'grupo të gjitha"
    }
};
const GROUP_PANEL = { visible: false, emptyPanelText: "Bëji drag një header kolone këtu për ta grupuar sipas asaj kolone" };
const HEADER_FILTER = { visible: true };
const LOAD_PANEL = { enabled: false };
const PAGER = {
    allowedPageSizes: [10, 25, 50, 100],
    infoText: 'Faqe {0} nga {1} ({2} rekorde)',
    showInfo: true,
    showNavigationButtons: true
};
const DEFAULT_PAGING = { enabled: true, pageSize: 25 };
const SEARCH_PANEL = { visible: true, highlightCaseSensitive: true, placeholder: "Kërko..." };
const DEFAULT_SELECTION: DataGridTypes.Properties["selection"] = { mode: "multiple", showCheckBoxesMode: "onClick" };
const SORTING = {
    mode: "multiple" as const,
    ascendingText: "Rendit në rritje",
    clearText: "Pastro klasifikimin",
    descendingText: "Rendit në zbritje"
};
const STATE_STORING_DISABLED = { enabled: false };

interface CommonDataGridProps {
    dataSource: unknown[];
    storageKey?: string;
    showRowNumber?: boolean;
    keyExpr?: string;
    columnsAutoWidth?: boolean;
    wordWrapEnabled?: boolean;
    paging?: { enabled?: boolean; pageSize?: number };
    columnChooser?: { enabled: boolean; title?: string; emptyPanelText?: string };
    selection?: DataGridTypes.Properties["selection"];
    onExporting?: (e: DataGridTypes.ExportingEvent) => void;
    onSelectionChanged?: (e: DataGridTypes.SelectionChangedEvent) => void;
    children?: React.ReactNode;
}

export interface CommonDataGridHandle {
    clearSelection: () => void;
}

const CommonDataGrid = React.forwardRef<CommonDataGridHandle, CommonDataGridProps>(({
    dataSource,
    storageKey,
    showRowNumber = true,
    keyExpr = "id",
    columnsAutoWidth,
    wordWrapEnabled,
    paging,
    columnChooser,
    selection,
    onExporting,
    onSelectionChanged,
    children,
}, ref) => {
    const gridRef = useRef<DataGridRef>(null);

    useImperativeHandle(ref, () => ({
        clearSelection: () => {
            gridRef.current?.instance().clearSelection();
        },
    }));

    const pagingConfig = useMemo(
        () => (paging ? { ...DEFAULT_PAGING, ...paging } : DEFAULT_PAGING),
        [paging]
    );

    const stateStoringConfig = useMemo(
        () => storageKey ? { enabled: true, type: "localStorage" as const, storageKey } : STATE_STORING_DISABLED,
        [storageKey]
    );

    return (
        <DataGrid
            ref={gridRef}
            width="100%"
            className="dx-datagrid-borders"
            columnAutoWidth={columnsAutoWidth ?? true}
            columnChooser={columnChooser ?? DEFAULT_COLUMN_CHOOSER}
            columnFixing={COLUMN_FIXING}
            dataSource={dataSource}
            {...(onExporting && { export: EXPORT_CONFIG })}
            grouping={GROUPING}
            groupPanel={GROUP_PANEL}
            headerFilter={HEADER_FILTER}
            hoverStateEnabled={true}
            keyExpr={keyExpr}
            loadPanel={LOAD_PANEL}
            noDataText="Nuk ka të dhëna."
            onExporting={onExporting}
            onSelectionChanged={onSelectionChanged}
            pager={PAGER}
            paging={pagingConfig}
            repaintChangesOnly={true}
            rowAlternationEnabled={true}
            searchPanel={SEARCH_PANEL}
            selection={selection ?? DEFAULT_SELECTION}
            showBorders={true}
            showColumnLines={true}
            showRowLines={true}
            wordWrapEnabled={wordWrapEnabled}
            sorting={SORTING}
            stateStoring={stateStoringConfig}
        >
            {/* Row Number Column - Always First (unless showRowNumber is false) */}
            {showRowNumber && (
                <Column
                    dataField="rowNumber"
                    caption="#"
                    width={60}
                    allowSorting={false}
                    allowFiltering={false}
                    allowGrouping={false}
                    dataType="number"
                />
            )}

            {/* Additional columns passed as children */}
            {children}
        </DataGrid>
    );
});

CommonDataGrid.displayName = "CommonDataGrid";

export default CommonDataGrid;
