"use client";

import React, { useState, useEffect } from "react";
import { Column } from "devextreme-react/data-grid";
import type { ExportingEvent } from "devextreme/ui/data_grid";
import { SelectBox } from "devextreme-react/select-box";
import { DateBox } from "devextreme-react/date-box";
import { Button } from "devextreme-react/button";
import Card from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import CommonDataGrid from "@/components/ui/CommonDataGrid";
import { useNotify } from "@/contexts/NotifyContext";
import { Workbook } from "exceljs";
import saveAs from "file-saver";
import { exportDataGrid } from "devextreme/excel_exporter";

interface ActivityLog {
    id: number;
    userId: number;
    userName: string;
    action: string;
    entity: string;
    entityId: number | null;
    details: string | null;
    createdAt: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const entityOptions = [
    { value: "all", label: "Të gjitha" },
    { value: "students", label: "Studentë" },
    { value: "professors", label: "Profesorë" },
    { value: "classes", label: "Klasa" },
    { value: "subjects", label: "Lëndë" },
    { value: "lectures", label: "Ligjërata" },
    { value: "attendance", label: "Prezencat" },
    { value: "assignments", label: "Caktime" },
];

const actionOptions = [
    { value: "all", label: "Të gjitha" },
    { value: "CREATE", label: "Krijim" },
    { value: "UPDATE", label: "Modifikim" },
    { value: "DELETE", label: "Fshirje" },
];

export default function ClientComponent() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
    });

    // Filters
    const [entityFilter, setEntityFilter] = useState("all");
    const [actionFilter, setActionFilter] = useState("all");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const { showMessage } = useNotify();

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (entityFilter !== "all") params.append("entity", entityFilter);
            if (actionFilter !== "all") params.append("action", actionFilter);
            if (startDate) params.append("startDate", startDate.toISOString());
            if (endDate) params.append("endDate", endDate.toISOString());

            const response = await fetch(`/api/logs?${params.toString()}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to fetch logs");
            }

            const data = await response.json();
            setLogs(data.logs);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching logs:", error);
            showMessage(
                error instanceof Error ? error.message : "Gabim në marrjen e logs!",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit]);

    const handleApplyFilters = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchLogs();
    };

    const handleClearFilters = () => {
        setEntityFilter("all");
        setActionFilter("all");
        setStartDate(null);
        setEndDate(null);
        setPagination((prev) => ({ ...prev, page: 1 }));
        setTimeout(() => fetchLogs(), 100);
    };

    const onExporting = (e: ExportingEvent) => {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet("Activity Logs");

        exportDataGrid({
            component: e.component,
            worksheet,
            autoFilterEnabled: true,
        }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(
                    new Blob([buffer], { type: "application/octet-stream" }),
                    "Activity_Logs.xlsx"
                );
            });
        });
        e.cancel = true;
    };

    const renderDetailsCell = (data: { value: string | null }) => {
        if (!data.value) return null;

        try {
            const details = JSON.parse(data.value);
            return (
                <pre style={{ margin: 0, fontSize: "12px", whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(details, null, 2)}
                </pre>
            );
        } catch {
            return <span>{data.value}</span>;
        }
    };

    const renderActionCell = (data: { value: string }) => {
        const colorMap: Record<string, string> = {
            CREATE: "#28a745",
            UPDATE: "#ffc107",
            DELETE: "#dc3545",
        };

        return (
            <span
                style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: colorMap[data.value] || "#6c757d",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "12px",
                }}
            >
                {data.value}
            </span>
        );
    };

    const renderEntityCell = (data: { value: string }) => {
        const labelMap: Record<string, string> = {
            students: "Studentë",
            professors: "Profesorë",
            classes: "Klasa",
            subjects: "Lëndë",
            lectures: "Ligjërata",
            attendance: "Prezencat",
            assignments: "Caktime",
        };

        return <span>{labelMap[data.value] || data.value}</span>;
    };

    const renderDateCell = (data: { value: string }) => {
        return new Date(data.value).toLocaleString("sq-AL");
    };

    if (loading && logs.length === 0) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col gap-4">
            <Card title="Filtro">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Entiteti</label>
                        <SelectBox
                            dataSource={entityOptions}
                            displayExpr="label"
                            valueExpr="value"
                            value={entityFilter}
                            onValueChanged={(e) => setEntityFilter(e.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Veprimi</label>
                        <SelectBox
                            dataSource={actionOptions}
                            displayExpr="label"
                            valueExpr="value"
                            value={actionFilter}
                            onValueChanged={(e) => setActionFilter(e.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Nga Data</label>
                        <DateBox
                            value={startDate}
                            onValueChanged={(e) => setStartDate(e.value)}
                            type="date"
                            displayFormat="dd/MM/yyyy"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Deri Data</label>
                        <DateBox
                            value={endDate}
                            onValueChanged={(e) => setEndDate(e.value)}
                            type="date"
                            displayFormat="dd/MM/yyyy"
                        />
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <Button
                        text="Apliko Filtrat"
                        type="default"
                        onClick={handleApplyFilters}
                        icon="search"
                    />
                    <Button
                        text="Pastro Filtrat"
                        type="normal"
                        onClick={handleClearFilters}
                        icon="clear"
                    />
                </div>

            </Card>

            <Card title="Regjistri i Aktivitetit">
                <CommonDataGrid
                    dataSource={logs}
                    onExporting={onExporting}
                    wordWrapEnabled={true}
                    showRowNumber={false}
                >
                    <Column dataField="id" caption="ID" width={70} />
                    <Column
                        dataField="createdAt"
                        caption="Data"
                        dataType="datetime"
                        cellRender={renderDateCell}
                        width={180}
                    />
                    <Column dataField="userName" caption="Përdoruesi" width={200} />
                    <Column
                        dataField="action"
                        caption="Veprimi"
                        cellRender={renderActionCell}
                        width={120}
                    />
                    <Column
                        dataField="entity"
                        caption="Entiteti"
                        cellRender={renderEntityCell}
                        width={150}
                    />
                    <Column dataField="entityId" caption="Entity ID" width={100} />
                    <Column
                        dataField="details"
                        caption="Detajet"
                        cellRender={renderDetailsCell}
                        width={400}
                    />
                </CommonDataGrid>

                <div className="p-4 border-t flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Totali: {pagination.total} logs | Faqja {pagination.page} nga{" "}
                        {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            text="Paraprake"
                            disabled={pagination.page === 1}
                            onClick={() =>
                                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                            }
                        />
                        <Button
                            text="Tjetra"
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() =>
                                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                            }
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}
