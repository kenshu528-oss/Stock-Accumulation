/**
 * 計算工具函數
 * 提供損益、報酬率、殖利率、調整成本價的計算功能
 * 
 * @module calculators
 */

/**
 * 計算損益
 * 損益 = (目前價格 - 成本價) × 持股數
 * 
 * @param currentPrice - 目前股價
 * @param costPrice - 成本價
 * @param shares - 持股數
 * @returns 損益金額（正數為獲利，負數為虧損）
 * 
 * @example
 * calculateGain(550, 500, 1000) // 50000 (獲利 5 萬)
 * calculateGain(450, 500, 1000) // -50000 (虧損 5 萬)
 */
export function calculateGain(
  currentPrice: number,
  costPrice: number,
  shares: number
): number {
  if (
    typeof currentPrice !== 'number' ||
    typeof costPrice !== 'number' ||
    typeof shares !== 'number' ||
    isNaN(currentPrice) ||
    isNaN(costPrice) ||
    isNaN(shares)
  ) {
    return 0;
  }
  
  return (currentPrice - costPrice) * shares;
}

/**
 * 計算報酬率
 * 報酬率 = (目前價格 - 成本價) / 成本價
 * 
 * @param currentPrice - 目前股價
 * @param costPrice - 成本價
 * @returns 報酬率（小數形式，例如 0.1 表示 10%）
 * 
 * @example
 * calculateReturnRate(550, 500) // 0.1 (10%)
 * calculateReturnRate(450, 500) // -0.1 (-10%)
 */
export function calculateReturnRate(
  currentPrice: number,
  costPrice: number
): number {
  if (
    typeof currentPrice !== 'number' ||
    typeof costPrice !== 'number' ||
    isNaN(currentPrice) ||
    isNaN(costPrice) ||
    costPrice === 0
  ) {
    return 0;
  }
  
  return (currentPrice - costPrice) / costPrice;
}

/**
 * 計算殖利率
 * 殖利率 = 年度股息 / 目前股價
 * 
 * @param annualDividend - 年度股息（每股）
 * @param currentPrice - 目前股價
 * @returns 殖利率（小數形式，例如 0.05 表示 5%）
 * 
 * @example
 * calculateYield(5, 100) // 0.05 (5%)
 * calculateYield(10, 200) // 0.05 (5%)
 */
export function calculateYield(
  annualDividend: number,
  currentPrice: number
): number {
  if (
    typeof annualDividend !== 'number' ||
    typeof currentPrice !== 'number' ||
    isNaN(annualDividend) ||
    isNaN(currentPrice) ||
    currentPrice === 0
  ) {
    return 0;
  }
  
  return annualDividend / currentPrice;
}

/**
 * 計算調整成本價（考慮股息）
 * 調整成本價 = (原始成本 - 累計股息) / 持股數
 * 
 * 當股票發放股息時，實際成本會降低
 * 例如：買入 1000 股，成本價 100 元，收到股息 5000 元
 * 調整成本價 = (100000 - 5000) / 1000 = 95 元
 * 
 * @param originalCost - 原始總成本（成本價 × 持股數）
 * @param totalDividend - 累計收到的股息總額
 * @param shares - 持股數
 * @returns 調整後的成本價（每股）
 * 
 * @example
 * calculateAdjustedCost(100000, 5000, 1000) // 95
 * calculateAdjustedCost(500000, 25000, 1000) // 475
 */
export function calculateAdjustedCost(
  originalCost: number,
  totalDividend: number,
  shares: number
): number {
  if (
    typeof originalCost !== 'number' ||
    typeof totalDividend !== 'number' ||
    typeof shares !== 'number' ||
    isNaN(originalCost) ||
    isNaN(totalDividend) ||
    isNaN(shares) ||
    shares === 0
  ) {
    return 0;
  }
  
  const adjustedCost = (originalCost - totalDividend) / shares;
  
  // 調整成本價不應為負數（股息超過成本的情況）
  return Math.max(0, adjustedCost);
}

/**
 * 計算總報酬率（含股息）
 * 總報酬率 = (目前市值 + 累計股息 - 原始成本) / 原始成本
 * 
 * @param currentPrice - 目前股價
 * @param costPrice - 成本價
 * @param shares - 持股數
 * @param totalDividend - 累計收到的股息總額
 * @returns 總報酬率（小數形式，例如 0.15 表示 15%）
 * 
 * @example
 * calculateTotalReturn(550, 500, 1000, 10000) // 0.12 (12%)
 * // 說明：目前市值 550000，原始成本 500000，股息 10000
 * // 總報酬 = (550000 + 10000 - 500000) / 500000 = 0.12
 */
export function calculateTotalReturn(
  currentPrice: number,
  costPrice: number,
  shares: number,
  totalDividend: number
): number {
  if (
    typeof currentPrice !== 'number' ||
    typeof costPrice !== 'number' ||
    typeof shares !== 'number' ||
    typeof totalDividend !== 'number' ||
    isNaN(currentPrice) ||
    isNaN(costPrice) ||
    isNaN(shares) ||
    isNaN(totalDividend) ||
    costPrice === 0 ||
    shares === 0
  ) {
    return 0;
  }
  
  const currentValue = currentPrice * shares;
  const originalCost = costPrice * shares;
  const totalReturn = (currentValue + totalDividend - originalCost) / originalCost;
  
  return totalReturn;
}

/**
 * 計算平均成本價（加碼時使用）
 * 平均成本價 = (原有成本 + 新增成本) / (原有股數 + 新增股數)
 * 
 * @param existingShares - 原有持股數
 * @param existingCostPrice - 原有成本價
 * @param newShares - 新增持股數
 * @param newCostPrice - 新增成本價
 * @returns 平均成本價
 * 
 * @example
 * calculateAverageCost(1000, 100, 500, 110) // 103.33
 * // 說明：原有 1000 股 @ 100 元，加碼 500 股 @ 110 元
 * // 平均成本 = (100000 + 55000) / 1500 = 103.33
 */
export function calculateAverageCost(
  existingShares: number,
  existingCostPrice: number,
  newShares: number,
  newCostPrice: number
): number {
  if (
    typeof existingShares !== 'number' ||
    typeof existingCostPrice !== 'number' ||
    typeof newShares !== 'number' ||
    typeof newCostPrice !== 'number' ||
    isNaN(existingShares) ||
    isNaN(existingCostPrice) ||
    isNaN(newShares) ||
    isNaN(newCostPrice)
  ) {
    return 0;
  }
  
  const totalShares = existingShares + newShares;
  
  if (totalShares === 0) {
    return 0;
  }
  
  const totalCost = (existingShares * existingCostPrice) + (newShares * newCostPrice);
  
  return totalCost / totalShares;
}
