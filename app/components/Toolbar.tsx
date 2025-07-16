'use client';
import React, { JSX, useEffect, useRef, useState } from "react";
import {
    Bold, Italic, Strikethrough, Undo, Redo, AlignLeft, AlignCenter, AlignRight,
    PaintBucket, Baseline, Sigma, Download, SquarePlus, SquareMinus
} from "lucide-react";
import { Sun, Moon } from "lucide-react";

interface ToolbarProps {
    onBoldClick: () => void;
    onItalicClick?: () => void;
    onStrikethroughClick?: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onAlign: (alignment: "left" | "center" | "right") => void;
    onTextColorChange: (color: string) => void;
    onBackgroundColorChange: (color: string) => void;
    activeFormats: {
        bold: boolean;
        italic: boolean;
        strikethrough: boolean;
        align: "left" | "center" | "right";
        textColor?: string;
        backgroundColor?: string;
    };
    selectedCell: string;
    formula: string;
    onFormulaChange: (formula: string) => void;
    onFormulaCommit?: (formula: string) => void;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    onFunctionInsert?: (func: string) => void;
    onDownload?: (type: "csv" | "json") => void;
    onAddRow?: () => void;
    onAddColumn?: () => void;
    onDeleteRow?: () => void;
    onDeleteColumn?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
    onBoldClick, onItalicClick, onStrikethroughClick, onUndo, onRedo, onAlign,
    onTextColorChange, onBackgroundColorChange, activeFormats, selectedCell,
    formula, onFormulaChange, onFormulaCommit, zoom, onZoomChange, onFunctionInsert,
    onDownload, onAddRow, onAddColumn, onDeleteRow, onDeleteColumn
}) => {
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [showFunctions, setShowFunctions] = useState(false);
    const [showInsertMenu, setShowInsertMenu] = useState(false);
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("theme");
            if (saved === "light" || saved === "dark") return saved;
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return "light";
    });

    const functionRef = useRef<HTMLDivElement>(null);
    const insertRef = useRef<HTMLDivElement>(null);
    const deleteRef = useRef<HTMLDivElement>(null);

    const btnClass = (active: boolean) =>
        `rounded px-1 py-0.5 ${active ? "bg-blue-200 dark:bg-blue-500" : "hover:bg-gray-300 dark:hover:bg-neutral-700"} cursor-pointer text-black dark:text-white`;

    const createColorPicker = (
        type: "text" | "background",
        Icon: JSX.Element,
        onChange: (color: string) => void
    ) => {
        const ref = useRef<HTMLInputElement>(null);
        const isActive = !!(type === "text" ? activeFormats.textColor : activeFormats.backgroundColor);
        return (
            <div className="relative">
                <button
                    title={type === "text" ? "Text Color" : "Background Color"}
                    onClick={() => ref.current?.click()}
                    className={btnClass(isActive)}
                >
                    {Icon}
                </button>
                <input
                    ref={ref}
                    type="color"
                    className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        );
    };

    // Hide dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                !functionRef.current?.contains(target) &&
                !insertRef.current?.contains(target) &&
                !deleteRef.current?.contains(target)
            ) {
                setShowFunctions(false);
                setShowInsertMenu(false);
                setShowDeleteMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case "b": e.preventDefault(); onBoldClick(); break;
                    case "i": e.preventDefault(); onItalicClick?.(); break;
                    case "u": e.preventDefault(); onStrikethroughClick?.(); break;
                    case "z": e.preventDefault(); onUndo(); break;
                    case "y": e.preventDefault(); onRedo(); break;
                    case "l": e.preventDefault(); onAlign("left"); break;
                    case "e": e.preventDefault(); onAlign("center"); break;
                    case "r": e.preventDefault(); onAlign("right"); break;
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onBoldClick, onItalicClick, onStrikethroughClick, onUndo, onRedo, onAlign]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            document.documentElement.setAttribute("data-theme", theme);
            localStorage.setItem("theme", theme);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <div className="sticky top-0 z-10 bg-gray-100 dark:bg-neutral-800 p-2 pb-1 theme-remember">
            {/* Formatting and toolbar controls */}
            <div className="flex items-center gap-1 p-1 pl-2 bg-gray-200 dark:bg-neutral-700 h-10 rounded-full">
                <button title="Undo (Ctrl+Z)" onClick={onUndo} className={btnClass(false)}><Undo size={20} /></button>
                <button title="Redo (Ctrl+Y)" onClick={onRedo} className={btnClass(false)}><Redo size={20} /></button>

                <span>|</span>
                <select
                    value={Math.round(zoom * 100)}
                    onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
                    className="rounded px-1 py-0.5 cursor-pointer hover:bg-gray-300 dark:hover:bg-neutral-500"
                >
                    {[50, 75, 90, 100, 125, 150, 200].map(val => (
                        <option key={val} value={val}>{val}%</option>
                    ))}
                </select>

                <span>|</span>
                <button title="Bold (Ctrl+B)" onClick={onBoldClick} className={btnClass(activeFormats.bold)}><Bold size={20} /></button>
                <button title="Italic (Ctrl+I)" onClick={onItalicClick} className={btnClass(activeFormats.italic)}><Italic size={20} /></button>
                <button title="Strikethrough (Ctrl+U)" onClick={onStrikethroughClick} className={btnClass(activeFormats.strikethrough)}><Strikethrough size={20} /></button>

                <span>|</span>
                <button title="Align Left (Ctrl+L)" onClick={() => onAlign("left")} className={btnClass(activeFormats.align === "left")}><AlignLeft size={20} /></button>
                <button title="Align Center (Ctrl+E)" onClick={() => onAlign("center")} className={btnClass(activeFormats.align === "center")}><AlignCenter size={20} /></button>
                <button title="Align Right (Ctrl+R)" onClick={() => onAlign("right")} className={btnClass(activeFormats.align === "right")}><AlignRight size={20} /></button>

                <span>|</span>
                {createColorPicker("text", <Baseline size={20} />, onTextColorChange)}
                {createColorPicker("background", <PaintBucket size={20} />, onBackgroundColorChange)}

                <span>|</span>
                {/* Insert Controls */}
                <div className="relative" ref={insertRef}>
                    <button title="Add Row/Col" onClick={() => { setShowInsertMenu(!showInsertMenu); setShowFunctions(false); setShowDeleteMenu(false); }} className={btnClass(showInsertMenu)}>
                        <SquarePlus size={20} />
                    </button>
                    {showInsertMenu && (
                        <div className="absolute left-0 mt-1 w-36 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-700 rounded shadow-lg z-20">
                            <div className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-neutral-600 cursor-pointer text-black dark:text-white" onClick={() => { setShowInsertMenu(false); onAddRow?.(); }}>Add 50 Rows</div>
                            <div className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-neutral-600 cursor-pointer text-black dark:text-white" onClick={() => { setShowInsertMenu(false); onAddColumn?.(); }}>Add 50 Columns</div>
                        </div>
                    )}
                </div>

                {/* Delete Controls */}
                <div className="relative" ref={deleteRef}>
                    <button title="Delete Row/Col" onClick={() => { setShowDeleteMenu(!showDeleteMenu); setShowFunctions(false); setShowInsertMenu(false); }} className={btnClass(showDeleteMenu)}>
                        <SquareMinus size={20} />
                    </button>
                    {showDeleteMenu && (
                        <div className="absolute left-0 mt-1 w-40 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-700 rounded shadow-lg z-20">
                            <div className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-neutral-600 cursor-pointer text-black dark:text-white" onClick={() => { setShowDeleteMenu(false); onDeleteRow?.(); }}>Delete 50 Rows</div>
                            <div className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-neutral-600 cursor-pointer text-black dark:text-white" onClick={() => { setShowDeleteMenu(false); onDeleteColumn?.(); }}>Delete 50 Columns</div>
                        </div>
                    )}
                </div>
                <span>|</span>
                {/* Download Dropdown */}
                <div className="relative">
                    <button title="Download" onClick={() => setShowDownloadMenu(!showDownloadMenu)} className={btnClass(showDownloadMenu)}>
                        <Download size={20} />
                    </button>
                    {showDownloadMenu && (
                        <div className="absolute left-0 w-36 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-700 rounded shadow-lg z-20">
                            <div className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-neutral-600 text-black dark:text-white cursor-pointer" onClick={() => { setShowDownloadMenu(false); onDownload?.("csv"); }}>Download CSV</div>
                            <div className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-neutral-600 text-black dark:text-white cursor-pointer" onClick={() => { setShowDownloadMenu(false); onDownload?.("json"); }}>Download JSON</div>
                        </div>
                    )}
                </div>
                {/* Function Insert */}
                <div className="relative" ref={functionRef}>
                    <button title="Functions" onClick={() => setShowFunctions(!showFunctions)} className={btnClass(showFunctions)}>
                        <Sigma size={20} />
                    </button>
                    {showFunctions && (
                        <div className="absolute left-0 mt-1 w-36 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-700 rounded shadow-lg z-20">
                            {["SUM", "AVERAGE", "COUNT", "MAX", "MIN"].map(func => (
                                <div key={func} className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-neutral-600 cursor-pointer text-black dark:text-white" onClick={() => { setShowFunctions(false); onFunctionInsert?.(func); }}>{func}</div>
                            ))}
                        </div>
                    )}
                </div>
                <span>|</span>
                {/* Theme Toggle Button */}
                <button
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    onClick={toggleTheme}
                    className={btnClass(false)}
                >
                    {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            {/* Formula Bar */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-neutral-800 h-10 m-1">
                <div className="text-sm font-medium h-8 w-16 flex items-center justify-center bg-white dark:bg-neutral-900 dark:text-white rounded border border-gray-300 dark:border-neutral-700">
                    {selectedCell}
                </div>
                <div className="fx-label text-black dark:text-white">fx</div>
                <input
                    type="text"
                    value={formula}
                    onChange={(e) => onFormulaChange(e.target.value)}
                    onBlur={(e) => onFormulaCommit?.(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onFormulaCommit?.((e.target as HTMLInputElement).value)}
                    placeholder="Enter a formula or value"
                    className="flex-grow p-1 rounded border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white outline-none"
                />
            </div>
        </div>
    );
};

export default Toolbar;
