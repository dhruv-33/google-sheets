import React from "react";
import { useState, useEffect, useRef } from "react";

interface CellProps {
    value: string;
    formula?: string;
    bold: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    align?: "left" | "center" | "right";
    textColor?: string;
    backgroundColor?: string;
    isSelected: boolean;
    onChange: (value: string) => void;
    onSelect: () => void;
}

const Cell: React.FC<CellProps> = ({
    value, formula, bold, italic, strikethrough, align, textColor, backgroundColor, isSelected, onChange, onSelect
}) => {
    const style = {
        fontWeight: bold ? 'bold' : 'normal',
        fontStyle: italic ? 'italic' : 'normal',
        textDecoration: strikethrough ? 'line-through' : 'none',
        textAlign: align || 'left',
        color: textColor || undefined,
        backgroundColor: backgroundColor || undefined,
        padding: "2px",
        borderColor: isSelected
            ? undefined // handled by className for theme
            : undefined,
        borderWidth: undefined,
        borderStyle: undefined,
        borderRadius: 4,
        transition: 'border-color 0.2s',
    };

    const inputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    // When entering edit mode, show formula if present
    useEffect(() => {
        if (isEditing) {
            if (formula && formula.startsWith("=")) {
                setEditValue(formula);
            } else {
                setEditValue(value);
            }
        } else {
            setEditValue(value);
        }
    }, [isEditing, value, formula]);

    // Focus the input on double click
    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleClick = () => {
        onSelect();
        setIsEditing(false);
    };

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    };

    const commitChange = () => {
        if (editValue !== value) {
            onChange(editValue);
        }
        setIsEditing(false);
    };

    const handleBlur = () => {
        commitChange();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            commitChange();
        } else if (e.key === 'Escape') {
            setEditValue(value);
            setIsEditing(false);
        }
    };

    return (
        <input
            ref={inputRef}
            className={
                "w-full h-8 px-0.5 focus:outline-none shadow-sm " +
                (isSelected
                    ? "border-2 border-blue-600 dark:border-blue-400"
                    : "border border-gray-300 dark:border-neutral-700") +
                " bg-white dark:bg-neutral-900 text-black dark:text-white transition-colors"
            }
            style={style}
            value={isEditing ? editValue : value}
            onChange={handleChange}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            readOnly={!isEditing}
        />
    );
};

export default React.memo(Cell);
