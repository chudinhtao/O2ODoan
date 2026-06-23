export interface UomConversionRate {
  toUomName: string;
  conversionRate: number;
}

/**
 * Formats a quantity with its base unit into a readable string using the largest available unit
 * and its remainder in the base unit.
 * Example: 1500g with conversion to kg (1000) -> "1 kg 500 g"
 */
export function formatQuantityWithRemainder(
  baseQty: number,
  baseUomName: string,
  conversions: UomConversionRate[]
): string {
  if (baseQty === 0) return `0 ${baseUomName}`;
  if (!conversions || conversions.length === 0) {
    // Round to 2 decimal places if needed to avoid floating point errors
    const rounded = Math.round(baseQty * 100) / 100;
    return `${rounded} ${baseUomName}`;
  }

  // Find the largest applicable conversion unit
  const absQty = Math.abs(baseQty);
  
  // Sort conversions by rate descending
  const sortedConversions = [...conversions].sort((a, b) => b.conversionRate - a.conversionRate);
  
  let bestConversion = null;
  for (const conv of sortedConversions) {
    if (absQty >= conv.conversionRate && conv.conversionRate > 1) {
      bestConversion = conv;
      break;
    }
  }

  if (!bestConversion) {
    const rounded = Math.round(baseQty * 100) / 100;
    return `${rounded} ${baseUomName}`;
  }

  const sign = baseQty < 0 ? "-" : "";
  const mainQty = Math.floor(absQty / bestConversion.conversionRate);
  let remainder = absQty % bestConversion.conversionRate;
  
  // Round remainder to 2 decimal places
  remainder = Math.round(remainder * 100) / 100;

  if (remainder > 0) {
    return `${sign}${mainQty} ${bestConversion.toUomName} ${remainder} ${baseUomName}`;
  }

  return `${sign}${mainQty} ${bestConversion.toUomName}`;
}
