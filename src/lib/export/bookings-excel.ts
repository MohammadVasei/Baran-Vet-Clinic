import type { Cell, Worksheet, Workbook } from 'exceljs';
import { toJalaali } from 'jalaali-js';
import { formatJalaliDate } from '@/lib/animals';

export interface ExportBookingRow {
  id: string;
  reference_code: string;
  booking_date: string;
  booking_time: string;
  customer_name: string;
  customer_phone: string;
  pet_name: string | null;
  pet_type: string | null;
  status: string;
  payment_status: string;
  amount_rial: number | null;
  service_id: string;
  doctor_id: string;
  service_name?: string;
  doctor_name?: string;
  doctors?: { name: string } | null;
  services?: { name: string } | null;
}

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
};

const STATUS_META: Record<string, { label: string; fill: string; text: string }> = {
  pending: { label: 'در انتظار', fill: 'FFFEF9C3', text: 'FFA16207' },
  confirmed: { label: 'تأیید شده', fill: 'FFD6EAF8', text: 'FF0073C2' },
  completed: { label: 'انجام شده', fill: 'FFDCFCE7', text: 'FF15803D' },
  cancelled: { label: 'لغو شده', fill: 'FFFEE2E2', text: 'FFB91C1C' },
};

const PAYMENT_META: Record<string, { label: string; fill: string; text: string }> = {
  unpaid: { label: 'پرداخت نشده', fill: 'FFFEF9C3', text: 'FFA16207' },
  paid: { label: 'پرداخت شده', fill: 'FFDCFCE7', text: 'FF15803D' },
  failed: { label: 'ناموفق', fill: 'FFFEE2E2', text: 'FFB91C1C' },
  refunded: { label: 'مسترد شده', fill: 'FFF3F4F6', text: 'FF374151' },
};

const PET_TYPE_LABELS: Record<string, string> = {
  dog: 'سگ',
  cat: 'گربه',
  bird: 'پرنده',
  exotic: 'اگزوتیک',
  other: 'سایر',
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

function petTypeLabel(type: string | null): string {
  if (!type) return '—';
  return PET_TYPE_LABELS[type] || type;
}

function doctorName(row: ExportBookingRow): string {
  return row.doctors?.name || row.doctor_name || row.doctor_id || '—';
}

function serviceName(row: ExportBookingRow): string {
  return row.services?.name || row.service_name || row.service_id || '—';
}

function buildReportSheet(wb: Workbook, rows: ExportBookingRow[], logoId: number | undefined, scopeLabel: string) {
  const ws = wb.addWorksheet('گزارش نوبت‌ها', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 4, topLeftCell: 'A5' }],
  });
  ws.properties.showGridLines = false;
  const lastLetter = 'L';
  ws.columns = [
    { width: 6 },
    { width: 17 },
    { width: 10 },
    { width: 16 },
    { width: 24 },
    { width: 16 },
    { width: 12 },
    { width: 24 },
    { width: 20 },
    { width: 18 },
    { width: 16 },
    { width: 18 },
  ];

  const now = new Date();
  addBrandBand(
    ws,
    'کلینیک دامپزشکی باران — گزارش نوبت‌ها',
    `تاریخ تهیه: ${formatJalaliDate(now)} — محدوده: ${scopeLabel} — تعداد نوبت‌ها: ${rows.length}`,
    lastLetter,
    logoId,
  );

  const headerRow = 4;
  const headers = [
    'ردیف',
    'تاریخ',
    'ساعت',
    'کد پیگیری',
    'نام مشتری',
    'تلفن',
    'حیوان',
    'خدمت',
    'پزشک',
    'مبلغ (ریال)',
    'وضعیت',
    'وضعیت پرداخت',
  ];
  headers.forEach((h, i) => {
    const cell = ws.getCell(headerRow, i + 1);
    cell.value = h;
    styleCell(cell, { bold: true, size: 11, color: COLORS.onPrimary, fill: COLORS.primaryDark });
  });
  ws.getRow(headerRow).height = 22;

  let totalAmount = 0;

  rows.forEach((row, idx) => {
    const r = headerRow + 1 + idx;
    const zebra = idx % 2 === 0 ? COLORS.mint : COLORS.white;
    const status = STATUS_META[row.status] || { label: row.status, fill: COLORS.white, text: COLORS.muted };
    const payment = PAYMENT_META[row.payment_status] || { label: row.payment_status, fill: COLORS.white, text: COLORS.muted };
    totalAmount += row.amount_rial ?? 0;

    const cells: CellSpec[] = [
      { value: idx + 1 },
      { value: row.booking_date ? formatJalaliDate(row.booking_date) : '—' },
      { value: row.booking_time, options: { color: COLORS.muted } },
      { value: row.reference_code },
      { value: row.customer_name, options: { align: 'right', bold: true } },
      { value: row.customer_phone, options: { color: COLORS.muted } },
      { value: petTypeLabel(row.pet_type), options: { color: COLORS.primaryDark } },
      { value: serviceName(row) },
      { value: doctorName(row) },
      { value: row.amount_rial ?? '—', options: { numFmt: row.amount_rial != null ? '#,##0' : undefined } },
      { value: status.label, options: { color: status.text, fill: status.fill, bold: true } },
      { value: payment.label, options: { color: payment.text, fill: payment.fill, bold: true } },
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
  ws.mergeCells(`A${totalRow}:H${totalRow}`);
  const totalLabel = ws.getCell(totalRow, 1);
  totalLabel.value = `جمع کل — تعداد نوبت‌ها: ${rows.length}`;
  styleCell(totalLabel, { bold: true, size: 12, color: COLORS.white, fill: COLORS.gold, align: 'right' });
  cellRange(ws, `A${totalRow}`, `${lastLetter}${totalRow}`).forEach((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.gold } };
    c.font = { name: FONT, size: 12, bold: true, color: { argb: COLORS.white } };
  });
  const totalAmountCell = ws.getCell(totalRow, 10);
  totalAmountCell.value = totalAmount;
  styleCell(totalAmountCell, { bold: true, color: COLORS.white, numFmt: '#,##0', border: false });

  ws.pageSetup = PAGE_SETUP;
  return ws;
}

interface GroupTotals {
  count: number;
  total: number;
}

function sumGroup(rows: ExportBookingRow[], key: string): GroupTotals {
  const group = rows.filter((r) => r.status === key);
  return { count: group.length, total: group.reduce((sum, r) => sum + (r.amount_rial ?? 0), 0) };
}

function sumGroupPayment(rows: ExportBookingRow[], key: string): GroupTotals {
  const group = rows.filter((r) => r.payment_status === key);
  return { count: group.length, total: group.reduce((sum, r) => sum + (r.amount_rial ?? 0), 0) };
}

function buildSummarySheet(wb: Workbook, rows: ExportBookingRow[], logoId: number | undefined) {
  const ws = wb.addWorksheet('خلاصه نوبت‌ها', { views: [{ rightToLeft: true }] });
  ws.properties.showGridLines = false;
  const lastLetter = 'C';
  ws.columns = [{ width: 24 }, { width: 12 }, { width: 22 }];

  const now = new Date();
  addBrandBand(
    ws,
    'کلینیک دامپزشکی باران — خلاصه نوبت‌ها',
    `تاریخ تهیه: ${formatJalaliDate(now)} — تعداد کل نوبت‌ها: ${rows.length}`,
    lastLetter,
    logoId,
  );

  const section = (row: number, title: string) => {
    ws.mergeCells(`A${row}:${lastLetter}${row}`);
    const titleCell = ws.getCell(row, 1);
    titleCell.value = title;
    cellRange(ws, `A${row}`, `${lastLetter}${row}`).forEach((c) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.softBlue } };
      c.font = { name: FONT, size: 11, bold: true, color: { argb: COLORS.primaryDark } };
      c.alignment = { vertical: 'middle', horizontal: 'right' };
    });
    styleCell(titleCell, { bold: true, size: 11, color: COLORS.primaryDark, align: 'right', border: false });
    ws.getRow(row).height = 20;
  };

  const header = (row: number) => {
    const cells = ['گروه‌بندی', 'تعداد', 'مبلغ کل (ریال)'];
    cells.forEach((h, i) => {
      const cell = ws.getCell(row, i + 1);
      cell.value = h;
      styleCell(cell, { bold: true, size: 11, color: COLORS.onPrimary, fill: COLORS.primaryDark });
    });
    ws.getRow(row).height = 20;
  };

  const totalsRow = (row: number, count: number, total: number) => {
    ws.mergeCells(`A${row}:B${row}`);
    const label = ws.getCell(row, 1);
    label.value = `جمع کل — ${count} نوبت`;
    styleCell(label, { bold: true, size: 11, color: COLORS.white, fill: COLORS.gold, align: 'right' });
    cellRange(ws, `A${row}`, `${lastLetter}${row}`).forEach((c) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.gold } };
      c.font = { name: FONT, size: 11, bold: true, color: { argb: COLORS.white } };
    });
    const totalCell = ws.getCell(row, 3);
    totalCell.value = total;
    styleCell(totalCell, { bold: true, color: COLORS.white, numFmt: '#,##0', border: false });
    ws.getRow(row).height = 20;
  };

  const startRow = 4;
  section(startRow, 'بر اساس وضعیت نوبت');
  header(startRow + 1);

  const statusKeys = ['pending', 'confirmed', 'completed', 'cancelled'];
  statusKeys.forEach((key, idx) => {
    const r = startRow + 2 + idx;
    const meta = STATUS_META[key];
    const { count, total } = sumGroup(rows, key);
    const zebra = idx % 2 === 0 ? COLORS.mint : COLORS.white;
    const cells: CellSpec[] = [
      { value: meta.label, options: { align: 'right', bold: true } },
      { value: count, options: { numFmt: '#,##0' } },
      { value: total, options: { numFmt: '#,##0' } },
    ];
    cells.forEach(({ value, options }, i) => {
      const cell = ws.getCell(r, i + 1);
      cell.value = value;
      styleCell(cell, { ...options, fill: zebra });
    });
  });

  const statusTotal = startRow + 2 + statusKeys.length;
  const grandTotal = rows.reduce((sum, r) => sum + (r.amount_rial ?? 0), 0);
  totalsRow(statusTotal, sumForStatuses(rows, statusKeys), grandTotal);

  const payStart = statusTotal + 2;
  section(payStart, 'بر اساس وضعیت پرداخت');
  header(payStart + 1);

  const paymentKeys = ['unpaid', 'paid', 'failed', 'refunded'];
  paymentKeys.forEach((key, idx) => {
    const r = payStart + 2 + idx;
    const meta = PAYMENT_META[key];
    const { count, total } = sumGroupPayment(rows, key);
    const zebra = idx % 2 === 0 ? COLORS.mint : COLORS.white;
    const cells: CellSpec[] = [
      { value: meta.label, options: { align: 'right', bold: true } },
      { value: count, options: { numFmt: '#,##0' } },
      { value: total, options: { numFmt: '#,##0' } },
    ];
    cells.forEach(({ value, options }, i) => {
      const cell = ws.getCell(r, i + 1);
      cell.value = value;
      styleCell(cell, { ...options, fill: zebra });
    });
  });

  const payTotal = payStart + 2 + paymentKeys.length;
  totalsRow(payTotal, paymentKeys.reduce((sum, key) => sum + sumGroupPayment(rows, key).count, 0), grandTotal);

  ws.pageSetup = PAGE_SETUP;
  return ws;
}

function sumForStatuses(rows: ExportBookingRow[], keys: string[]): number {
  return keys.reduce((sum, key) => sum + sumGroup(rows, key).count, 0);
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
  return current >= all ? 'همه نوبت‌ها' : 'نوبت‌های موجود در فیلتر فعلی';
}

function buildFileName(): string {
  const now = new Date();
  const { jy, jm, jd } = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const pad = (n: number) => String(n).padStart(2, '0');
  return `گزارش-نوبت‌ها-${jy}-${pad(jm)}-${pad(jd)}.xlsx`;
}

export async function exportBookingsToExcel(
  currentRows: ExportBookingRow[],
  allRows: ExportBookingRow[],
): Promise<void> {
  const ExcelJS = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Baran Vet Clinic';
  wb.created = new Date();

  const logoBase64 = await fetchImageBase64('/baran-logo-complete.png');
  const logoId = logoBase64 ? wb.addImage({ base64: logoBase64, extension: 'png' }) : undefined;

  buildReportSheet(wb, currentRows, logoId, describeScope(currentRows.length, allRows.length));
  buildSummarySheet(wb, allRows, logoId);

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