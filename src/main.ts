/**
 * main.ts - v1.3.X ?��??�用程�??�口
 * 
 * 負責�?
 * - ?��??��???Service ??Manager
 * - 實�?依賴注入?�輯
 * - 檢查並執行�??�遷�?
 * - ?��??�用程�?
 * 
 * ?�本：v1.3.0.0012
 */

// ?�入?�?��???
import { StorageService } from './services/StorageService';
import { MigrationService } from './services/MigrationService';
import { StockApiService } from './services/StockApiService';

// ?�入?�?�管?�器
import { StockManager } from './managers/StockManager';
import { AccountManager } from './managers/AccountManager';
import { DividendManager } from './managers/DividendManager';
import { PortfolioManager } from './managers/PortfolioManager';

/**
 * ?�用程�?類別
 * 封�??�?��?始�??�輯?��?賴注??
 */
class Application {
  // ?��?實�?
  private storageService!: StorageService;
  private migrationService!: MigrationService;
  private stockApiService!: StockApiService;
  
  // 管�??�實�?
  private stockManager!: StockManager;
  private accountManager!: AccountManager;
  private dividendManager!: DividendManager;
  private portfolioManager!: PortfolioManager;
  
  /**
   * ?��??��??��?�?
   * ?�照依賴?��??��??��??��??��?管�???
   */
  async initialize(): Promise<void> {
    console.log('=== v1.3.X ?��??�用程�??��? ===');
    console.log('?�本：v1.3.0.0012');
    console.log('?��??��??��?', new Date().toISOString());
    
    try {
      // 步�? 1: ?��??��??�層
      this.initializeServices();
      
      // 步�? 2: 檢查並執行�??�遷�?
      await this.checkAndMigrate();
      
      // 步�? 3: ?��??�管?�器�?
      this.initializeManagers();
      
      // 步�? 4: 將管?�器?�露?�全?��?�?UI 使用�?
      this.exposeToGlobal();
      
      console.log('???�用程�??��??��???);
      console.log('=================================');
      
      // 步�? 5: ?��???UI 事件??��??
      this.initializeUIEvents();
      
      // 步�? 6: 觸發 UI ?��??��?�?
      this.notifyUIReady();
      
      // 步�? 7: ?��??�深?�模�?
      this.initializeDarkMode();
      
    } catch (error) {
      console.error('???�用程�??��??�失??', error);
      this.handleInitializationError(error);
      throw error;
    }
  }
  
  /**
   * ?��??��??�層
   * ?��?層�?依賴?��??��?，可以直?��?始�?
   */
  private initializeServices(): void {
    console.log('?�� ?��??��??�層...');
    
    // ?��??�儲存�???
    this.storageService = new StorageService();
    console.log('  ??StorageService 已�?始�?');
    
    // ?��??�遷移�???
    this.migrationService = new MigrationService();
    console.log('  ??MigrationService 已�?始�?');
    
    // ?��??�股??API ?��?
    this.stockApiService = new StockApiService();
    console.log('  ??StockApiService 已�?始�?');
    
    console.log('???��?層�?始�?完�?');
  }
  
  /**
   * 檢查並執行�??�遷�?
   * 如�??�測?��??��??��??��??��??��??�示使用?�遷�?
   */
  private async checkAndMigrate(): Promise<void> {
    console.log('?? 檢查資�??�移?��?..');
    
    // 檢查?�否?�要�?示遷�?
    if (this.migrationService.shouldPromptMigration()) {
      console.log('?��?  ?�測??v1.2.X 資�?，�?要遷�?);
      
      // ?�示使用?�是?��??�移
      const shouldMigrate = await this.promptMigration();
      
      if (shouldMigrate) {
        console.log('?��??��?資�??�移...');
        
        const result = this.migrationService.migrate();
        
        if (result.success) {
          console.log('??資�??�移?��?');
          console.log(`  - ?�移?�票?? ${result.migratedStocks}`);
          console.log(`  - ?�移帳戶?? ${result.migratedAccounts}`);
          
          // 顯示?��?訊息
          this.showMigrationSuccess(result);
        } else {
          console.error('??資�??�移失�?:', result.error);
          
          // 顯示?�誤訊息
          this.showMigrationError(result.error);
        }
      } else {
        console.log('使用?�選?��??�移，�?空白?�?��?�?);
      }
    } else if (this.migrationService.hasNewData()) {
      console.log('??已�? v1.3.X 資�?，無?�?�移');
    } else if (this.migrationService.hasOldData()) {
      console.log('??已�? v1.3.X 資�?，�???v1.2.X 資�?');
    } else {
      console.log('???�現?��??��?從空?��??��?�?);
    }
  }
  
  /**
   * ?�示使用?�是?��??�移資�?
   * @returns 使用?�是?��??�遷�?
   */
  private async promptMigration(): Promise<boolean> {
    return new Promise((resolve) => {
      const message = 
        '?�測??v1.2.X ?�本?��??�。\n\n' +
        '?�否要�?資�??�移??v1.3.X？\n\n' +
        '???�移後�?保�??��?資�?\n' +
        '???�以?��??�到?��?使用\n' +
        '???��??��??�好?��??��??�能\n\n' +
        '?��??��?消」�?從空?��??��?�?;
      
      const result = confirm(message);
      resolve(result);
    });
  }
  
  /**
   * 顯示?�移?��?訊息
   * @param result - ?�移結�?
   */
  private showMigrationSuccess(result: { migratedStocks?: number; migratedAccounts?: number }): void {
    const message = 
      '??資�??�移?��?！\n\n' +
      `已遷�?${result.migratedStocks} ?�股票\n` +
      `已遷�?${result.migratedAccounts} ?�帳?�\n\n` +
      '?��?資�?已�??��??�可以隨?��???v1.2.X 使用';
    
    alert(message);
  }
  
  /**
   * 顯示?�移?�誤訊息
   * @param error - ?�誤訊息
   */
  private showMigrationError(error?: string): void {
    const message = 
      '??資�??�移失�?\n\n' +
      `?�誤?��?: ${error || '?�知?�誤'}\n\n` +
      '?�可以�?\n' +
      '1. ?�新?��??�面?�試一次\n' +
      '2. 繼�?使用 v1.2.X ?�本\n' +
      '3. ?��??�入資�?';
    
    alert(message);
  }
  
  /**
   * ?��??�管?�器�?
   * 管�??��?賴�??�層，�?要透�?依賴注入?��??��?實�?
   */
  private initializeManagers(): void {
    console.log('?�� ?��??�管?�器�?..');
    
    // ?��??�股票管?�器（�?�?StockApiService ??StorageService�?
    this.stockManager = new StockManager(
      this.stockApiService,
      this.storageService
    );
    console.log('  ??StockManager 已�?始�?');
    
    // ?��??�帳?�管?�器（�?�?StorageService�?
    this.accountManager = new AccountManager(
      this.storageService
    );
    console.log('  ??AccountManager 已�?始�?');
    
    // ?��??�股?�管?�器（�?�?StorageService�?
    this.dividendManager = new DividendManager(
      this.storageService
    );
    console.log('  ??DividendManager 已�?始�?');
    
    // ?��??��?資�??�管?�器（�?賴�??�其他管?�器�?
    this.portfolioManager = new PortfolioManager(
      this.stockManager,
      this.accountManager,
      this.dividendManager
    );
    console.log('  ??PortfolioManager 已�?始�?');
    
    console.log('??管�??�層?��??��???);
  }
  
  /**
   * 將管?�器?�露?�全??
   * 供現?��? UI �?��使用（�?渡�??��?�?
   */
  private exposeToGlobal(): void {
    console.log('?? ?�露管�??�到?��?...');
    
    // 將管?�器?��???window ?�件
    (window as any).app = {
      // ?��?
      storageService: this.storageService,
      migrationService: this.migrationService,
      stockApiService: this.stockApiService,
      
      // 管�???
      stockManager: this.stockManager,
      accountManager: this.accountManager,
      dividendManager: this.dividendManager,
      portfolioManager: this.portfolioManager,
      
      // 版本資訊
      version: 'v1.3.0.0014',
      
      // 工具?��?
      getPortfolioSummary: () => this.portfolioManager.getPortfolioSummary(),
      updateAllPrices: () => this.stockManager.updateAllPrices(),
      showCopyrightInfo: () => this.showCopyrightInfo()
    };
    
    // ?��??�容?��?也暴?�為 portfolio ?�件
    (window as any).portfolio = (window as any).app;
    
    console.log('??管�??�已?�露??window.app ??window.portfolio');
  }
  
  /**
   * ?��???UI 事件??��??
   * 綁�??�?��??��?點�?事件
   */
  private initializeUIEvents(): void {
    console.log('?�� ?��???UI 事件??��??..');
    
    // ?��??�票?��?
    const addStockBtn = document.getElementById('addStockBtn');
    if (addStockBtn) {
      addStockBtn.addEventListener('click', () => {
        console.log('點�??��??�票?��?');
        this.showAddStockModal();
      });
    }
    
    // ?��?帳戶?��?
    const addAccountBtn = document.getElementById('addAccountBtn');
    if (addAccountBtn) {
      addAccountBtn.addEventListener('click', () => {
        console.log('點�??��?帳戶?��?');
        this.showAddAccountModal();
      });
    }
    
    // ?�新?�價?��?
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        console.log('點�??�新?�價?��?');
        this.updateAllPrices();
      });
    }
    
    // ?�息管�??��?
    const dividendBtn = document.getElementById('dividendBtn');
    if (dividendBtn) {
      dividendBtn.addEventListener('click', () => {
        console.log('點�??�息管�??��?');
        this.showDividendModal();
      });
    }
    
    // ?�本資�??��?
    const versionBtn = document.getElementById('versionBtn');
    if (versionBtn) {
      versionBtn.addEventListener('click', () => {
        console.log('點�??�本資�??��?');
        this.showVersionInfo();
      });
    }
    
    // 深色模�??��??��?
    const darkModeBtn = document.getElementById('darkModeBtn');
    if (darkModeBtn) {
      darkModeBtn.addEventListener('click', () => {
        console.log('點�?深色模�??��?');
        this.toggleDarkMode();
      });
    }
    
    // ?��??��?話�?事件
    this.initializeModalEvents();
    
    console.log('??UI 事件??��?��?始�?完�?');
  }
  
  /**
   * ?��??��?話�?事件
   */
  private initializeModalEvents(): void {
    // ?��??�票對話�?
    const addStockModal = document.getElementById('addStockModal');
    if (addStockModal) {
      // ?��??��?
      const closeBtn = addStockModal.querySelector('.close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          addStockModal.style.display = 'none';
        });
      }
      
      // ?��??��?
      const cancelBtn = document.getElementById('cancelAdd');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          addStockModal.style.display = 'none';
        });
      }
      
      // 表單?�交
      const form = document.getElementById('addStockForm') as HTMLFormElement;
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.handleAddStock(form);
        });
      }
      
      // ?�票�?��輸入事件（自?�查詢�?- ?�入?��???
      const stockCodeInput = document.getElementById('stockCode') as HTMLInputElement;
      if (stockCodeInput) {
        let debounceTimer: number;
        stockCodeInput.addEventListener('input', () => {
          // 清除之�??��??�器
          clearTimeout(debounceTimer);
          
          // 設�??��?計�??��?500ms 後執行查詢�?
          debounceTimer = window.setTimeout(async () => {
            await this.handleStockCodeInput(stockCodeInput.value);
          }, 500);
        });
      }
    }
    
    // ?��?帳戶對話�?
    const addAccountModal = document.getElementById('addAccountModal');
    if (addAccountModal) {
      const closeBtn = addAccountModal.querySelector('.close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          addAccountModal.style.display = 'none';
        });
      }
      
      const cancelBtn = document.getElementById('cancelAddAccount');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          addAccountModal.style.display = 'none';
        });
      }
    }
    
    // 點�?對話框�??��???
    window.addEventListener('click', (event) => {
      if (event.target === addStockModal) {
        addStockModal.style.display = 'none';
      }
      if (event.target === addAccountModal) {
        addAccountModal.style.display = 'none';
      }
    });
  }
  
  /**
   * ?��??�票�?��輸入（自?�查詢�?
   */
  private async handleStockCodeInput(code: string): Promise<void> {
    const statusDiv = document.getElementById('codeSearchStatus');
    const stockNameInput = document.getElementById('stockName') as HTMLInputElement;
    const costPriceInput = document.getElementById('costPrice') as HTMLInputElement;
    
    // 清空之�??��??��?欄�?
    if (statusDiv) {
      statusDiv.textContent = '';
    }
    if (stockNameInput) {
      stockNameInput.value = '';
    }
    if (costPriceInput) {
      costPriceInput.value = '';
    }
    
    if (code.length < 4) return;
    
    // 顯示?�詢中�???
    if (statusDiv) {
      statusDiv.textContent = '?? ?�詢�?..';
      statusDiv.style.color = 'blue';
    }
    
    try {
      console.log('?�詢?�票�?��:', code);
      const stockInfo = await this.stockApiService.searchStockByCode(code);
      
      if (stockInfo) {
        // ?�新?�票?�稱欄�?
        if (stockNameInput) {
          stockNameInput.value = stockInfo.name;
        }
        
        // 如�??�股?��??�新?�本?��?�?
        if (stockInfo.price && stockInfo.price > 0) {
          if (costPriceInput) {
            costPriceInput.value = stockInfo.price.toString();
          }
        } else {
          // 如�?沒�??�價，�?試單?�查詢股??
          console.log('stockInfo 沒�??�價，�?試單?�查�?..');
          try {
            const priceResult = await this.stockApiService.getStockPrice(code);
            console.log('?�獨?�詢?�價結�?:', priceResult);
            if (priceResult.price > 0 && costPriceInput) {
              costPriceInput.value = priceResult.price.toString();
              stockInfo.price = priceResult.price;
              console.log('?��?填入?�價:', priceResult.price);
            }
          } catch (priceError) {
            console.warn('?��??��??�價:', priceError);
          }
        }
        
        // 顯示完整?�詢結�?
        if (statusDiv) {
          const priceInfo = stockInfo.price && stockInfo.price > 0 ? ` | ?��??�價: $${stockInfo.price}` : ' | ?��??��??�價';
          const typeInfo = stockInfo.type ? ` (${stockInfo.type})` : '';
          statusDiv.textContent = `???�到: ${stockInfo.name}${typeInfo}${priceInfo}`;
          statusDiv.style.color = 'green';
        }
      }
    } catch (error) {
      console.error('?�詢?�票失�?:', error);
      if (statusDiv) {
        statusDiv.textContent = '???�詢失�?，�??��?輸入?�票?�稱';
        statusDiv.style.color = 'red';
      }
    }
  }
  
  /**
   * ?��??��??�票表單?�交
   */
  private async handleAddStock(form: HTMLFormElement): Promise<void> {
    try {
      const stockCode = (document.getElementById('stockCode') as HTMLInputElement).value;
      const stockName = (document.getElementById('stockName') as HTMLInputElement).value;
      const account = (document.getElementById('account') as HTMLSelectElement).value;
      const shares = parseInt((document.getElementById('shares') as HTMLInputElement).value);
      const costPrice = parseFloat((document.getElementById('costPrice') as HTMLInputElement).value);
      const purchaseDate = (document.getElementById('purchaseDate') as HTMLInputElement).value;
      
      console.log('?��??�票:', { stockCode, stockName, account, shares, costPrice, purchaseDate });
      
      // 調用 StockManager ?��??�票
      const newStock = await this.stockManager.addStock({
        code: stockCode,
        name: stockName,
        accountId: account,
        shares: shares,
        costPrice: costPrice,
        purchaseDate: purchaseDate,
        currentPrice: 0,
        lastUpdate: new Date().toISOString()
      });
      
      console.log('?�票?��??��?，ID:', newStock.id);
      
      // ?�新?�價（使?�股�?ID�?
      try {
        await this.stockManager.updateStockPrice(newStock.id);
        console.log('?�價?�新?��?');
      } catch (priceError) {
        console.warn('?�價?�新失�?:', priceError);
        // ?�價?�新失�?不影?�新增�???
      }
      
      // ?��?對話�?
      const modal = document.getElementById('addStockModal');
      if (modal) {
        modal.style.display = 'none';
      }
      
      // ?�置表單
      form.reset();
      
      alert('?�票?��??��?�?);
      
      // ?�新載入?�面以顯示新?�票
      window.location.reload();
      
    } catch (error) {
      console.error('?��??�票失�?:', error);
      alert('?��??�票失�?: ' + (error instanceof Error ? error.message : '?�知?�誤'));
    }
  }
  
  /**
   * 顯示?��??�票對話�?
   */
  private showAddStockModal(): void {
    const modal = document.getElementById('addStockModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }
  
  /**
   * 顯示?��?帳戶對話�?
   */
  private showAddAccountModal(): void {
    const modal = document.getElementById('addAccountModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }
  
  /**
   * ?�新?�?�股??
   */
  private async updateAllPrices(): Promise<void> {
    try {
      console.log('?��??�新?�?�股??..');
      await this.stockManager.updateAllPrices();
      console.log('???�價?�新完�?');
    } catch (error) {
      console.error('???�價?�新失�?:', error);
      alert('?�價?�新失�?，�?稍�??�試');
    }
  }
  
  /**
   * 顯示?�息管�?對話�?
   */
  private showDividendModal(): void {
    const modal = document.getElementById('dividendModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }
  
  /**
   * 顯示?�本資�?
   */
  private showVersionInfo(): void {
    const versionInfo = `存股紀錄系統 v1.3.0.0014

??�?TypeScript 模�??�架�?
?? ?��??��?: 2025-01-02
?�� 建置?��?: ${new Date().toISOString()}

???��???
??完整??TypeScript ?��?
??模�??�設�?(Managers/Services/Utils)
???�本?�離?��?
???��?資�??�移
??多�??�價 API ?��?

?? ?�術支?? kenshu528@gmail.com`;
    
    alert(versionInfo);
  }
  
  /**
   * ?�知 UI ?�用程�?已�??�就�?
   * 觸發?��?事件�?UI ??��
   */
  private notifyUIReady(): void {
    // 觸發?��?事件
    const event = new CustomEvent('appReady', {
      detail: {
        version: 'v1.3.0.0014',
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(event);
    console.log('?�� 已觸??appReady 事件');
  }
  
  /**
   * ?��??��??�錯�?
   * @param error - ?�誤?�件
   */
  private handleInitializationError(error: any): void {
    const errorMessage = 
      '?�用程�??��??�失?�\n\n' +
      `?�誤訊息: ${error instanceof Error ? error.message : String(error)}\n\n` +
      '請�??�整?��??��??�絡?�術支??;
    
    alert(errorMessage);
  }
  
  /**
   * 顯示?��?資�?
   */
  private showCopyrightInfo(): void {
    const copyrightInfo = `存股紀錄系統 v1.3.0.0014
?��??�??© 2025 徐�?�?

?��?條款：CC BY-NC 4.0
- ???�許?�人使用?�修?�、�???
- ???�許?��??��?織使?? 
- ??禁止?�業使用
- ?��? 必�?保�??��??��?

?�絡?��?：kenshu528@gmail.com
GitHub：https://github.com/kenshu528-oss

?�責?��?�?
?��?體�?供個人?��?記�?使用，�?構�??��?建議??
?�價資�?來�??�第三方 API，�?確性�??��?驗�???
使用?��??��??��??��?風險?�`;
    
    alert(copyrightInfo);
  }
  
  /**
   * ?��?深色模�?
   */
  private toggleDarkMode(): void {
    const body = document.body;
    const darkModeIcon = document.getElementById('darkModeIcon');
    
    // ?��? dark-mode 類別
    body.classList.toggle('dark-mode');
    
    // ?�新?�示
    if (darkModeIcon) {
      if (body.classList.contains('dark-mode')) {
        darkModeIcon.textContent = '?��?; // 深色模�??�顯示太?��?�?
      } else {
        darkModeIcon.textContent = '??'; // 亮色模�??�顯示�?亮�?�?
      }
    }
    
    // ?��?設�???localStorage
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
    
    console.log(`深色模�?: ${isDarkMode ? '?��?' : '?��?'}`);
  }
  
  /**
   * ?��??�深?�模�?
   * �?localStorage 讀?�使?�者�?好設�?
   */
  private initializeDarkMode(): void {
    const savedDarkMode = localStorage.getItem('darkMode');
    const body = document.body;
    const darkModeIcon = document.getElementById('darkModeIcon');
    
    // ?�設?�深?�模式�?true）�??��?使用?��?確設定為 false
    const isDarkMode = savedDarkMode !== 'false';
    
    if (isDarkMode) {
      body.classList.add('dark-mode');
      if (darkModeIcon) {
        darkModeIcon.textContent = '?��?;
      }
    } else {
      body.classList.remove('dark-mode');
      if (darkModeIcon) {
        darkModeIcon.textContent = '??';
      }
    }
    
    console.log(`深色模�??��??? ${isDarkMode ? '?��?' : '?��?'}`);
  }
  
  /**
   * ?��??��?實�?（�?外部使用�?
   */
  public getServices() {
    return {
      storage: this.storageService,
      migration: this.migrationService,
      stockApi: this.stockApiService
    };
  }
  
  /**
   * ?��?管�??�實例�?供�??�使?��?
   */
  public getManagers() {
    return {
      stock: this.stockManager,
      account: this.accountManager,
      dividend: this.dividendManager,
      portfolio: this.portfolioManager
    };
  }
}

/**
 * ?�用程�??��??�數
 * ??DOM 載入完�?後自?�執�?
 */
async function bootstrap(): Promise<void> {
  console.log('?? ?��? v1.3.X ?��??�用程�?...');
  
  try {
    // 建�??�用程�?實�?
    const app = new Application();
    
    // ?��??��??��?�?
    await app.initialize();
    
    // 將�??��?式實例暴?�到?��?（�??�錯使用�?
    (window as any).application = app;
    
  } catch (error) {
    console.error('?�� ?�用程�??��?失�?:', error);
  }
}

// ??DOM 載入完�??��??��??��?�?
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  // DOM 已�?載入完�?，直?��???
  bootstrap();
}

// ?�出供測試使??
export { Application, bootstrap };
