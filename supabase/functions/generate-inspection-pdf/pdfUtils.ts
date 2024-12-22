import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib'

export const createBasicPDF = async () => {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  return { pdfDoc, page, font }
}

export const drawText = (
  page: any,
  text: string,
  x: number,
  y: number,
  size: number,
  font: any
) => {
  page.drawText(text, {
    x,
    y,
    size,
    font,
    color: rgb(0, 0, 0),
  })
}

export const drawVehicleInfo = (
  page: any,
  font: any,
  vehicle: any,
  startY: number
) => {
  const fontSize = 12
  const vehicleInfo = [
    `Make: ${vehicle.make}`,
    `Model: ${vehicle.model}`,
    `Year: ${vehicle.year}`,
    `License Plate: ${vehicle.license_plate}`,
  ]

  vehicleInfo.forEach((info, index) => {
    drawText(page, info, 50, startY - (index * 20), fontSize, font)
  })

  return startY - (vehicleInfo.length * 20) - 20
}

export const drawInspectionDetails = (
  page: any,
  font: any,
  inspection: any,
  startY: number
) => {
  if (!inspection) return startY

  const fontSize = 12
  drawText(page, 'Inspection Details', 50, startY, 16, font)
  startY -= 25

  const inspectionInfo = [
    `Date: ${new Date(inspection.inspection_date).toLocaleDateString()}`,
    `Odometer Reading: ${inspection.odometer_reading} km`,
    `Fuel Level: ${inspection.fuel_level}%`,
  ]

  inspectionInfo.forEach((info, index) => {
    drawText(page, info, 50, startY - (index * 20), fontSize, font)
  })

  return startY - (inspectionInfo.length * 20) - 20
}

export const drawMaintenanceDetails = (
  page: any,
  font: any,
  maintenance: any,
  startY: number
) => {
  const fontSize = 12
  drawText(page, 'Maintenance Details', 50, startY, 16, font)
  startY -= 25

  const maintenanceInfo = [
    `Service Type: ${maintenance.service_type}`,
    `Description: ${maintenance.description}`,
    `Status: ${maintenance.status}`,
    `Scheduled Date: ${new Date(maintenance.scheduled_date).toLocaleDateString()}`,
  ]

  maintenanceInfo.forEach((info, index) => {
    drawText(page, info, 50, startY - (index * 20), fontSize, font)
  })

  return startY - (maintenanceInfo.length * 20)
}