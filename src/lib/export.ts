/**
 * Export utilities for generating downloadable CSV, XLSX, and PDF files.
 * All client-side — no external dependencies required.
 */

/** Trigger browser download of a Blob */
function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/** Sanitize a CSV field value */
function csvEscape(value: string | number): string {
    const s = String(value);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

/* ── CSV Export ─────────────────── */

export function exportCSV(headers: string[], rows: (string | number)[][], filename: string) {
    const csvContent = [
        headers.map(csvEscape).join(","),
        ...rows.map(row => row.map(csvEscape).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

/* ── XLSX Export (Open XML Spreadsheet) ─────────────────── */

function escapeXml(s: string | number): string {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildXlsxXml(headers: string[], rows: (string | number)[][]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    xml += '<?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
    xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    xml += '  <Styles>\n';
    xml += '    <Style ss:ID="header"><Font ss:Bold="1" ss:Size="11"/><Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/></Style>\n';
    xml += '    <Style ss:ID="default"><Font ss:Size="11"/></Style>\n';
    xml += '  </Styles>\n';
    xml += '  <Worksheet ss:Name="Report">\n';
    xml += '    <Table>\n';

    // Header row
    xml += '      <Row>\n';
    for (const h of headers) {
        xml += `        <Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
    }
    xml += '      </Row>\n';

    // Data rows
    for (const row of rows) {
        xml += '      <Row>\n';
        for (const cell of row) {
            const isNum = typeof cell === "number" || (!isNaN(Number(cell)) && String(cell).trim() !== "");
            const type = isNum ? "Number" : "String";
            xml += `        <Cell ss:StyleID="default"><Data ss:Type="${type}">${escapeXml(cell)}</Data></Cell>\n`;
        }
        xml += '      </Row>\n';
    }

    xml += '    </Table>\n';
    xml += '  </Worksheet>\n';
    xml += '</Workbook>';
    return xml;
}

export function exportXLSX(headers: string[], rows: (string | number)[][], filename: string) {
    const xml = buildXlsxXml(headers, rows);
    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    downloadBlob(blob, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

/* ── PDF Export (print-based) ─────────────────── */

export interface PdfExportOptions {
    title?: string;
    subtitle?: string;
    generatedAt?: string;
}

export function exportPDF(headers: string[], rows: (string | number)[][], filename: string, options?: PdfExportOptions) {
    const title = options?.title ?? "Report";
    const subtitle = options?.subtitle ?? "";
    const generatedAt = options?.generatedAt ?? new Date().toLocaleString();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${escapeXml(title)}</title>
    <style>
        @page { margin: 1cm; size: A4 landscape; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1c1917; padding: 24px; }
        .header { margin-bottom: 24px; border-bottom: 2px solid #412569; padding-bottom: 16px; }
        .header h1 { font-size: 22px; font-weight: 700; color: #412569; }
        .header p { font-size: 12px; color: #78716c; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #f5f5f4; color: #44403c; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; padding: 8px 12px; text-align: left; border-bottom: 2px solid #e7e5e4; }
        td { padding: 7px 12px; border-bottom: 1px solid #e7e5e4; }
        tr:nth-child(even) td { background: #fafaf9; }
        .footer { margin-top: 24px; font-size: 10px; color: #a8a29e; text-align: right; }
        @media print { body { padding: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${escapeXml(title)}</h1>
        ${subtitle ? `<p>${escapeXml(subtitle)}</p>` : ""}
    </div>
    <table>
        <thead><tr>${headers.map(h => `<th>${escapeXml(h)}</th>`).join("")}</tr></thead>
        <tbody>${rows.map(row => `<tr>${row.map(c => `<td>${escapeXml(c)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
    <div class="footer">Generated on ${escapeXml(generatedAt)} &bull; ${rows.length} rows</div>
    <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    }
}
