import type { SheetData } from "../components/SheetGrid";

// Convert "A1" to { row: 0, col: 0 }
export function cellNameToIndices(name: string) {
    const match = name.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    const col = match[1].split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0) - 1;
    const row = parseInt(match[2]) - 1;
    return { row, col };
}

// Convert "A1:B3" to all cell keys between them
export function getCellRange(range: string): string[] {
    const [start, end] = range.split(":");
    const startIdx = cellNameToIndices(start);
    const endIdx = cellNameToIndices(end);
    if (!startIdx || !endIdx) return [];

    const cells: string[] = [];
    for (let r = startIdx.row; r <= endIdx.row; r++) {
        for (let c = startIdx.col; c <= endIdx.col; c++) {
            let name = "";
            let col = c;
            while (col >= 0) {
                name = String.fromCharCode((col % 26) + 65) + name;
                col = Math.floor(col / 26) - 1;
            }
            cells.push(`${name}${r + 1}`);
        }
    }
    return cells;
}

// Evaluate basic functions
export function evaluateFormula(rawFormula: string, data: SheetData): string {
    const formula = rawFormula.trim().toUpperCase();
    const fnMatch = formula.match(/^(SUM|AVERAGE|COUNT|MAX|MIN)\(([^)]+)\)$/);
    if (!fnMatch) return "ERR";

    const [, fn, range] = fnMatch;
    const cells = getCellRange(range);
    const values = cells
        .map(key => parseFloat(data[key]?.value || ""))
        .filter(v => !isNaN(v));

    if (values.length === 0) return "0";

    switch (fn) {
        case "SUM": return values.reduce((a, b) => a + b, 0).toString();
        case "AVERAGE": return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
        case "COUNT": return values.length.toString();
        case "MAX": return Math.max(...values).toString();
        case "MIN": return Math.min(...values).toString();
        default: return "ERR";
    }
}
