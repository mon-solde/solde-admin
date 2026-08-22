import ExcelJS from 'exceljs'
import { centsToEuros } from '@/lib/money'
import { formatPersonName } from '@/lib/utils'
import { type VehicleDetail } from '../../data/schema'

const CURRENCY_FORMAT = '#,##0.00 €;[Red]-#,##0.00 €'
// The underlying value is already a percentage point (e.g. 50, not 0.5), so
// Excel's built-in '0%' format (which multiplies by 100) would be wrong —
// this appends a literal '%' instead.
const PERCENT_FORMAT = '0"%"'

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1F4E78' },
}
const TITLE_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFD9E1F2' },
}
const STRIPE_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF2F2F2' },
}
const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFB7B7B7' } },
  left: { style: 'thin', color: { argb: 'FFB7B7B7' } },
  bottom: { style: 'thin', color: { argb: 'FFB7B7B7' } },
  right: { style: 'thin', color: { argb: 'FFB7B7B7' } },
}
const OUTER_BORDER_SIDE: ExcelJS.Border = {
  style: 'medium',
  color: { argb: 'FF404040' },
}

// Thickens the perimeter of a table block (title row through last data row)
// so it reads as one bounded block at a glance, distinct from the tables
// above and below it in the same sheet.
function applyOuterBorder(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  columnCount: number
) {
  for (let col = 1; col <= columnCount; col++) {
    const topCell = sheet.getRow(startRow).getCell(col)
    topCell.border = { ...topCell.border, top: OUTER_BORDER_SIDE }
    const bottomCell = sheet.getRow(endRow).getCell(col)
    bottomCell.border = { ...bottomCell.border, bottom: OUTER_BORDER_SIDE }
  }
  for (let row = startRow; row <= endRow; row++) {
    const leftCell = sheet.getRow(row).getCell(1)
    leftCell.border = { ...leftCell.border, left: OUTER_BORDER_SIDE }
    const rightCell = sheet.getRow(row).getCell(columnCount)
    rightCell.border = { ...rightCell.border, right: OUTER_BORDER_SIDE }
  }
}

function resolvePersonName(
  contactId: string,
  ownerId: string,
  vehicle: VehicleDetail
): string {
  if (contactId === ownerId) return 'Moi'
  const participant = vehicle.participants.find(
    (p) => p.contactId === contactId
  )
  return participant
    ? formatPersonName(participant.firstName, participant.lastName)
    : contactId
}

type Table = { header: string[]; rows: (string | number)[][] }

// Tidy data: one row per payment, one column per attribute of that payment —
// stays sortable/filterable/summable in Excel, unlike a narrative layout.
// A delegated payment is attributed to whoever it's imputed to, not to
// whoever physically fronted the money — same rule as
// computeInvestedByResponsibleParty on the backend, so it reads exactly as
// if that person had paid it themselves.
function buildDetailTable(vehicle: VehicleDetail, ownerId: string): Table {
  const header = ['Date', 'Dépense', 'Payé par', 'Montant payé (€)']
  // `vehicle.expenses` arrives sorted date desc (see features/vehicles/detail
  // — most-recent-first suits the on-screen list); the export instead reads
  // chronologically, oldest first.
  const expensesByDateAsc = [...vehicle.expenses].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  )
  const rows: (string | number)[][] = []
  for (const expense of expensesByDateAsc) {
    // A single expense can have several payer rows resolving to the same
    // responsible party (e.g. they paid part of it directly and someone
    // else fronted the rest for them) — grouped into one line per party so
    // the same expense doesn't appear to have been paid twice.
    const amountByResponsibleId = new Map<string, number>()
    for (const payer of expense.payers) {
      const responsibleId = payer.imputedToId ?? payer.payerId
      amountByResponsibleId.set(
        responsibleId,
        (amountByResponsibleId.get(responsibleId) ?? 0) + payer.amount
      )
    }
    for (const [responsibleId, amount] of amountByResponsibleId) {
      rows.push([
        expense.date.toLocaleDateString('fr-FR'),
        expense.label,
        resolvePersonName(responsibleId, ownerId, vehicle),
        centsToEuros(amount),
      ])
    }
  }
  return { header, rows }
}

function buildVehicleInfoTable(vehicle: VehicleDetail): Table {
  const rows: (string | number)[][] = [
    ['Total des dépenses (€)', centsToEuros(vehicle.financialSummary.totalExpenses)],
  ]
  if (vehicle.soldVehicle) {
    rows.push(['Prix de vente (€)', centsToEuros(vehicle.soldVehicle.salePrice)])
  }
  if (vehicle.financialSummary.profit !== null) {
    rows.push(['Bénéfice net (€)', centsToEuros(vehicle.financialSummary.profit)])
  }
  return { header: ['Métrique', 'Valeur'], rows }
}

function buildSummaryTable(vehicle: VehicleDetail): Table & { isDeficit: boolean } {
  const { financialSummary } = vehicle
  const isSold = Boolean(vehicle.soldVehicle)
  // A profit is split by each participant's % de participation; a deficit is
  // split equally between participants instead, regardless of that
  // percentage — see computeProfitShares on the backend. The column reflects
  // whichever actually applied, instead of always showing the % (which would
  // be misleading on a deficit, since it played no part in the split).
  const isDeficit = financialSummary.profit !== null && financialSummary.profit < 0
  const header = [
    'Participant',
    isDeficit ? 'Répartition' : '% bénéfice',
    'Total investi (€)',
  ]
  if (isSold) header.push('Bénéfice net (€)', 'Montant à recevoir (€)')

  const rows: (string | number)[][] = []
  const pushParticipantRow = (
    name: string,
    profitShare: number,
    totalInvested: number,
    profitFromSale: number | null,
    amountToReceive: number | null
  ) => {
    const row: (string | number)[] = [
      name,
      isDeficit ? 'Égale (déficit)' : profitShare,
      centsToEuros(totalInvested),
    ]
    if (isSold) {
      row.push(
        profitFromSale !== null ? centsToEuros(profitFromSale) : '',
        amountToReceive !== null ? centsToEuros(amountToReceive) : ''
      )
    }
    rows.push(row)
  }

  pushParticipantRow(
    'Moi',
    financialSummary.owner.profitShare,
    financialSummary.owner.totalInvested,
    financialSummary.owner.profitFromSale,
    financialSummary.owner.amountToReceive
  )
  for (const p of financialSummary.participants) {
    pushParticipantRow(
      formatPersonName(p.firstName, p.lastName),
      p.profitShare,
      p.totalInvested,
      p.profitFromSale,
      p.amountToReceive
    )
  }
  return { header, rows, isDeficit }
}

// Writes one titled, bordered table (title row + header row + data rows,
// with zebra-striped data rows) starting at `startRow`. Returns the row
// index of the header, so callers needing it (e.g. for an autofilter range)
// don't have to recompute it.
function addTable(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  title: string,
  { header, rows }: Table,
  columnFormats: Record<number, string> = {}
): { headerRow: number; nextRow: number } {
  const titleRow = sheet.getRow(startRow)
  header.forEach((_, colIdx) => {
    const cell = titleRow.getCell(colIdx + 1)
    cell.fill = TITLE_FILL
    cell.border = THIN_BORDER
  })
  const titleCell = titleRow.getCell(1)
  titleCell.value = title
  titleCell.font = { bold: true, size: 12 }
  sheet.mergeCells(startRow, 1, startRow, header.length)

  const headerRow = startRow + 1
  header.forEach((label, colIdx) => {
    const cell = sheet.getRow(headerRow).getCell(colIdx + 1)
    cell.value = label
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = HEADER_FILL
    cell.border = THIN_BORDER
  })

  rows.forEach((row, rowIdx) => {
    const excelRow = sheet.getRow(headerRow + 1 + rowIdx)
    row.forEach((value, colIdx) => {
      const cell = excelRow.getCell(colIdx + 1)
      cell.value = value
      cell.border = THIN_BORDER
      if (columnFormats[colIdx]) {
        cell.numFmt = columnFormats[colIdx]
        cell.alignment = { horizontal: 'right' }
      }
      if (rowIdx % 2 === 1) cell.fill = STRIPE_FILL
    })
  })

  applyOuterBorder(sheet, startRow, headerRow + rows.length, header.length)

  // header row + data rows + one blank separator row before the next table.
  return { headerRow, nextRow: headerRow + rows.length + 2 }
}

export async function exportVehicleInvestmentsToExcel(
  vehicle: VehicleDetail,
  ownerId: string
) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Investissements')
  sheet.columns = [
    { width: 22 },
    { width: 32 },
    { width: 20 },
    { width: 18 },
    { width: 20 },
  ]

  const detail = buildDetailTable(vehicle, ownerId)
  const { headerRow: detailHeaderRow, nextRow: afterDetail } = addTable(
    sheet,
    1,
    'Dépenses',
    detail,
    { 3: CURRENCY_FORMAT }
  )
  if (detail.rows.length > 0) {
    sheet.autoFilter = {
      from: { row: detailHeaderRow, column: 1 },
      to: { row: detailHeaderRow + detail.rows.length, column: detail.header.length },
    }
  }

  const vehicleInfo = buildVehicleInfoTable(vehicle)
  const { nextRow: afterVehicleInfo } = addTable(
    sheet,
    afterDetail,
    'Résumé véhicule',
    vehicleInfo,
    { 1: CURRENCY_FORMAT }
  )

  const summary = buildSummaryTable(vehicle)
  const summaryColumnFormats: Record<number, string> = { 2: CURRENCY_FORMAT }
  if (!summary.isDeficit) summaryColumnFormats[1] = PERCENT_FORMAT
  if (summary.header.length > 3) {
    summaryColumnFormats[3] = CURRENCY_FORMAT
    summaryColumnFormats[4] = CURRENCY_FORMAT
  }
  addTable(
    sheet,
    afterVehicleInfo,
    'Répartition entre participants',
    summary,
    summaryColumnFormats
  )

  // Keeps the expense table's title + header visible while scrolling
  // through a long list — the only one of the three tables likely to grow.
  sheet.views = [{ state: 'frozen', ySplit: 2 }]

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  // Only strip characters a filesystem would actually reject — keep accents,
  // spaces, etc. so the file is named exactly like the vehicle.
  link.download = `${vehicle.name.replace(/[\\/:*?"<>|]/g, '-')}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}
