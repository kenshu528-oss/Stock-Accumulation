/**
 * 帳戶管理器
 * 
 * 負責帳戶的新增、刪除、重新命名和統計功能
 */

import { StockRecord, Account } from '../types/interfaces.js';
import { validateAccountName, normalizeAccountName } from '../utils/validation.js';

export interface AccountStats {
  name: string;
  stockCount: number;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  profitRate: number;
  totalDividends: number;
  totalReturn: number;
  totalReturnRate: number;
  lastUpdate: string;
}

export interface AccountOperationResult {
  success: boolean;
  message: string;
  data?: any;
}

export class AccountManager {
  /**
   * 建立新帳戶
   */
  createAccount(
    accountName: string, 
    existingAccounts: string[]
  ): AccountOperationResult {
    const normalizedName = normalizeAccountName(accountName);
    
    // 驗證帳戶名稱
    const validation = validateAccountName(normalizedName, existingAccounts);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.errors.join(', ')
      };
    }

    return {
      success: true,
      message: `帳戶 "${normalizedName}" 建立成功`,
      data: normalizedName
    };
  }

  /**
   * 刪除帳戶
   */
  deleteAccount(
    accountName: string,
    accounts: string[],
    stocks: StockRecord[]
  ): AccountOperationResult {
    // 檢查是否為最後一個帳戶
    if (accounts.length <= 1) {
      return {
        success: false,
        message: '至少需要保留一個帳戶'
      };
    }

    // 檢查帳戶是否存在
    if (!accounts.includes(accountName)) {
      return {
        success: false,
        message: '帳戶不存在'
      };
    }

    // 檢查帳戶中是否有股票
    const accountStocks = stocks.filter(stock => stock.account === accountName);
    if (accountStocks.length > 0) {
      return {
        success: false,
        message: `帳戶 "${accountName}" 中還有 ${accountStocks.length} 支股票，請先移除股票或轉移到其他帳戶`,
        data: {
          stockCount: accountStocks.length,
          stocks: accountStocks
        }
      };
    }

    const updatedAccounts = accounts.filter(acc => acc !== accountName);
    
    return {
      success: true,
      message: `帳戶 "${accountName}" 刪除成功`,
      data: updatedAccounts
    };
  }

  /**
   * 強制刪除帳戶（包含股票）
   */
  forceDeleteAccount(
    accountName: string,
    accounts: string[],
    stocks: StockRecord[]
  ): AccountOperationResult {
    // 檢查是否為最後一個帳戶
    if (accounts.length <= 1) {
      return {
        success: false,
        message: '至少需要保留一個帳戶'
      };
    }

    // 檢查帳戶是否存在
    if (!accounts.includes(accountName)) {
      return {
        success: false,
        message: '帳戶不存在'
      };
    }

    const accountStocks = stocks.filter(stock => stock.account === accountName);
    const updatedAccounts = accounts.filter(acc => acc !== accountName);
    const updatedStocks = stocks.filter(stock => stock.account !== accountName);

    return {
      success: true,
      message: `帳戶 "${accountName}" 及其 ${accountStocks.length} 支股票已刪除`,
      data: {
        accounts: updatedAccounts,
        stocks: updatedStocks,
        deletedStocks: accountStocks
      }
    };
  }

  /**
   * 重新命名帳戶
   */
  renameAccount(
    oldName: string,
    newName: string,
    accounts: string[],
    stocks: StockRecord[]
  ): AccountOperationResult {
    const normalizedNewName = normalizeAccountName(newName);
    
    // 檢查舊帳戶是否存在
    if (!accounts.includes(oldName)) {
      return {
        success: false,
        message: '原帳戶不存在'
      };
    }

    // 驗證新帳戶名稱
    const otherAccounts = accounts.filter(acc => acc !== oldName);
    const validation = validateAccountName(normalizedNewName, otherAccounts);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.errors.join(', ')
      };
    }

    // 更新帳戶清單
    const updatedAccounts = accounts.map(acc => 
      acc === oldName ? normalizedNewName : acc
    );

    // 更新股票記錄中的帳戶名稱
    const updatedStocks = stocks.map(stock => 
      stock.account === oldName 
        ? { ...stock, account: normalizedNewName, lastUpdate: new Date().toISOString() }
        : stock
    );

    return {
      success: true,
      message: `帳戶 "${oldName}" 重新命名為 "${normalizedNewName}" 成功`,
      data: {
        accounts: updatedAccounts,
        stocks: updatedStocks,
        oldName,
        newName: normalizedNewName
      }
    };
  }

  /**
   * 移動帳戶順序
   */
  moveAccount(
    accounts: string[],
    accountName: string,
    direction: 'up' | 'down'
  ): AccountOperationResult {
    const currentIndex = accounts.indexOf(accountName);
    
    if (currentIndex === -1) {
      return {
        success: false,
        message: '帳戶不存在'
      };
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= accounts.length) {
      return {
        success: false,
        message: `無法向${direction === 'up' ? '上' : '下'}移動帳戶`
      };
    }

    const updatedAccounts = [...accounts];
    [updatedAccounts[currentIndex], updatedAccounts[newIndex]] = 
    [updatedAccounts[newIndex], updatedAccounts[currentIndex]];

    return {
      success: true,
      message: `帳戶 "${accountName}" 移動成功`,
      data: updatedAccounts
    };
  }

  /**
   * 計算帳戶統計資訊
   */
  calculateAccountStats(accountName: string, stocks: StockRecord[]): AccountStats {
    const accountStocks = stocks.filter(stock => stock.account === accountName);
    
    let totalValue = 0;
    let totalCost = 0;
    let totalDividends = 0;
    let lastUpdate = '';

    accountStocks.forEach(stock => {
      const marketValue = stock.shares * stock.currentPrice;
      const cost = stock.shares * stock.adjustedCostPrice;
      
      totalValue += marketValue;
      totalCost += cost;
      totalDividends += stock.totalDividends;
      
      if (stock.lastUpdate > lastUpdate) {
        lastUpdate = stock.lastUpdate;
      }
    });

    const totalProfit = totalValue - totalCost;
    const profitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const totalReturn = totalProfit + totalDividends;
    const totalReturnRate = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

    return {
      name: accountName,
      stockCount: accountStocks.length,
      totalValue,
      totalCost,
      totalProfit,
      profitRate,
      totalDividends,
      totalReturn,
      totalReturnRate,
      lastUpdate: lastUpdate || new Date().toISOString()
    };
  }

  /**
   * 獲取所有帳戶統計
   */
  getAllAccountStats(accounts: string[], stocks: StockRecord[]): AccountStats[] {
    return accounts.map(accountName => 
      this.calculateAccountStats(accountName, stocks)
    );
  }

  /**
   * 切換當前帳戶
   */
  switchAccount(
    newAccount: string,
    accounts: string[]
  ): AccountOperationResult {
    if (!accounts.includes(newAccount)) {
      return {
        success: false,
        message: '帳戶不存在'
      };
    }

    return {
      success: true,
      message: `切換到帳戶 "${newAccount}" 成功`,
      data: newAccount
    };
  }

  /**
   * 轉移股票到其他帳戶
   */
  transferStocks(
    stockIds: number[],
    targetAccount: string,
    accounts: string[],
    stocks: StockRecord[]
  ): AccountOperationResult {
    // 檢查目標帳戶是否存在
    if (!accounts.includes(targetAccount)) {
      return {
        success: false,
        message: '目標帳戶不存在'
      };
    }

    // 檢查股票是否存在
    const stocksToTransfer = stocks.filter(stock => stockIds.includes(stock.id));
    if (stocksToTransfer.length !== stockIds.length) {
      return {
        success: false,
        message: '部分股票不存在'
      };
    }

    // 更新股票的帳戶歸屬
    const updatedStocks = stocks.map(stock => 
      stockIds.includes(stock.id)
        ? { ...stock, account: targetAccount, lastUpdate: new Date().toISOString() }
        : stock
    );

    return {
      success: true,
      message: `成功轉移 ${stocksToTransfer.length} 支股票到帳戶 "${targetAccount}"`,
      data: {
        stocks: updatedStocks,
        transferredStocks: stocksToTransfer
      }
    };
  }

  /**
   * 合併帳戶
   */
  mergeAccounts(
    sourceAccount: string,
    targetAccount: string,
    accounts: string[],
    stocks: StockRecord[]
  ): AccountOperationResult {
    // 檢查帳戶是否存在
    if (!accounts.includes(sourceAccount) || !accounts.includes(targetAccount)) {
      return {
        success: false,
        message: '來源帳戶或目標帳戶不存在'
      };
    }

    if (sourceAccount === targetAccount) {
      return {
        success: false,
        message: '來源帳戶和目標帳戶不能相同'
      };
    }

    // 獲取來源帳戶的股票
    const sourceStocks = stocks.filter(stock => stock.account === sourceAccount);
    
    // 轉移所有股票到目標帳戶
    const updatedStocks = stocks.map(stock => 
      stock.account === sourceAccount
        ? { ...stock, account: targetAccount, lastUpdate: new Date().toISOString() }
        : stock
    );

    // 刪除來源帳戶
    const updatedAccounts = accounts.filter(acc => acc !== sourceAccount);

    return {
      success: true,
      message: `帳戶 "${sourceAccount}" 已合併到 "${targetAccount}"，轉移了 ${sourceStocks.length} 支股票`,
      data: {
        accounts: updatedAccounts,
        stocks: updatedStocks,
        transferredStocks: sourceStocks
      }
    };
  }

  /**
   * 驗證帳戶操作權限
   */
  validateAccountOperation(
    operation: 'delete' | 'rename' | 'merge',
    accountName: string,
    accounts: string[],
    stocks: StockRecord[]
  ): { canProceed: boolean; warnings: string[]; risks: string[] } {
    const warnings: string[] = [];
    const risks: string[] = [];
    let canProceed = true;

    // 檢查是否為最後一個帳戶
    if (accounts.length <= 1 && (operation === 'delete' || operation === 'merge')) {
      canProceed = false;
      risks.push('至少需要保留一個帳戶');
    }

    // 檢查帳戶中的股票
    const accountStocks = stocks.filter(stock => stock.account === accountName);
    if (accountStocks.length > 0) {
      if (operation === 'delete') {
        warnings.push(`帳戶中有 ${accountStocks.length} 支股票`);
        risks.push('刪除帳戶將同時刪除所有股票資料');
      } else if (operation === 'merge') {
        warnings.push(`將轉移 ${accountStocks.length} 支股票到目標帳戶`);
      }
    }

    // 檢查帳戶價值
    const accountStats = this.calculateAccountStats(accountName, stocks);
    if (accountStats.totalValue > 0) {
      warnings.push(`帳戶總市值: ${Math.round(accountStats.totalValue).toLocaleString()} 元`);
    }

    return { canProceed, warnings, risks };
  }
}