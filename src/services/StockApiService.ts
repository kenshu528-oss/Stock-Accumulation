/**
 * StockApiService - 股價 API 服務
 * 
 * 負責從多個來源取得股票價格和資訊：
 * 1. 證交所 API (TWSE/TPEx) - 最高優先級
 * 2. Yahoo Finance API - 次優先級
 * 3. 本地資料庫 - 最低優先級
 * 
 * 包含快取機制以減少 API 呼叫次數
 */

import type {
  StockPriceResult,
  StockInfo,
  CachedPrice,
  TWSEApiResponse,
  YahooFinanceResponse,
  LocalStockEntry
} from '../types/Api';
import { ApiError } from '../types/Errors';

/**
 * 股價 API 服務類別
 */
export class StockApiService {
  /** 快取儲存 - 使用 Map 結構存儲股票代碼對應的價格資料 */
  private cache: Map<string, CachedPrice> = new Map();
  
  /** 快取有效期限 (TTL) - 預設 1 分鐘 (60000 毫秒) */
  private readonly CACHE_TTL = 60000;
  
  /** 本地股票資料庫 - 股票代碼對照表 */
  private localDB: Map<string, LocalStockEntry> = new Map();
  
  /** API 請求逾時時間 (毫秒) */
  private readonly API_TIMEOUT = 10000;
  
  constructor() {
    // 初始化時載入本地資料庫
    this.loadLocalDatabase();
  }
  
  /**
   * 檢查快取是否有效
   * @param code - 股票代碼
   * @returns 快取是否有效
   */
  private isCacheValid(code: string): boolean {
    const cached = this.cache.get(code);
    
    if (!cached) {
      return false;
    }
    
    const now = Date.now();
    const age = now - cached.cachedAt;
    
    // 檢查快取是否在有效期限內
    return age < this.CACHE_TTL;
  }
  
  /**
   * 更新快取
   * @param code - 股票代碼
   * @param result - 股價查詢結果
   */
  private updateCache(code: string, result: StockPriceResult): void {
    const cached: CachedPrice = {
      data: result,
      cachedAt: Date.now()
    };
    
    this.cache.set(code, cached);
  }
  
  /**
   * 清除特定股票的快取
   * @param code - 股票代碼
   */
  public clearCache(code: string): void {
    this.cache.delete(code);
  }
  
  /**
   * 清除所有快取
   */
  public clearAllCache(): void {
    this.cache.clear();
  }
  
  /**
   * 載入本地股票資料庫
   * 從內建的股票名稱對照表載入資料
   */
  private loadLocalDatabase(): void {
    // 常見台股股票名稱對照表
    const stockData: LocalStockEntry[] = [
      // 權值股
      { code: '2330', name: '台積電', type: '上市' },
      { code: '2317', name: '鴻海', type: '上市' },
      { code: '2454', name: '聯發科', type: '上市' },
      { code: '2308', name: '台達電', type: '上市' },
      { code: '2303', name: '聯電', type: '上市' },
      { code: '2412', name: '中華電', type: '上市' },
      { code: '3008', name: '大立光', type: '上市' },
      { code: '2002', name: '中鋼', type: '上市' },
      { code: '1301', name: '台塑', type: '上市' },
      { code: '1303', name: '南亞', type: '上市' },
      { code: '1326', name: '台化', type: '上市' },
      { code: '2882', name: '國泰金', type: '上市' },
      { code: '2881', name: '富邦金', type: '上市' },
      { code: '2886', name: '兆豐金', type: '上市' },
      { code: '2891', name: '中信金', type: '上市' },
      { code: '2892', name: '第一金', type: '上市' },
      { code: '2884', name: '玉山金', type: '上市' },
      { code: '2885', name: '元大金', type: '上市' },
      { code: '2887', name: '台新金', type: '上市' },
      { code: '2890', name: '永豐金', type: '上市' },
      { code: '2883', name: '開發金', type: '上市' },
      { code: '1216', name: '統一', type: '上市' },
      { code: '1101', name: '台泥', type: '上市' },
      { code: '2207', name: '和泰車', type: '上市' },
      { code: '2382', name: '廣達', type: '上市' },
      { code: '2357', name: '華碩', type: '上市' },
      { code: '2301', name: '光寶科', type: '上市' },
      { code: '2409', name: '友達', type: '上市' },
      { code: '3045', name: '台灣大', type: '上市' },
      { code: '4904', name: '遠傳', type: '上市' },
      
      // 熱門 ETF
      { code: '0050', name: '元大台灣50', type: 'ETF' },
      { code: '0056', name: '元大高股息', type: 'ETF' },
      { code: '00878', name: '國泰永續高股息', type: 'ETF' },
      { code: '00881', name: '國泰台灣5G+', type: 'ETF' },
      { code: '00900', name: '富邦特選高股息30', type: 'ETF' },
      { code: '00919', name: '群益台灣精選高息', type: 'ETF' },
      { code: '00929', name: '復華台灣科技優息', type: 'ETF' },
      { code: '00631L', name: '元大台灣50正2', type: 'ETF' },
      { code: '00632R', name: '元大台灣50反1', type: 'ETF' },
      { code: '00757', name: '統一FANG+', type: 'ETF' },
      { code: '00830', name: '國泰費城半導體', type: 'ETF' },
      { code: '00850', name: '元大臺灣ESG永續', type: 'ETF' },
      { code: '00692', name: '富邦公司治理', type: 'ETF' },
      { code: '00701', name: '國泰股利精選30', type: 'ETF' },
      { code: '00713', name: '元大台灣高息低波', type: 'ETF' },
      
      // 上櫃股票
      { code: '5274', name: '信驊', type: '上櫃' },
      { code: '6446', name: '藥華藥', type: '上櫃' },
      { code: '4968', name: '立積', type: '上櫃' },
      { code: '6188', name: '廣明', type: '上櫃' },
      
      // 其他常見股票
      { code: '006208', name: '富邦台50', type: 'ETF' },
      { code: '4585', name: '達明', type: '上櫃' },
      { code: '9921', name: '巨大', type: '上市' },
      { code: '6488', name: '環球晶', type: '上櫃' },
      { code: '5269', name: '祥碩', type: '上櫃' },
      { code: '3443', name: '創意', type: '上櫃' },
      { code: '6415', name: '矽力-KY', type: '上櫃' },
      { code: '4919', name: '新唐', type: '上櫃' },
      { code: '6669', name: '緯穎', type: '上櫃' },
      { code: '3711', name: '日月光投控', type: '上櫃' }
    ];
    
    // 載入到 Map 中以便快速查詢
    for (const stock of stockData) {
      this.localDB.set(stock.code, stock);
    }
    
    console.log(`本地資料庫已載入 ${this.localDB.size} 筆股票資料`);
  }
  
  /**
   * 從本地資料庫查詢股價
   * 注意：本地資料庫僅提供股票名稱，不提供即時價格
   * @param code - 股票代碼
   * @returns 股票價格（本地資料庫不提供價格，返回 null）
   */
  private getFromLocalDB(code: string): number | null {
    const stock = this.localDB.get(code);
    
    if (stock) {
      console.log(`本地資料庫找到股票: ${code} - ${stock.name}`);
      // 本地資料庫僅用於提供股票名稱，不提供即時價格
      // 返回 null 表示需要從 API 取得價格
      return null;
    }
    
    console.log(`本地資料庫找不到股票: ${code}`);
    return null;
  }
  
  /**
   * 從本地資料庫取得股票資訊
   * @param code - 股票代碼
   * @returns 股票資訊，如果找不到則返回 null
   */
  private getStockInfoFromLocalDB(code: string): StockInfo | null {
    const stock = this.localDB.get(code);
    
    if (stock) {
      return {
        code: stock.code,
        name: stock.name,
        type: stock.type,
        source: 'Local'
      };
    }
    
    return null;
  }
  
  /**
   * 取得股票價格
   * 按照優先順序嘗試所有 API：證交所 → Yahoo → 本地資料庫
   * 
   * 重要：此方法嚴格遵循搜尋順序，不可更改
   * 1. 證交所 API (TWSE/TPEx) - 最高優先級
   * 2. Yahoo Finance API - 次優先級
   * 3. 本地資料庫 - 最低優先級（僅提供名稱，不提供價格）
   * 4. 拋出錯誤 - 所有方法都失敗
   * 
   * @param code - 股票代碼
   * @returns 股價查詢結果
   * @throws {ApiError} 當所有 API 都失敗時
   */
  public async getStockPrice(code: string): Promise<StockPriceResult> {
    // 檢查快取
    if (this.isCacheValid(code)) {
      console.log(`使用快取資料: ${code}`);
      return this.cache.get(code)!.data;
    }
    
    // 1. 嘗試證交所 API (最高優先級)
    try {
      console.log(`[1/3] 嘗試證交所 API: ${code}`);
      const price = await this.fetchFromTWSE(code);
      const result: StockPriceResult = {
        price,
        source: 'TWSE',
        timestamp: new Date().toISOString()
      };
      this.updateCache(code, result);
      console.log(`✅ 證交所 API 成功: ${code} = ${price}`);
      return result;
    } catch (error) {
      console.warn(`❌ 證交所 API 失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // 2. 嘗試 Yahoo Finance API (次優先級)
    try {
      console.log(`[2/2] 嘗試 Yahoo Finance API: ${code}`);
      const price = await this.fetchFromYahoo(code);
      const result: StockPriceResult = {
        price,
        source: 'Yahoo',
        timestamp: new Date().toISOString()
      };
      this.updateCache(code, result);
      console.log(`✅ Yahoo Finance API 成功: ${code} = ${price}`);
      return result;
    } catch (error) {
      console.warn(`❌ Yahoo Finance API 失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // 3. 所有 API 都失敗，拋出錯誤
    // 注意：不使用本地資料庫查詢股價
    console.error(`❌ 所有 API 都無法取得股票 ${code} 的價格`);
    throw new ApiError(`無法取得股票 ${code} 的價格，所有資料來源都失敗`);
  }
  
  /**
   * 搜尋股票資訊
   * 按照優先順序嘗試所有 API：Yahoo → 證交所
   * 
   * 重要：此方法嚴格遵循搜尋順序，不可更改
   * 1. Yahoo Finance API - 最高優先級（可查詢所有股票並返回完整名稱）
   * 2. 證交所 API (TWSE/TPEx) - 次優先級
   * 3. 拋出錯誤 - 所有方法都失敗
   * 
   * 注意：不使用本地資料庫進行查詢
   * 
   * @param code - 股票代碼
   * @returns 股票資訊
   * @throws {ApiError} 當所有 API 都失敗時
   */
  public async searchStockByCode(code: string): Promise<StockInfo> {
    // 1. 嘗試 Yahoo Finance API (最高優先級)
    try {
      console.log(`[1/2] 嘗試 Yahoo Finance API 搜尋: ${code}`);
      const yahooInfo = await this.fetchStockInfoFromYahoo(code);
      console.log(`✅ Yahoo Finance API 搜尋成功: ${code} - ${yahooInfo.name}`);
      return yahooInfo;
    } catch (error) {
      console.warn(`❌ Yahoo Finance API 搜尋失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // 2. 嘗試證交所 API (次優先級)
    try {
      console.log(`[2/2] 嘗試證交所 API 搜尋: ${code}`);
      const price = await this.fetchFromTWSE(code);
      
      // 從本地資料庫取得股票名稱（僅用於顯示中文名稱）
      const localInfo = this.getStockInfoFromLocalDB(code);
      
      const result: StockInfo = {
        code,
        name: localInfo?.name || code, // 優先使用本地資料庫的名稱
        price,
        type: localInfo?.type,
        source: 'TWSE'
      };
      console.log(`✅ 證交所 API 搜尋成功: ${code}`);
      return result;
    } catch (error) {
      console.warn(`❌ 證交所 API 搜尋失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // 3. 所有 API 都失敗，拋出錯誤
    console.error(`❌ 所有 API 都無法找到股票 ${code} 的資訊`);
    throw new ApiError(`無法找到股票 ${code} 的資訊，所有資料來源都失敗`);
  }
  private async fetchFromTWSE(code: string): Promise<number> {
    console.log(`證交所 API 查詢: ${code}`);
    
    // 判斷股票類型
    const stockType = this.getStockType(code);
    console.log(`股票類型: ${stockType}`);
    
    try {
      switch (stockType) {
        case 'listed': // 上市股票
          return await this.fetchFromTWSEListed(code);
        case 'otc': // 上櫃股票
          return await this.fetchFromTPEx(code);
        case 'emerging': // 興櫃股票
          return await this.fetchFromEmerging(code);
        case 'etf': // ETF
          return await this.fetchFromETF(code);
        default:
          // 如果無法判斷類型，依序嘗試各個 API
          return await this.fetchFromAllTWSE(code);
      }
    } catch (error) {
      console.warn(`證交所 API 查詢失敗: ${error instanceof Error ? error.message : String(error)}`);
      throw new ApiError(`證交所 API 查詢失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 判斷股票類型
   * @param code - 股票代碼
   * @returns 股票類型
   */
  private getStockType(code: string): 'listed' | 'otc' | 'emerging' | 'etf' | 'unknown' {
    // ETF (以 00 開頭)
    if (/^00\d+/.test(code)) return 'etf';
    
    // 上市股票 (1000-9999)
    if (/^[1-9]\d{3}$/.test(code)) return 'listed';
    
    // 上櫃股票 (4000-8999)
    if (/^[4-8]\d{3}$/.test(code)) return 'otc';
    
    return 'unknown';
  }
  
  /**
   * 從證交所取得上市股票價格
   * @param code - 股票代碼
   * @returns 股票價格
   * @throws {ApiError} 當 API 呼叫失敗時
   */
  private async fetchFromTWSEListed(code: string): Promise<number> {
    const today = new Date();
    const dateStr = today.getFullYear() + 
                   String(today.getMonth() + 1).padStart(2, '0') + 
                   String(today.getDate()).padStart(2, '0');
    
    const twseUrl = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${dateStr}&stockNo=${code}`;
    
    const response = await this.fetchWithTimeout(twseUrl, this.API_TIMEOUT);
    
    if (!response.ok) {
      throw new ApiError(`TWSE API 錯誤: ${response.status}`, response.status);
    }
    
    const data: TWSEApiResponse = await response.json();
    
    if (data.stat !== 'OK' || !data.data || data.data.length === 0) {
      throw new ApiError('TWSE 無資料或股票代碼錯誤');
    }
    
    // 取最新一天的資料
    const latestData = data.data[data.data.length - 1];
    const closePrice = parseFloat(latestData[6].replace(/,/g, '')); // 收盤價
    
    if (isNaN(closePrice) || closePrice <= 0) {
      throw new ApiError('無效的價格資料');
    }
    
    return closePrice;
  }
  
  /**
   * 從櫃買中心取得上櫃股票價格
   * @param code - 股票代碼
   * @returns 股票價格
   * @throws {ApiError} 當 API 呼叫失敗時
   */
  private async fetchFromTPEx(code: string): Promise<number> {
    const today = new Date();
    const dateStr = today.getFullYear() + '/' + 
                   String(today.getMonth() + 1).padStart(2, '0') + '/' + 
                   String(today.getDate()).padStart(2, '0');
    
    const tpexUrl = `https://www.tpex.org.tw/web/stock/aftertrading/daily_close_quotes/stk_quote_result.php?l=zh-tw&d=${dateStr}&stkno=${code}`;
    
    const response = await this.fetchWithTimeout(tpexUrl, this.API_TIMEOUT);
    
    if (!response.ok) {
      throw new ApiError(`TPEx API 錯誤: ${response.status}`, response.status);
    }
    
    const data: any = await response.json();
    
    if (!data.aaData || data.aaData.length === 0) {
      throw new ApiError('TPEx 無資料或股票代碼錯誤');
    }
    
    const stockData = data.aaData[0];
    const closePrice = parseFloat(stockData[2]);
    
    if (isNaN(closePrice) || closePrice <= 0) {
      throw new ApiError('無效的價格資料');
    }
    
    return closePrice;
  }
  
  /**
   * 從櫃買中心取得興櫃股票價格
   * @param code - 股票代碼
   * @returns 股票價格
   * @throws {ApiError} 當 API 呼叫失敗時
   */
  private async fetchFromEmerging(code: string): Promise<number> {
    // 興櫃股票通常也在櫃買中心的系統中
    try {
      return await this.fetchFromTPEx(code);
    } catch (error) {
      throw new ApiError(`興櫃股票查詢失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 取得 ETF 價格
   * @param code - 股票代碼
   * @returns 股票價格
   * @throws {ApiError} 當 API 呼叫失敗時
   */
  private async fetchFromETF(code: string): Promise<number> {
    // ETF 可能在上市或上櫃
    try {
      // 先嘗試上市 ETF
      return await this.fetchFromTWSEListed(code);
    } catch (error) {
      // 再嘗試上櫃 ETF
      return await this.fetchFromTPEx(code);
    }
  }
  
  /**
   * 依序嘗試所有證交所 API
   * @param code - 股票代碼
   * @returns 股票價格
   * @throws {ApiError} 當所有 API 都失敗時
   */
  private async fetchFromAllTWSE(code: string): Promise<number> {
    const apis = [
      { name: '上市', method: () => this.fetchFromTWSEListed(code) },
      { name: '上櫃', method: () => this.fetchFromTPEx(code) },
      { name: '興櫃', method: () => this.fetchFromEmerging(code) }
    ];
    
    for (const api of apis) {
      try {
        console.log(`嘗試 ${api.name} API: ${code}`);
        const price = await api.method();
        if (price > 0) {
          console.log(`✅ ${api.name} API 成功: ${code}`);
          return price;
        }
      } catch (error) {
        console.warn(`❌ ${api.name} API 失敗: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
    }
    
    throw new ApiError('所有證交所 API 都無法找到此股票');
  }
  
  /**
   * 帶逾時的 fetch 請求
   * @param url - 請求 URL
   * @param timeout - 逾時時間（毫秒）
   * @returns Response 物件
   * @throws {ApiError} 當請求失敗或逾時時
   */
  private async fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('請求逾時');
      }
      throw new ApiError(`請求失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 從 Yahoo Finance API 取得股價
   * @param code - 股票代碼
   * @returns 股票價格
   * @throws {ApiError} 當 API 呼叫失敗時
   */
  private async fetchFromYahoo(code: string): Promise<number> {
    const symbol = this.formatTaiwanSymbol(code);
    
    // 使用 CORS 代理
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    
    try {
      const response = await this.fetchWithTimeout(
        corsProxy + encodeURIComponent(yahooUrl),
        this.API_TIMEOUT
      );
      
      if (!response.ok) {
        throw new ApiError(`Yahoo Finance API 錯誤: HTTP ${response.status}`, response.status);
      }
      
      const data: YahooFinanceResponse = await response.json();
      const result = (data as any).chart?.result?.[0];
      
      if (!result) {
        throw new ApiError('Yahoo Finance 回應格式無效');
      }
      
      const meta = result.meta;
      const price = meta.regularMarketPrice || meta.previousClose;
      
      if (!price || price <= 0) {
        throw new ApiError('無法從 Yahoo Finance 取得有效價格');
      }
      
      return price;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Yahoo Finance API 呼叫失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 從 Yahoo Finance API 取得完整股票資訊（包含名稱和價格）
   * @param code - 股票代碼
   * @returns 股票資訊
   * @throws {ApiError} 當 API 呼叫失敗時
   */
  private async fetchStockInfoFromYahoo(code: string): Promise<StockInfo> {
    const symbol = this.formatTaiwanSymbol(code);
    
    // 使用 CORS 代理
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    
    try {
      const response = await this.fetchWithTimeout(
        corsProxy + encodeURIComponent(yahooUrl),
        this.API_TIMEOUT
      );
      
      if (!response.ok) {
        throw new ApiError(`Yahoo Finance API 錯誤: HTTP ${response.status}`, response.status);
      }
      
      const data: YahooFinanceResponse = await response.json();
      const result = (data as any).chart?.result?.[0];
      
      if (!result) {
        throw new ApiError('Yahoo Finance 回應格式無效');
      }
      
      const meta = result.meta;
      const price = meta.regularMarketPrice || meta.previousClose;
      
      // 優先使用本地資料庫的中文名稱，如果沒有才使用 Yahoo 的名稱
      const localInfo = this.getStockInfoFromLocalDB(code);
      const name = localInfo?.name || meta.longName || meta.shortName || code;
      
      if (!price || price <= 0) {
        throw new ApiError('無法從 Yahoo Finance 取得有效價格');
      }
      
      return {
        code,
        name,
        price,
        type: localInfo?.type,
        source: 'Yahoo'
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Yahoo Finance API 呼叫失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 將台股代碼轉換為 Yahoo Finance 格式
   * @param code - 股票代碼
   * @returns Yahoo Finance 格式的股票代碼
   */
  private formatTaiwanSymbol(code: string): string {
    // 台股代碼轉換為 Yahoo Finance 格式
    // 一般股票和 ETF 都加上 .TW 後綴
    if (/^\d{4,6}$/.test(code)) {
      return `${code}.TW`;
    }
    return `${code}.TW`;
  }

}
