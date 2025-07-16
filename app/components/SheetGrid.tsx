'use client'
import React, { useEffect, useState } from "react";
import Cell from "./Cell";
import Toolbar from "./Toolbar";
import { evaluateFormula } from "../utils/formulaUtils";
import { X, Plus } from "lucide-react";

const ROWS = 500;
const COLS = 26;

const getColumnName = (index: number) => {
    let name = "";
    while (index >= 0) {
        name = String.fromCharCode((index % 26) + 65) + name;
        index = Math.floor(index / 26) - 1;
    }
    return name;
};

export type CellFormat = {
    value: string;
    formula?: string;
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    align?: "left" | "center" | "right";
    textColor?: string;
    backgroundColor?: string;
};

export type SheetData = { [cell: string]: CellFormat };

const recalculateFormulas = (sheetData: SheetData) => {
    const updated: SheetData = { ...sheetData };
    for (const key in updated) {
        const formula = updated[key].formula;
        if (formula?.startsWith("=")) {
            updated[key].value = evaluateFormula(formula.slice(1), updated);
        }
    }
    return updated;
};

const SheetGrid: React.FC = () => {
    const [sheets, setSheets] = useState<string[]>(["Sheet1"]);
    const [activeSheet, setActiveSheet] = useState<string>("Sheet1");
    const [data, setData] = useState<{ [sheet: string]: SheetData }>({ Sheet1: {} });
    const [selectedCell, setSelectedCell] = useState<string | null>("A1");
    const [undoStack, setUndoStack] = useState<{ [sheet: string]: SheetData[] }>({ Sheet1: [] });
    const [redoStack, setRedoStack] = useState<{ [sheet: string]: SheetData[] }>({ Sheet1: [] });
    const [formula, setFormula] = useState<string>("");
    const [zoom, setZoom] = useState(1);

    const selectedCol = selectedCell ? selectedCell.match(/[A-Z]+/)?.[0] : "";
    const selectedRow = selectedCell ? parseInt(selectedCell.match(/\d+/)?.[0] || "0") : 0;

    const [rowCounts, setRowCounts] = useState<{ [sheet: string]: number }>({ Sheet1: ROWS });
    const [colCounts, setColCounts] = useState<{ [sheet: string]: number }>({ Sheet1: COLS });

    const rowCount = rowCounts[activeSheet] || ROWS;
    const colCount = colCounts[activeSheet] || COLS;

    const addRow = () => {
        setRowCounts((prev) => ({
            ...prev,
            [activeSheet]: (prev[activeSheet] || ROWS) + 50,
        }));
    };

    const addColumn = () => {
        setColCounts((prev) => ({
            ...prev,
            [activeSheet]: (prev[activeSheet] || COLS) + 50,
        }));
    };

    const removeRow = () => {
        const currentRowCount = rowCounts[activeSheet] || ROWS;
        if (currentRowCount > 1) {
            const updatedSheet = { ...data[activeSheet] };
            const targetRow = currentRowCount;
            for (let col = 0; col < (colCounts[activeSheet] || COLS); col++) {
                const key = `${getColumnName(col)}${targetRow}`;
                delete updatedSheet[key];
            }
            setData((prev) => ({ ...prev, [activeSheet]: updatedSheet }));
            setRowCounts((prev) => ({
                ...prev,
                [activeSheet]: currentRowCount - 50,
            }));
        }
    };

    const removeColumn = () => {
        const currentColCount = colCounts[activeSheet] || COLS;
        if (currentColCount > 1) {
            const targetCol = currentColCount - 1;
            const colName = getColumnName(targetCol);
            const updatedSheet = { ...data[activeSheet] };
            for (let row = 0; row < (rowCounts[activeSheet] || ROWS); row++) {
                const key = `${colName}${row + 1}`;
                delete updatedSheet[key];
            }
            setData((prev) => ({ ...prev, [activeSheet]: updatedSheet }));
            setColCounts((prev) => ({
                ...prev,
                [activeSheet]: currentColCount - 50,
            }));
        }
    };

    // Load sheets and data from localStorage
    useEffect(() => {
        const savedSheets = localStorage.getItem("sheets");
        const savedRowCounts = localStorage.getItem("row-counts");
        const savedColCounts = localStorage.getItem("col-counts");
        if (savedSheets) {
            const sheetList = JSON.parse(savedSheets);
            setSheets(sheetList);
            const loadedData: { [sheet: string]: SheetData } = {};
            const loadedUndo: { [sheet: string]: SheetData[] } = {};
            const loadedRedo: { [sheet: string]: SheetData[] } = {};
            const loadedRows = savedRowCounts ? JSON.parse(savedRowCounts) : {};
            const loadedCols = savedColCounts ? JSON.parse(savedColCounts) : {};
            sheetList.forEach((sheet: string) => {
                const savedData = localStorage.getItem(`sheet-data-${sheet}`);
                loadedData[sheet] = savedData ? JSON.parse(savedData) : {};
                loadedUndo[sheet] = [];
                loadedRedo[sheet] = [];
                if (!(sheet in loadedRows)) loadedRows[sheet] = ROWS;
                if (!(sheet in loadedCols)) loadedCols[sheet] = COLS;
            });
            setData(loadedData);
            setUndoStack(loadedUndo);
            setRedoStack(loadedRedo);
            setRowCounts(loadedRows);
            setColCounts(loadedCols);
            setActiveSheet(sheetList[0] || "Sheet1");
        }
    }, []);
    // Fix: load selected cell when activeSheet changes
    useEffect(() => {
        const savedCell = localStorage.getItem(`selected-cell-${activeSheet}`);
        if (savedCell) setSelectedCell(savedCell);

        const savedZoom = localStorage.getItem("zoom");
        if (savedZoom) setZoom(parseFloat(savedZoom));
    }, [activeSheet]);

    // Save sheets and data to localStorage
    useEffect(() => {
        localStorage.setItem("sheets", JSON.stringify(sheets));
        localStorage.setItem(`sheet-data-${activeSheet}`, JSON.stringify(data[activeSheet] || {}));
        if (selectedCell) {
            localStorage.setItem(`selected-cell-${activeSheet}`, selectedCell);
        }
        localStorage.setItem("row-counts", JSON.stringify(rowCounts));
        localStorage.setItem("col-counts", JSON.stringify(colCounts));
        localStorage.setItem("zoom", zoom.toString());
    }, [sheets, data, activeSheet, selectedCell, rowCounts, colCounts, zoom]);

    // Update formula when selected cell or active sheet changes
    useEffect(() => {
        if (selectedCell) {
            const cell = data[activeSheet]?.[selectedCell];
            setFormula(cell?.formula ?? cell?.value ?? "");
        }
    }, [selectedCell, data, activeSheet]);

    const updateCell = (updates: Partial<CellFormat>) => {
        if (!selectedCell) return;
        const newData = {
            ...data,
            [activeSheet]: {
                ...data[activeSheet],
                [selectedCell]: {
                    ...data[activeSheet]?.[selectedCell],
                    value: data[activeSheet]?.[selectedCell]?.value ?? "",
                    ...updates,
                },
            },
        };
        setUndoStack((prev) => ({
            ...prev,
            [activeSheet]: [...(prev[activeSheet] || []), data[activeSheet]],
        }));
        setRedoStack((prev) => ({ ...prev, [activeSheet]: [] }));
        setData((prev) => ({
            ...prev,
            [activeSheet]: recalculateFormulas(newData[activeSheet]),
        }));
    };

    const handleChange = (row: number, col: number, value: string) => {
        const key = `${getColumnName(col)}${row + 1}`;
        const isFormula = value.startsWith("=");
        const newData = {
            ...data,
            [activeSheet]: {
                ...data[activeSheet],
                [key]: {
                    ...data[activeSheet]?.[key],
                    value: isFormula ? "" : value,
                    formula: isFormula ? value : undefined,
                },
            },
        };
        setUndoStack((prev) => ({
            ...prev,
            [activeSheet]: [...(prev[activeSheet] || []), data[activeSheet]],
        }));
        setRedoStack((prev) => ({ ...prev, [activeSheet]: [] }));
        setData((prev) => ({
            ...prev,
            [activeSheet]: recalculateFormulas(newData[activeSheet]),
        }));
        setSelectedCell(key);
        setFormula(value);
    };

    const toggleFormat = (key: keyof CellFormat) => updateCell({ [key]: !data[activeSheet]?.[selectedCell!]?.[key] });

    const undo = () => {
        const currentStack = undoStack[activeSheet];
        if (currentStack?.length) {
            const newUndo = [...currentStack];
            const lastState = newUndo.pop()!;
            setUndoStack(prev => ({ ...prev, [activeSheet]: newUndo }));
            setRedoStack(prev => ({ ...prev, [activeSheet]: [...(prev[activeSheet] || []), data[activeSheet]] }));
            setData(prev => ({ ...prev, [activeSheet]: lastState }));
        }
    };

    const redo = () => {
        const currentStack = redoStack[activeSheet];
        if (currentStack?.length) {
            const newRedo = [...currentStack];
            const lastState = newRedo.pop()!;
            setRedoStack(prev => ({ ...prev, [activeSheet]: newRedo }));
            setUndoStack(prev => ({ ...prev, [activeSheet]: [...(prev[activeSheet] || []), data[activeSheet]] }));
            setData(prev => ({ ...prev, [activeSheet]: lastState }));
        }
    };

    const downloadSheet = (type: "csv" | "json") => {
        const sheet = data[activeSheet] || {};

        if (type === "csv") {
            let csv = "";
            for (let row = 0; row < rowCount; row++) {
                const rowData: string[] = [];
                for (let col = 0; col < colCount; col++) {
                    const key = `${getColumnName(col)}${row + 1}`;
                    const cell = sheet[key];
                    let value = cell?.formula ? cell.value : cell?.value ?? "";
                    if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }
                    rowData.push(value);
                }
                csv += rowData.join(",") + "\n";
            }
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${activeSheet}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (type === "json") {
            const json = JSON.stringify(sheet, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${activeSheet}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Add a new sheet with a unique name
    const addSheet = () => {
        let i = 1;
        while (sheets.includes(`Sheet${i}`)) i++;
        const newSheetName = `Sheet${i}`;

        setSheets([...sheets, newSheetName]);
        setData((prev) => ({ ...prev, [newSheetName]: {} }));
        setUndoStack((prev) => ({ ...prev, [newSheetName]: [] }));
        setRedoStack((prev) => ({ ...prev, [newSheetName]: [] }));
        setActiveSheet(newSheetName);
        setRowCounts((prev) => ({ ...prev, [newSheetName]: ROWS }));
        setColCounts((prev) => ({ ...prev, [newSheetName]: COLS }));
        setSelectedCell("A1");
    };

    // Delete a sheet
    const deleteSheet = (sheetName: string) => {
        if (sheets.length <= 1) return; // Prevent deleting the last sheet
        const newSheets = sheets.filter((sheet) => sheet !== sheetName);
        const newData = { ...data };
        const newUndoStack = { ...undoStack };
        const newRedoStack = { ...redoStack };
        const newRowCounts = { ...rowCounts };
        const newColCounts = { ...colCounts };

        delete newData[sheetName];
        delete newUndoStack[sheetName];
        delete newRedoStack[sheetName];
        delete newRowCounts[sheetName];
        delete newColCounts[sheetName];

        setSheets(newSheets);
        setData(newData);
        setUndoStack(newUndoStack);
        setRedoStack(newRedoStack);
        setRowCounts(newRowCounts);
        setColCounts(newColCounts);

        if (activeSheet === sheetName) {
            setActiveSheet(newSheets[0]);
            setSelectedCell("A1");
        }
        localStorage.removeItem(`sheet-data-${sheetName}`);
        localStorage.removeItem(`selected-cell-${sheetName}`);
        localStorage.setItem("row-counts", JSON.stringify(newRowCounts));
        localStorage.setItem("col-counts", JSON.stringify(newColCounts));

    };

    // Switch to a different sheet
    const switchSheet = (sheetName: string) => {
        setActiveSheet(sheetName);
        setSelectedCell("A1");
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-neutral-900">
            {selectedCell && (
                <Toolbar
                    onBoldClick={() => toggleFormat("bold")}
                    onItalicClick={() => toggleFormat("italic")}
                    onStrikethroughClick={() => toggleFormat("strikethrough")}
                    onUndo={undo}
                    onRedo={redo}
                    onAlign={(align) => updateCell({ align })}
                    onTextColorChange={(color) => updateCell({ textColor: color })}
                    onBackgroundColorChange={(color) => updateCell({ backgroundColor: color })}
                    activeFormats={{
                        bold: !!data[activeSheet]?.[selectedCell]?.bold,
                        italic: !!data[activeSheet]?.[selectedCell]?.italic,
                        strikethrough: !!data[activeSheet]?.[selectedCell]?.strikethrough,
                        align: data[activeSheet]?.[selectedCell]?.align ?? "left",
                        textColor: data[activeSheet]?.[selectedCell]?.textColor,
                        backgroundColor: data[activeSheet]?.[selectedCell]?.backgroundColor,
                    }}
                    selectedCell={selectedCell}
                    formula={formula}
                    onFormulaChange={(v) =>
                        updateCell(
                            v.startsWith("=")
                                ? { formula: v, value: "" }
                                : { formula: undefined, value: v }
                        )
                    }

                    zoom={zoom}
                    onZoomChange={setZoom}
                    onDownload={downloadSheet}
                    onAddRow={addRow}
                    onAddColumn={addColumn}
                    onDeleteRow={removeRow}
                    onDeleteColumn={removeColumn}
                />
            )}

            <div className="flex-grow overflow-auto border border-gray-300 dark:border-neutral-700" style={{ zoom }}>
                <table className="min-w-max border-collapse bg-white dark:bg-neutral-900 text-black dark:text-white">
                    <thead>
                        <tr>
                            <th className="w-8 h-8 bg-gray-200 dark:bg-neutral-800"></th>
                            {Array.from({ length: colCount }).map((_, col) => (
                                <th
                                    key={col}
                                    className={`w-24 h-8 border border-gray-300 dark:border-neutral-700 text-center ${
                                        selectedCol === getColumnName(col)
                                            ? 'bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                            : 'bg-gray-200 dark:bg-neutral-800'
                                    }`}
                                >
                                    {getColumnName(col)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rowCount }).map((_, row) => (
                            <tr key={row}>
                                <td className={`w-8 h-8 border border-gray-300 dark:border-neutral-700 text-center ${
                                    selectedRow === row + 1
                                        ? 'bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                        : 'bg-gray-200 dark:bg-neutral-800'
                                }`}>{row + 1}</td>
                                {Array.from({ length: colCount }).map((_, col) => {
                                    const key = `${getColumnName(col)}${row + 1}`;
                                    const cell = data[activeSheet]?.[key];
                                    return (
                                        <td key={col} className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                                            <Cell
                                                value={cell?.formula ? cell.value : cell?.value ?? ""}
                                                formula={cell?.formula}
                                                bold={!!cell?.bold}
                                                italic={!!cell?.italic}
                                                strikethrough={!!cell?.strikethrough}
                                                align={cell?.align}
                                                textColor={cell?.textColor}
                                                backgroundColor={cell?.backgroundColor}
                                                isSelected={selectedCell === key}
                                                onChange={(value) => handleChange(row, col, value)}
                                                onSelect={() => setSelectedCell(key)}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Sheet Tabs */}
            <div className="flex items-center gap-2 p-1 w-full bg-gray-100 dark:bg-neutral-800 border-t border-gray-300 dark:border-neutral-700 sticky bottom-0 z-10">
                {sheets.map((sheet) => (
                    <div
                        key={sheet}
                        className={`px-3 py-1 rounded cursor-pointer ${
                            activeSheet === sheet
                                ? 'bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                : 'bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600'
                        }`}
                        onClick={() => switchSheet(sheet)}
                    >
                        {sheet}
                        {sheets.length > 1 && (
                            <button
                                title="Delete Sheet"
                                className="ml-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSheet(sheet);
                                }}
                            >
                                <X size={16} className="text-red-400 dark:text-red-300 hover:text-red-500 dark:hover:text-red-400 cursor-pointer rounded-full top-0.5 relative" />
                            </button>
                        )}
                    </div>
                ))}
                <button
                    title="Add Sheet"
                    className="px-2 py-2 bg-gray-200 dark:bg-neutral-700 rounded-full hover:bg-gray-300 dark:hover:bg-neutral-600 cursor-pointer"
                    onClick={addSheet}
                >
                    <Plus size={16} className="text-black dark:text-white" />
                </button>
            </div>
        </div>
    );
};

export default SheetGrid;