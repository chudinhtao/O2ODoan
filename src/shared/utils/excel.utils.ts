import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Reusable utility for exporting data to Excel
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 * @param sheetName Name of the worksheet
 * @param headers Optional custom headers mapping { key: 'DisplayName' }
 */
export const exportToExcel = (
  data: any[],
  fileName: string,
  sheetName: string = 'Sheet1',
  headers?: Record<string, string>
) => {
  // If headers mapping is provided, transform the data
  let transformedData = data;
  if (headers) {
    transformedData = data.map(item => {
      const newItem: any = {};
      Object.keys(headers).forEach(key => {
        // Handle nested paths like 'category.name'
        const value = key.split('.').reduce((obj, k) => obj?.[k], item);
        newItem[headers[key]] = value ?? '';
      });
      return newItem;
    });
  }

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(transformedData);
  
  // Auto-size columns
  if (transformedData.length > 0) {
    const keys = Object.keys(transformedData[0]);
    const colWidths = keys.map(key => {
      const maxLength = transformedData.reduce((max, row) => {
        const val = row[key] !== undefined && row[key] !== null ? String(row[key]) : '';
        // If it's a date or currency, it might be formatted. Give some extra padding.
        return Math.max(max, val.length);
      }, key.length);
      return { wch: Math.max(maxLength + 3, 10) };
    });
    worksheet['!cols'] = colWidths;
  }
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  // Save file
  saveAs(blob, `${fileName}_${new Date().getTime()}.xlsx`);
};
