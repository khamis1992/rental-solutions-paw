import { PaymentAnalysis } from './types.ts'

export const validateAnalysisResult = (result: PaymentAnalysis): boolean => {
  if (!result) return false

  const requiredFields = [
    'success',
    'totalRows',
    'validRows',
    'invalidRows',
    'totalAmount',
    'rawData'
  ]

  return requiredFields.every(field => field in result) && 
         Array.isArray(result.rawData)
}