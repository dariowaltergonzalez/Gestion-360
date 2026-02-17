import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { priceUtils } from './priceUtils';

/**
 * Genera un PDF profesional para una orden de compra individual.
 */
export const generatePurchasePDF = (purchase) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- ENCABEZADO Y BRANDING ---
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('GESTION 360', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Sistema de Gestión Integral de Stock', 14, 28);

    // --- CUADRO DE ORDEN DE COMPRA ---
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 245);
    doc.rect(pageWidth - 75, 14, 60, 25, 'F');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('ORDEN DE COMPRA', pageWidth - 70, 22);

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246); // Color primario del proyecto
    doc.text(purchase.Codigo || 'N/A', pageWidth - 70, 32);

    // --- INFORMACIÓN DE LA OPERACIÓN ---
    doc.setFont(undefined, 'normal');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);

    let y = 50;
    doc.text(`Fecha: ${purchase.FechaCreacion?.toLocaleDateString() || new Date().toLocaleDateString()}`, 14, y);
    doc.text(`Estado: ${purchase.Estado}`, 14, y + 6);
    doc.text(`Forma de Pago: ${purchase.FormaPago || 'Efectivo'}`, 14, y + 12);

    // Columna Derecha: Datos del Proveedor
    doc.setFont(undefined, 'bold');
    doc.text('PROVEEDOR:', 120, y);
    doc.setFont(undefined, 'normal');
    doc.text(purchase.ProveedorNombre || 'Sin asignar', 120, y + 6);

    // --- TABLA DE ITEMS ---
    const tableData = purchase.Items.map(item => [
        item.Nombre,
        item.Cantidad.toString(),
        priceUtils.formatPrice(item.PrecioUnitario),
        priceUtils.formatPrice(item.Subtotal)
    ]);

    doc.autoTable({
        startY: y + 25,
        head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        columnStyles: {
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right' }
        }
    });

    // --- TOTALES ---
    let finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.text('Subtotal:', pageWidth - 70, finalY);
    doc.text(priceUtils.formatPrice(purchase.Subtotal || 0), pageWidth - 14, finalY, { align: 'right' });

    doc.text(`IVA (${purchase.IVA_Porcentaje || 21}%):`, pageWidth - 70, finalY + 6);
    doc.text(priceUtils.formatPrice(purchase.IVA || 0), pageWidth - 14, finalY + 6, { align: 'right' });

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', pageWidth - 70, finalY + 15);
    doc.setTextColor(59, 130, 246);
    doc.text(priceUtils.formatPrice(purchase.TotalConIVA || 0), pageWidth - 14, finalY + 15, { align: 'right' });

    // --- PIE DE PÁGINA ---
    if (purchase.Observaciones) {
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.setFont(undefined, 'italic');
        doc.text('Observaciones:', 14, finalY + 30);
        doc.text(purchase.Observaciones, 14, finalY + 35);
        finalY += 15;
    }

    // --- ARCHIVO ADJUNTO ---
    if (purchase.ArchivoAdjunto) {
        doc.setFontSize(8);
        doc.setTextColor(67, 97, 238); // Color azul para destacar
        doc.setFont(undefined, 'normal');
        const adjuntoY = purchase.Observaciones ? finalY + 25 : finalY + 30;
        doc.text('📎 Esta compra tiene un archivo adjunto', 14, adjuntoY);
        doc.setTextColor(120, 120, 120);
        doc.text(`Fecha de carga: ${purchase.FechaCreacion?.toLocaleDateString() || 'N/A'}`, 14, adjuntoY + 5);
    }

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont(undefined, 'normal');
    doc.text(`Documento generado por Gestión 360 - ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);

    doc.save(`Compra_${purchase.Codigo}.pdf`);
};

/**
 * Genera un reporte de múltiples compras (Resumen).
 */
export const generatePurchasesReport = (purchases, filters = {}) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Reporte de Compras y Reposiciones', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 27);

    const tableData = purchases.map(p => [
        p.FechaCreacion?.toLocaleDateString() || '',
        p.Codigo,
        p.ProveedorNombre,
        p.Estado,
        priceUtils.formatPrice(p.TotalConIVA)
    ]);

    doc.autoTable({
        startY: 35,
        head: [['Fecha', 'Código', 'Proveedor', 'Estado', 'Total']],
        body: tableData,
        headStyles: { fillColor: [71, 85, 105] } // Color Slate-600 para reportes
    });

    const totalAcumulado = purchases.reduce((acc, p) => acc + (p.TotalConIVA || 0), 0);
    let finalY = doc.lastAutoTable.finalY + 10;

    doc.setFont(undefined, 'bold');
    doc.text(`Total Acumulado items listados: ${priceUtils.formatPrice(totalAcumulado)}`, 14, finalY);

    doc.save(`Reporte_Compras_${new Date().getTime()}.pdf`);
};
