import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId, expenses = [] } = await req.json();

    if (!tripId) {
      return Response.json({ error: 'Trip ID required' }, { status: 400 });
    }

    // Fetch trip details
    const trips = await base44.entities.Trip.filter({ id: tripId });
    const trip = trips[0];

    if (!trip) {
      return Response.json({ error: 'Trip not found' }, { status: 404 });
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('Trip Expense Report', 20, 20);

    // Trip info
    doc.setFontSize(12);
    doc.text(`Trip: ${trip.name}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 42);

    // Summary
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    doc.setFontSize(14);
    doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 20, 55);

    // Table headers
    doc.setFontSize(10);
    let y = 70;
    doc.text('Date', 20, y);
    doc.text('Description', 50, y);
    doc.text('Category', 110, y);
    doc.text('Paid By', 145, y);
    doc.text('Amount', 180, y);

    // Expenses
    y += 10;
    doc.setFontSize(9);

    expenses.forEach((expense) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        doc.setFontSize(10);
        doc.text('Date', 20, y);
        doc.text('Description', 50, y);
        doc.text('Category', 110, y);
        doc.text('Paid By', 145, y);
        doc.text('Amount', 180, y);
        y += 10;
        doc.setFontSize(9);
      }

      const date = expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A';
      const desc = expense.description.length > 25 ? expense.description.substring(0, 22) + '...' : expense.description;
      const paidBy = expense.paid_by_name?.length > 15 ? expense.paid_by_name.substring(0, 12) + '...' : expense.paid_by_name || 'Unknown';

      doc.text(date, 20, y);
      doc.text(desc, 50, y);
      doc.text(expense.category.replace('_', ' '), 110, y);
      doc.text(paidBy, 145, y);
      doc.text(`$${expense.amount.toFixed(2)}`, 180, y);

      if (expense.split_between?.length > 0) {
        y += 5;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Split: ${expense.split_names?.join(', ') || `${expense.split_between.length} people`}`, 50, y);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
      }

      y += 10;
    });

    // Category breakdown
    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    if (y > 240) {
      doc.addPage();
      y = 20;
    } else {
      y += 10;
    }

    doc.setFontSize(12);
    doc.text('Category Breakdown', 20, y);
    y += 10;
    doc.setFontSize(10);

    Object.entries(categoryTotals).forEach(([category, total]) => {
      doc.text(`${category.replace('_', ' ')}: $${total.toFixed(2)}`, 20, y);
      y += 7;
    });

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=trip-expenses.pdf'
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});