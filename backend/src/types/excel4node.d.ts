declare module 'excel4node' {
  export interface Workbook {
    addWorksheet(name: string): Worksheet;
    createStyle(style: any): Style;
    write(path: string): void;
  }

  export interface Worksheet {
    cell(row: number, col: number): Cell;
    cell(row1: number, col1: number, row2: number, col2: number, merge?: boolean): Cell;
    column(col: number): Column;
  }

  export interface Cell {
    string(value: string): Cell;
    number(value: number): Cell;
    style(style: Style): Cell;
  }

  export interface Column {
    setWidth(width: number): void;
  }

  export interface Style {}

  export class Workbook implements Workbook {
    constructor();
  }
}