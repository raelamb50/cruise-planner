const fs = require("fs");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
  PageBreak,
  TabStopPosition,
  TabStopType,
  convertInchesToTwip,
} = require("docx");

// ─── Load Data ───
const data = JSON.parse(fs.readFileSync("trip_data.json", "utf-8"));

// ─── Colors ───
const NAVY = "1B3A5C";
const GOLD = "9C7C38";
const LIGHT_BG = "F5F0E8";
const WHITE = "FFFFFF";
const DARK_TEXT = "2C2C2C";
const MUTED = "666666";
const RED_ALERT = "C0392B";
const GREEN = "27AE60";
const AMBER = "D4890B";

// ─── Helper: styled text run ───
function text(content, opts = {}) {
  return new TextRun({
    text: content,
    font: "Calibri",
    size: opts.size || 22,
    bold: opts.bold || false,
    italics: opts.italics || false,
    color: opts.color || DARK_TEXT,
    break: opts.break,
  });
}

// ─── Helper: section heading ───
function sectionHeading(title) {
  return new Paragraph({
    spacing: { before: 360, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 2, color: GOLD },
    },
    children: [
      text(title, { size: 30, bold: true, color: NAVY }),
    ],
  });
}

// ─── Helper: sub-heading ───
function subHeading(title) {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [
      text(title, { size: 24, bold: true, color: GOLD }),
    ],
  });
}

// ─── Helper: body paragraph ───
function bodyParagraph(content, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.spaceBefore || 60, after: opts.spaceAfter || 60 },
    children: [text(content, { size: 22, color: opts.color || DARK_TEXT, italics: opts.italics })],
  });
}

// ─── Helper: labeled line (bold label + normal value) ───
function labeledLine(label, value, opts = {}) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    children: [
      text(label + "  ", { size: 22, bold: true, color: NAVY }),
      text(value, { size: 22, color: opts.valueColor || DARK_TEXT }),
    ],
  });
}

// ─── Helper: bullet point ───
function bullet(content, opts = {}) {
  return new Paragraph({
    spacing: { before: 30, after: 30 },
    indent: { left: convertInchesToTwip(0.3) },
    children: [
      text("\u2022  ", { size: 22, bold: true, color: GOLD }),
      text(content, { size: 22, color: opts.color || DARK_TEXT, italics: opts.italics }),
    ],
  });
}

// ─── Helper: gap/alert line ───
function alertLine(severity, description) {
  const colors = { HIGH: RED_ALERT, MODERATE: AMBER, LOW: MUTED, OPTIONAL: MUTED };
  const icons = { HIGH: "\u26A0", MODERATE: "\u25B3", LOW: "\u2022", OPTIONAL: "\u25CB" };
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: convertInchesToTwip(0.3) },
    children: [
      text(`${icons[severity] || "\u2022"} [${severity}]  `, {
        size: 22,
        bold: true,
        color: colors[severity] || MUTED,
      }),
      text(description, { size: 22, color: DARK_TEXT }),
    ],
  });
}

// ─── Helper: table cell ───
function cell(content, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shading
      ? { type: ShadingType.SOLID, color: opts.shading }
      : undefined,
    children: [
      new Paragraph({
        spacing: { before: 40, after: 40 },
        alignment: opts.align || AlignmentType.LEFT,
        children: [
          text(content, {
            size: opts.size || 20,
            bold: opts.bold || false,
            color: opts.color || DARK_TEXT,
          }),
        ],
      }),
    ],
  });
}

// ─── Helper: divider line ───
function divider() {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: GOLD },
    },
    children: [text(" ", { size: 6 })],
  });
}

// ═══════════════════════════════════════════
//  BUILD THE DOCUMENT
// ═══════════════════════════════════════════

const sections = [];

// ─────────────────────────────────
//  1. COVER PAGE
// ─────────────────────────────────
const coverChildren = [
  new Paragraph({ spacing: { before: 2400 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [text(data.trip.title, { size: 52, bold: true, color: NAVY })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [text(data.trip.subtitle, { size: 28, color: GOLD })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [text(data.trip.travelers.join("  &  "), { size: 24, color: DARK_TEXT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [text(data.trip.dateRange, { size: 24, color: MUTED })],
  }),
  divider(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 80 },
    children: [text("Route", { size: 22, bold: true, color: NAVY })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [text(data.trip.route, { size: 22, color: DARK_TEXT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [
      text("Confirmation Codes:  ", { size: 20, bold: true, color: NAVY }),
      text(`Delta ${data.confirmations.delta}  |  Vueling ${data.confirmations.vueling}`, {
        size: 20,
        color: DARK_TEXT,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [
      text("Total Excursion Expenses:  ", { size: 20, bold: true, color: NAVY }),
      text(`$${data.expenses.totalExcursions.toLocaleString()}`, {
        size: 20,
        bold: true,
        color: GOLD,
      }),
    ],
  }),
];

sections.push({
  children: coverChildren,
});

// ─────────────────────────────────
//  2. REMAINING GAPS & ACTION ITEMS (up front)
// ─────────────────────────────────
const actionChildren = [sectionHeading("Remaining Gaps & Action Items")];

const priorities = ["HIGH", "MODERATE", "LOW", "OPTIONAL"];
for (const priority of priorities) {
  const items = data.actionItems.filter((a) => a.priority === priority && a.status !== "done");
  if (items.length === 0) continue;

  actionChildren.push(subHeading(`${priority} Priority`));
  for (const item of items) {
    actionChildren.push(alertLine(item.priority, item.action));
  }
}

sections.push({ children: actionChildren });

// ─────────────────────────────────
//  3. EXCURSION EXPENSE SUMMARY (up front with action items)
// ─────────────────────────────────
const expenseChildren = [sectionHeading("Excursion Expense Summary")];

const headerRow = new TableRow({
  children: [
    cell("Excursion", { bold: true, color: WHITE, shading: NAVY, width: 50 }),
    cell("Per Person", { bold: true, color: WHITE, shading: NAVY, width: 17, align: AlignmentType.RIGHT }),
    cell("Qty", { bold: true, color: WHITE, shading: NAVY, width: 8, align: AlignmentType.CENTER }),
    cell("Total", { bold: true, color: WHITE, shading: NAVY, width: 25, align: AlignmentType.RIGHT }),
  ],
});

const expenseRows = [headerRow];
for (const exp of data.expenses.excursions) {
  const sym = exp.currency === "EUR" ? "\u20AC" : "$";
  const totalDisplay = exp.currency === "EUR"
    ? `${sym}${exp.total.toLocaleString()} (~$${exp.estimatedUSD})`
    : `$${exp.total.toLocaleString()}`;
  expenseRows.push(
    new TableRow({
      children: [
        cell(exp.item, { width: 50 }),
        cell(`${sym}${exp.perPerson.toLocaleString()}`, { width: 17, align: AlignmentType.RIGHT }),
        cell(String(exp.quantity), { width: 8, align: AlignmentType.CENTER }),
        cell(totalDisplay, { width: 25, align: AlignmentType.RIGHT }),
      ],
    })
  );
}

expenseRows.push(
  new TableRow({
    children: [
      cell("TOTAL", { bold: true, color: NAVY, shading: LIGHT_BG, width: 50 }),
      cell("", { shading: LIGHT_BG, width: 17 }),
      cell("", { shading: LIGHT_BG, width: 8 }),
      cell(`$${data.expenses.totalExcursions.toLocaleString()}`, {
        bold: true,
        color: NAVY,
        shading: LIGHT_BG,
        width: 25,
        align: AlignmentType.RIGHT,
      }),
    ],
  })
);

expenseChildren.push(
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: expenseRows,
  })
);

if (data.expenses.notes) {
  expenseChildren.push(bodyParagraph(data.expenses.notes, { italics: true, color: MUTED }));
}

sections.push({ children: expenseChildren });

// ─────────────────────────────────
//  4. CHRONOLOGICAL DAY-BY-DAY TIMELINE
//  Every day March 17–30 gets one unified section.
//  Flights are embedded within the day they occur.
// ─────────────────────────────────

// Helper: render flight legs into an array of Paragraphs
function renderFlightLegs(legs) {
  const children = [];
  for (const leg of legs) {
    children.push(subHeading(`${leg.from} \u2192 ${leg.to}`));
    children.push(labeledLine("Flight:", `${leg.flight} — ${leg.aircraft}`));
    if (leg.operator) children.push(labeledLine("Operated by:", leg.operator));
    children.push(labeledLine("Class:", leg.class));
    children.push(labeledLine("Depart:", `${leg.departTime} on ${leg.departDate}`));
    children.push(labeledLine("Arrive:", `${leg.arriveTime} on ${leg.arriveDate}`));
    if (leg.seats) {
      children.push(labeledLine("Seats:", `Robert ${leg.seats.Robert}, Raelan ${leg.seats.Raelan}`));
    }
    if (leg.layoverBefore) children.push(labeledLine("Layover:", leg.layoverBefore));
    if (leg.duration) children.push(labeledLine("Duration:", leg.duration));
    if (leg.cost) children.push(labeledLine("Cost:", leg.cost));
    if (leg.baggage) children.push(labeledLine("Baggage:", leg.baggage));
  }
  return children;
}

for (const day of data.days) {
  const dayChildren = [];

  // Day header
  const headerParts = [];
  if (day.day > 0) {
    headerParts.push(`Day ${day.day}`);
  }
  if (day.label) {
    headerParts.push(day.label);
  } else if (day.port) {
    headerParts.push(day.port + (day.country ? `, ${day.country}` : ""));
  }
  if (day.type === "sea") {
    headerParts.length = 0;
    headerParts.push(`Day ${day.day}: At Sea`);
  }

  dayChildren.push(sectionHeading(headerParts.join(": ")));
  dayChildren.push(bodyParagraph(day.dateFormatted, { color: MUTED }));

  // ── Embedded flights for travel days ──
  if (day.date === "2026-03-17") {
    dayChildren.push(bodyParagraph(
      `Confirmation: ${data.confirmations.delta} (Delta) \u2014 Delta First Class, 2 passengers`,
      { color: MUTED, italics: true }
    ));
    dayChildren.push(...renderFlightLegs(data.flights.outbound));
  }
  if (day.date === "2026-03-19") {
    dayChildren.push(bodyParagraph(
      `Confirmation: ${data.confirmations.vueling} (Vueling)`,
      { color: MUTED, italics: true }
    ));
    dayChildren.push(...renderFlightLegs(data.flights.connecting));
  }
  if (day.date === "2026-03-30") {
    dayChildren.push(bodyParagraph(
      `Confirmation: ${data.confirmations.delta} (Delta) \u2014 Total duration: ${data.flights.returnTotalDuration}`,
      { color: MUTED, italics: true }
    ));
    dayChildren.push(...renderFlightLegs(data.flights.return));
  }

  // ── Port times (non-travel days) ──
  if (day.arrive) dayChildren.push(labeledLine("Arrive:", day.arrive));
  if (day.depart) dayChildren.push(labeledLine("Depart:", day.depart));
  if (day.disembarkWindow) dayChildren.push(labeledLine("Disembark:", day.disembarkWindow));
  if (day.board) dayChildren.push(labeledLine("All Aboard:", day.board));

  // ── Description ──
  if (day.description) {
    dayChildren.push(bodyParagraph(day.description));
  }

  // ── Hotel ──
  if (day.hotel) {
    dayChildren.push(labeledLine("Hotel:", `${day.hotel.name} (${day.hotel.status.toUpperCase()})`));
    if (day.hotel.checkIn) dayChildren.push(labeledLine("  Check-in:", day.hotel.checkIn));
    if (day.hotel.earlyCheckIn) dayChildren.push(bullet(day.hotel.earlyCheckIn, { italics: true }));
    if (day.hotel.luggageNote) dayChildren.push(bullet(day.hotel.luggageNote, { italics: true }));
    if (day.hotel.room) dayChildren.push(labeledLine("  Room:", day.hotel.room));
    if (day.hotel.totalCost) dayChildren.push(labeledLine("  Cost:", day.hotel.totalCost));
    if (day.hotel.includes) dayChildren.push(bullet(`Includes: ${day.hotel.includes}`, { italics: true }));
    if (day.hotel.confirmation) dayChildren.push(labeledLine("  Confirmation:", day.hotel.confirmation));
    if (day.hotel.address) dayChildren.push(labeledLine("  Address:", day.hotel.address));
    if (day.hotel.phone) dayChildren.push(labeledLine("  Phone:", day.hotel.phone));
  }

  // ── Booking status summary (port/sea/embark/disembark days) ──
  const excCount = (day.excursions || []).length;
  const dineCount = (day.dining || []).length;
  const gapCount = (day.gaps || []).filter((g) => g.severity === "HIGH").length;

  if (day.type !== "layover" && day.type !== "travel") {
    const statusParts = [];
    if (excCount > 0) statusParts.push(`${excCount} excursion(s) booked`);
    else statusParts.push("No excursions booked");
    if (dineCount > 0) statusParts.push(`${dineCount} dining reservation(s)`);
    if (gapCount > 0) statusParts.push(`${gapCount} gap(s) to address`);

    dayChildren.push(
      new Paragraph({
        spacing: { before: 100, after: 100 },
        shading: { type: ShadingType.SOLID, color: gapCount > 0 ? "FFF3E0" : "E8F5E9" },
        indent: { left: convertInchesToTwip(0.15), right: convertInchesToTwip(0.15) },
        children: [
          text("  " + statusParts.join("  |  "), {
            size: 20,
            bold: true,
            color: gapCount > 0 ? AMBER : GREEN,
          }),
        ],
      })
    );
  }

  // ── Excursions ──
  if (excCount > 0) {
    dayChildren.push(subHeading("Booked Excursions"));
    for (const exc of day.excursions) {
      dayChildren.push(labeledLine(exc.name, `(${exc.status.toUpperCase()})`));
      dayChildren.push(labeledLine("  Time:", exc.time));
      dayChildren.push(labeledLine("  Guests:", String(exc.guests)));
      if (exc.totalCost) {
        const excSym = exc.currency === "EUR" ? "\u20AC" : "$";
        const excTotalLabel = exc.currency === "EUR"
          ? `${excSym}${exc.costPerPerson.toLocaleString()} x ${exc.guests} = ${excSym}${exc.totalCost.toLocaleString()} (~$${exc.estimatedUSD} USD)`
          : `$${exc.costPerPerson.toLocaleString()} x ${exc.guests} = $${exc.totalCost.toLocaleString()}`;
        dayChildren.push(labeledLine("  Cost:", excTotalLabel));
      }
      if (exc.notes) {
        dayChildren.push(bullet(exc.notes, { italics: true }));
      }
    }
  }

  // ── Dining ──
  if (dineCount > 0) {
    dayChildren.push(subHeading("Dining"));
    for (const din of day.dining) {
      const statusLabel =
        din.status === "booked"
          ? "BOOKED"
          : din.status === "hold_pending"
          ? "HOLD PENDING"
          : din.status === "planned"
          ? "PLANNED"
          : din.status.toUpperCase();
      dayChildren.push(labeledLine(din.name, `(${statusLabel})`));
      dayChildren.push(labeledLine("  Time:", din.time));
      dayChildren.push(labeledLine("  Guests:", String(din.guests)));
      if (din.notes) {
        dayChildren.push(bullet(din.notes, { italics: true }));
      }
    }
  }

  // ── Gaps & Alerts ──
  if ((day.gaps || []).length > 0) {
    dayChildren.push(subHeading("Gaps & Alerts"));
    for (const gap of day.gaps) {
      dayChildren.push(alertLine(gap.severity, gap.description));
    }
  }

  // ── Recommendations ──
  if ((day.recommendations || []).length > 0) {
    dayChildren.push(subHeading("Recommended Experiences"));
    for (const rec of day.recommendations) {
      dayChildren.push(
        new Paragraph({
          spacing: { before: 40, after: 20 },
          indent: { left: convertInchesToTwip(0.3) },
          children: [
            text("\u2022  ", { size: 22, bold: true, color: GOLD }),
            text(rec.name, { size: 22, bold: true, color: NAVY }),
          ],
        })
      );
      dayChildren.push(
        new Paragraph({
          spacing: { before: 0, after: 60 },
          indent: { left: convertInchesToTwip(0.55) },
          children: [text(rec.description, { size: 20, color: MUTED, italics: true })],
        })
      );
    }
  }

  sections.push({ children: dayChildren });
}

// ─────────────────────────────────
//  6. Q&A: FOUR SEASONS I
// ─────────────────────────────────
const qaChildren = [sectionHeading("Q&A: Four Seasons I")];

for (const qa of data.shipInfo) {
  qaChildren.push(
    new Paragraph({
      spacing: { before: 160, after: 40 },
      children: [text(qa.question, { size: 22, bold: true, color: NAVY })],
    })
  );
  qaChildren.push(bodyParagraph(qa.answer));
}

sections.push({ children: qaChildren });

// ═══════════════════════════════════════════
//  ASSEMBLE & SAVE
// ═══════════════════════════════════════════

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: "Calibri",
          size: 22,
          color: DARK_TEXT,
        },
      },
    },
  },
  sections: sections.map((s, i) => ({
    properties: i > 0 ? { page: { margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 } } } : { page: { margin: { top: 800, bottom: 800, left: 1200, right: 1200 } } },
    children: s.children,
  })),
});

const today = new Date();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
const yyyy = today.getFullYear();
const version = data.metadata.version || 1;
const filename = `Grand_Mediterranean_Luxury_Guide_v${version}_${mm} ${dd} ${yyyy}.docx`;

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(filename, buffer);
  console.log(`\nGenerated: ${filename}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
  console.log(`Sections: ${sections.length}`);
  console.log(`Days covered: ${data.days.length}`);
  console.log(`Excursions: ${data.expenses.excursions.length} booked ($${data.expenses.totalExcursions.toLocaleString()} total)`);
  console.log(`Action items: ${data.actionItems.length}`);
  console.log(`Ship Q&A: ${data.shipInfo.length} entries`);
  console.log("\nDone.");
});
