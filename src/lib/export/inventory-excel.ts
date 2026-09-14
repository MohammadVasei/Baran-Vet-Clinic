import type { Cell, Worksheet, Workbook } from 'exceljs';
import { toJalaali } from 'jalaali-js';
import { CATEGORY_LABELS, getStockLabel } from '@/lib/products';
import { formatJalaliDate } from '@/lib/animals';

export interface ExportStockRow {
  product_id: string;
  quantity_on_hand: number;
  low_stock_threshold: number;
  updated_at: string;
  products: { name: string; price_rial: number; category: string | null; is_active: boolean } | null;
}

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

const FONT = 'Vazirmatn';

const COLORS = {
  primary: 'FF0091EA',
  primaryDark: 'FF0073C2',
  onPrimary: 'FFFFFFFF',
  gold: 'FFEFAE4B',
  mint: 'FFEAF7F2',
  softBlue: 'FFD6EAF8',
  text: 'FF1B2A4A',
  muted: 'FF5D6D7E',
  border: 'FFD0E3F0',
  white: 'FFFFFFFF',
  okFill: 'FFDCFCE7',
  okText: 'FF15803D',
  lowFill: 'FFFEF9C3',
  lowText: 'FFA16207',
  outFill: 'FFFEE2E2',
  outText: 'FFB91C1C',
};

const STATUS_STYLE: Record<StockStatus, { fill: string; text: string }> = {
  in_stock: { fill: COLORS.okFill, text: COLORS.okText },
  low_stock: { fill: COLORS.lowFill, text: COLORS.lowText },
  out_of_stock: { fill: COLORS.outFill, text: COLORS.outText },
};

const PAGE_SETUP = {
  paperSize: 9,
  orientation: 'landscape' as const,
  fitToPage: true,
  fitToWidth: 1,
  fitToHeight: 0,
  margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
};

interface CellStyleOptions {
  bold?: boolean;
  size?: number;
  color?: string;
  fill?: string;
  align?: 'left' | 'center' | 'right';
  border?: boolean;
  numFmt?: string;
}

interface CellSpec {
  value: string | number | boolean | null;
  options?: CellStyleOptions;
}

function getStatus(row: ExportStockRow): StockStatus {
  const { quantity_on_hand: qty, low_stock_threshold: threshold } = row;
  if (qty === 0) return 'out_of_stock';
  if (qty <= threshold) return 'low_stock';
  return 'in_stock';
}

function columnIndex(letters: string): number {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

function cellRange(ws: Worksheet, from: string, to: string): Cell[] {
  const cells: Cell[] = [];
  const re = /^([A-Z]+)(\d+)$/;
  const a = re.exec(from)!;
  const b = re.exec(to)!;
  const colMin = columnIndex(a[1]);
  const colMax = columnIndex(b[1]);
  const rowMin = Number(a[2]);
  const rowMax = Number(b[2]);
  for (let r = rowMin; r <= rowMax; r++) {
    for (let c = colMin; c <= colMax; c++) {
      cells.push(ws.getCell(r, c));
    }
  }
  return cells;
}

function styleCell(cell: Cell, options: CellStyleOptions = {}, borderColor: string = COLORS.border) {
  const { bold = false, size = 11, color = COLORS.text, fill, align = 'center', border = true, numFmt } = options;
  cell.font = { name: FONT, size, bold, color: { argb: color } };
  cell.alignment = { vertical: 'middle', horizontal: align };
  if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
  if (numFmt) cell.numFmt = numFmt;
  if (border) {
    cell.border = {
      top: { style: 'thin', color: { argb: borderColor } },
      left: { style: 'thin', color: { argb: borderColor } },
      bottom: { style: 'thin', color: { argb: borderColor } },
      right: { style: 'thin', color: { argb: borderColor } },
    };
  }
}

function addBrandBand(ws: Worksheet, title: string, meta: string, lastLetter: string, logoId?: number) {
  ws.mergeCells(`B1:${lastLetter}1`);
  const titleCell = ws.getCell('B1');
  titleCell.value = title;
  styleCell(titleCell, { bold: true, size: 16, color: COLORS.onPrimary, align: 'center' });
  ws.getRow(1).height = 36;
  cellRange(ws, 'B1', `${lastLetter}1`).forEach((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
    c.font = { name: FONT, size: 16, bold: true, color: { argb: COLORS.onPrimary } };
    c.border = { bottom: { style: 'medium', color: { argb: COLORS.gold } } };
  });
  if (logoId) {
    ws.addImage(logoId, { tl: { col: 0, row: 0 }, ext: { width: 40, height: 40 } });
  }

  ws.mergeCells(`B2:${lastLetter}2`);
  const metaCell = ws.getCell('B2');
  metaCell.value = meta;
  styleCell(metaCell, { size: 10, color: COLORS.primaryDark, align: 'center' });
  ws.getRow(2).height = 20;
  cellRange(ws, 'B2', `${lastLetter}2`).forEach((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.softBlue } };
    c.font = { name: FONT, size: 10, color: { argb: COLORS.primaryDark } };
  });

  ws.getRow(3).height = 8;
  cellRange(ws, 'A3', `${lastLetter}3`).forEach((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.white } };
  });
}

function buildInventorySheet(wb: Workbook, rows: ExportStockRow[], logoId: number | undefined, scopeLabel: string) {
  const ws = wb.addWorksheet('گزارش موجودی', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 4, topLeftCell: 'A5' }],
  });
  ws.properties.showGridLines = false;
  const lastLetter = 'J';
  ws.columns = [
    { width: 6 },
    { width: 34 },
    { width: 16 },
    { width: 11 },
    { width: 11 },
    { width: 14 },
    { width: 17 },
    { width: 19 },
    { width: 13 },
    { width: 22 },
  ];

  const now = new Date();
  addBrandBand(
    ws,
    'کلینیک دامپزشکی باران — گزارش موجودی انبار',
    `تاریخ تهیه: ${formatJalaliDate(now)} — محدوده: ${scopeLabel} — تعداد اقلام: ${rows.length}`,
    lastLetter,
    logoId,
  );

  const headerRow = 4;
  const headers = [
    'ردیف',
    'نام محصول',
    'دسته‌بندی',
    'موجودی',
    'حد کمبود',
    'وضعیت',
    'قیمت (ریال)',
    'ارزش موجودی (ریال)',
    'نمایش در سایت',
    'آخرین بروزرسانی',
  ];
  headers.forEach((h, i) => {
    const cell = ws.getCell(headerRow, i + 1);
    cell.value = h;
    styleCell(cell, { bold: true, size: 11, color: COLORS.onPrimary, fill: COLORS.primaryDark });
  });
  ws.getRow(headerRow).height = 22;

  let qtyTotal = 0;
  let valueTotal = 0;

  rows.forEach((row, idx) => {
    const r = headerRow + 1 + idx;
    const zebra = idx % 2 === 0 ? COLORS.mint : COLORS.white;
    const product = row.products;
    const status = getStatus(row);
    const price = product?.price_rial ?? 0;
    const value = row.quantity_on_hand * price;
    qtyTotal += row.quantity_on_hand;
    valueTotal += value;

    const cells: CellSpec[] = [
      { value: idx + 1 },
      { value: product?.name || '—', options: { align: 'right' } },
      { value: product?.category ? CATEGORY_LABELS[product.category] || product.category : '—' },
      { value: row.quantity_on_hand, options: { numFmt: '#,##0' } },
      { value: row.low_stock_threshold, options: { numFmt: '#,##0' } },
      {
        value: getStockLabel(status),
        options: { color: STATUS_STYLE[status].text, fill: STATUS_STYLE[status].fill, bold: true },
      },
      { value: price, options: { numFmt: '#,##0' } },
      { value: value, options: { numFmt: '#,##0', bold: true } },
      {
        value: product ? (product.is_active ? 'فعال' : 'غیرفعال') : '—',
        options: { color: product?.is_active ? COLORS.okText : COLORS.muted, bold: !!product?.is_active },
      },
      { value: row.updated_at ? formatJalaliDate(row.updated_at) : '—', options: { color: COLORS.muted } },
    ];

    cells.forEach(({ value, options }, i) => {
      const cell = ws.getCell(r, i + 1);
      cell.value = value;
      styleCell(cell, { ...options, fill: options?.fill || zebra });
    });
  });

  const lastDataRow = headerRow + rows.length;
  if (rows.length > 0) {
    ws.autoFilter = { from: 'A4', to: `${lastLetter}${lastDataRow}` };
  }

  const totalRow = lastDataRow + 2;
  ws.mergeCells(`A${totalRow}:E${totalRow}`);
  const totalLabel = ws.getCell(totalRow, 1);
  totalLabel.value = 'جمع کل';
  styleCell(totalLabel, { bold: true, size: 12, color: COLORS.white, fill: COLORS.gold, align: 'right' });
  cellRange(ws, `A${totalRow}`, `${lastLetter}${totalRow}`).forEach((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.gold } };
    c.font = { name: FONT, size: 12, bold: true, color: { argb: COLORS.white } };
    c.border = { top: { style: 'thin', color: { argb: COLORS.gold } }, bottom: { style: 'thin', color: { argb: COLORS.gold } }, left: { style: 'thin', color: { argb: COLORS.gold } }, right: { style: 'thin', color: { argb: COLORS.gold } } };
  });
  const qtyTotalCell = ws.getCell(totalRow, 4);
  qtyTotalCell.value = qtyTotal;
  styleCell(qtyTotalCell, { bold: true, color: COLORS.white, numFmt: '#,##0', border: false });
  const valueTotalCell = ws.getCell(totalRow, 8);
  valueTotalCell.value = valueTotal;
  styleCell(valueTotalCell, { bold: true, color: COLORS.white, numFmt: '#,##0', border: false });

  ws.pageSetup = PAGE_SETUP;
  return ws;
}

function buildCategorySheet(wb: Workbook, rows: ExportStockRow[], logoId: number | undefined) {
  const ws = wb.addWorksheet('خلاصه بر اساس دسته', { views: [{ rightToLeft: true }] });
  ws.properties.showGridLines = false;
  const lastLetter = 'G';
  ws.columns = [{ width: 22 }, { width: 14 }, { width: 14 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 20 }];

  const now = new Date();
  addBrandBand(
    ws,
    'کلینیک دامپزشکی باران — خلاصه موجودی بر اساس دسته‌بندی',
    `تاریخ تهیه: ${formatJalaliDate(now)} — تعداد کل اقلام: ${rows.length}`,
    lastLetter,
    logoId,
  );

  const headerRow = 4;
  const headers = ['دسته‌بندی', 'تعداد اقلام', 'مجموع موجودی', 'ناموجود', 'کم', 'موجود', 'ارزش کل (ریال)'];
  headers.forEach((h, i) => {
    const cell = ws.getCell(headerRow, i + 1);
    cell.value = h;
    styleCell(cell, { bold: true, size: 11, color: COLORS.onPrimary, fill: COLORS.primaryDark });
  });
  ws.getRow(headerRow).height = 22;

  const categoryKeys = ['food', 'medicine', 'accessories', 'grooming'];
  const groups: { label: string; rows: ExportStockRow[] }[] = categoryKeys.map((key) => ({
    label: CATEGORY_LABELS[key],
    rows: rows.filter((r) => r.products?.category === key),
  }));
  groups.push({ label: 'بدون دسته‌بندی', rows: rows.filter((r) => !r.products?.category) });

  let grandQty = 0;
  let grandValue = 0;

  groups.forEach((group, idx) => {
    const r = headerRow + 1 + idx;
    const zebra = idx % 2 === 0 ? COLORS.mint : COLORS.white;
    const outCount = group.rows.filter((row) => getStatus(row) === 'out_of_stock').length;
    const lowCount = group.rows.filter((row) => getStatus(row) === 'low_stock').length;
    const inCount = group.rows.length - outCount - lowCount;
    const totalQty = group.rows.reduce((sum, row) => sum + row.quantity_on_hand, 0);
    const totalValue = group.rows.reduce(
      (sum, row) => sum + row.quantity_on_hand * (row.products?.price_rial ?? 0),
      0,
    );
    grandQty += totalQty;
    grandValue += totalValue;

    const cells: CellSpec[] = [
      { value: group.label, options: { align: 'right', bold: true } },
      { value: group.rows.length, options: { numFmt: '#,##0' } },
      { value: totalQty, options: { numFmt: '#,##0' } },
      { value: outCount, options: { color: COLORS.outText } },
      { value: lowCount, options: { color: COLORS.lowText } },
      { value: inCount, options: { color: COLORS.okText } },
      { value: totalValue, options: { numFmt: '#,##0', bold: true } },
    ];
    cells.forEach(({ value, options }, i) => {
      const cell = ws.getCell(r, i + 1);
      cell.value = value;
      styleCell(cell, { ...options, fill: zebra });
    });
  });

  const totalRow = headerRow + 1 + groups.length + 1;
  ws.mergeCells(`A${totalRow}:C${totalRow}`);
  const totalLabel = ws.getCell(totalRow, 1);
  totalLabel.value = 'جمع کل';
  styleCell(totalLabel, { bold: true, size: 12, color: COLORS.white, fill: COLORS.gold, align: 'right' });
  cellRange(ws, `A${totalRow}`, `${lastLetter}${totalRow}`).forEach((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.gold } };
    c.font = { name: FONT, size: 12, bold: true, color: { argb: COLORS.white } };
  });
  const grandQtyCell = ws.getCell(totalRow, 3);
  grandQtyCell.value = grandQty;
  styleCell(grandQtyCell, { bold: true, color: COLORS.white, numFmt: '#,##0', border: false });
  const grandValueCell = ws.getCell(totalRow, 7);
  grandValueCell.value = grandValue;
  styleCell(grandValueCell, { bold: true, color: COLORS.white, numFmt: '#,##0', border: false });

  ws.pageSetup = PAGE_SETUP;
  return ws;
}

function buildAlertSheet(wb: Workbook, rows: ExportStockRow[], logoId: number | undefined) {
  const ws = wb.addWorksheet('هشدار موجودی', { views: [{ rightToLeft: true, state: 'frozen', ySplit: 4, topLeftCell: 'A5' }] });
  ws.properties.showGridLines = false;
  const lastLetter = 'G';
  ws.columns = [{ width: 6 }, { width: 36 }, { width: 16 }, { width: 11 }, { width: 11 }, { width: 14 }, { width: 20 }];

  const alerts = rows
    .filter((row) => getStatus(row) !== 'in_stock')
    .sort((a, b) => a.quantity_on_hand - b.quantity_on_hand);

  const now = new Date();
  addBrandBand(
    ws,
    'کلینیک دامپزشکی باران — هشدار موجودی',
    `تاریخ تهیه: ${formatJalaliDate(now)} — تعداد اقلام نیازمند بررسی: ${alerts.length}`,
    lastLetter,
    logoId,
  );

  const headerRow = 4;
  const headers = ['ردیف', 'نام محصول', 'دسته‌بندی', 'موجودی', 'حد کمبود', 'وضعیت', 'ارزش موجودی (ریال)'];
  headers.forEach((h, i) => {
    const cell = ws.getCell(headerRow, i + 1);
    cell.value = h;
    styleCell(cell, { bold: true, size: 11, color: COLORS.onPrimary, fill: COLORS.primaryDark });
  });
  ws.getRow(headerRow).height = 22;

  if (alerts.length === 0) {
    ws.mergeCells(`A5:${lastLetter}5`);
    const empty = ws.getCell(5, 1);
    empty.value = 'خوشبختانه هیچ کالایی با موجودی صفر یا کمتر از حد کمبود وجود ندارد.';
    cellRange(ws, `A5`, `${lastLetter}5`).forEach((c) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.okFill } };
      c.font = { name: FONT, size: 12, bold: true, color: { argb: COLORS.okText } };
      c.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    ws.getRow(5).height = 28;
    ws.pageSetup = PAGE_SETUP;
    return ws;
  }

  alerts.forEach((row, idx) => {
    const r = headerRow + 1 + idx;
    const status = getStatus(row);
    const style = STATUS_STYLE[status];
    const value = row.quantity_on_hand * (row.products?.price_rial ?? 0);

    const cells: CellSpec[] = [
      { value: idx + 1 },
      { value: row.products?.name || '—', options: { align: 'right', bold: true } },
      { value: row.products?.category ? CATEGORY_LABELS[row.products.category] || row.products.category : '—' },
      { value: row.quantity_on_hand, options: { numFmt: '#,##0', bold: true } },
      { value: row.low_stock_threshold, options: { numFmt: '#,##0' } },
      { value: getStockLabel(status), options: { color: style.text, bold: true } },
      { value: value, options: { numFmt: '#,##0' } },
    ];
    cells.forEach(({ value, options }, i) => {
      const cell = ws.getCell(r, i + 1);
      cell.value = value;
      styleCell(cell, { ...options, fill: style.fill });
    });
  });

  const lastDataRow = headerRow + alerts.length;
  if (alerts.length > 0) {
    ws.autoFilter = { from: 'A4', to: `${lastLetter}${lastDataRow}` };
  }

  ws.pageSetup = PAGE_SETUP;
  return ws;
}

async function fetchImageBase64(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
    }
    return btoa(binary);
  } catch {
    return null;
  }
}

function describeScope(current: number, all: number): string {
  return current >= all ? 'همه اقلام' : 'اقلام موجود در فیلتر فعلی';
}

function buildFileName(): string {
  const now = new Date();
  const { jy, jm, jd } = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const pad = (n: number) => String(n).padStart(2, '0');
  return `گزارش-موجودی-انبار-${jy}-${pad(jm)}-${pad(jd)}.xlsx`;
}

export async function exportInventoryToExcel(
  currentRows: ExportStockRow[],
  allRows: ExportStockRow[],
): Promise<void> {
  const ExcelJS = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Baran Vet Clinic';
  wb.created = new Date();

  const logoBase64 = await fetchImageBase64('/baran-logo-complete.png');
  const logoId = logoBase64 ? wb.addImage({ base64: logoBase64, extension: 'png' }) : undefined;

  buildInventorySheet(wb, currentRows, logoId, describeScope(currentRows.length, allRows.length));
  buildCategorySheet(wb, allRows, logoId);
  buildAlertSheet(wb, allRows, logoId);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = buildFileName();
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}