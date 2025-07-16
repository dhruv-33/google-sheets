# 🧮 Google Sheets Clone
A fully interactive, web-based spreadsheet application inspired by Google Sheets, built with Next.js, React, and Tailwind CSS. This clone replicates core spreadsheet functionality including multi-sheet support, formula evaluation, and rich cell formatting—all running in the browser with persistent state.

## 🧱 Tech Stack

- Next.js – React Framework (App Router)
- Tailwind CSS – Utility-first styling
- Local state – State management
- localStorage – Data persistence

## ✅ Features

1. Multiple sheets (add, switch between sheets)
2. Spreadsheet grid with resizable rows and columns
3. Cell formatting:  Undo/redo, bold, italic, strikethrough, text alignment, Zoom in/out on the grid and Text and background color for cells
4. Formula bar with support for basic functions: `SUM`, `AVERAGE`, `COUNT`, `MAX`, `MIN`
5. Download sheet data as CSV or JSON
6. Data persistence using localStorage
7. Theme Toggle : Switch between Light and Dark themes.

## ⚙️ Setup Instructions

1. Clone the repo
```bash
git clone https://github.com/dhruv-33/google-sheets.git
cd google-sheets
```

2. Install Dependencies

```bash
npm install
# or
yarn install
```

3. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

- Open [http://localhost:3000](http://localhost:3000) in your browser to use the spreadsheet.

## 🖼️ Screenshots

### 1. Main UI
- Main UI :
![Main UI](public/Images/Light_Layout.png)
![Main UI](public/Images/Dark_Layout.png)

### 2. Cell Formats
- Cell Formats :
![Cell Formats](public/Images/Cell_Formats.png)

### 3. Functions :
- Sum Function :
![Sum Function](public/Images/Sum_Func.png)

- Average Function :
![Average Function](public/Images/Average_Func.png)

- Count Function :
![Count Function](public/Images/Count_Func.png)

- Max Function :
![Max Function](public/Images/Max_Func.png)

- Min Function :
![Min Function](public/Images/Min_Func.png)

- Download Function :
![Download Function](public/Images/Download.png)

### 4. Multiple Sheets
- Multiple Sheets :
![Multiple Sheeta](public/Images/Multiple_Sheets.png)

### 5. Save Content
- Save Content in Localstorage : 
![Save Content](public/Images/Local_Storage.png)

### 6. Theme
- Dark Theme :
![Dark Theme](public/Images/Dark_Mode.png)

- Light Theme :
![Light Theme](public/Images/Light_Mode.png)

## 🙌 Contributions
- Feel free to fork the repo, raise issues, and submit pull requests.

## 🧑‍💻 Usage Tips
- Click any cell to edit its value or formula.
- Use the formula bar to type formulas (e.g., =SUM(B2:B6)).
- Format selected cells using the toolbar.
- Add/remove rows, columns, or entire sheets with ease.
- Export your sheet as .csv or .json.

## 📜 License

This project is for learning and demonstration purposes only.

🚀 Happy Coding! 🎉
