var l=Object.defineProperty;var g=(t,e,o)=>e in t?l(t,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[e]=o;var n=(t,e,o)=>g(t,typeof e!="symbol"?e+"":e,o);import{S as d,M as h,a as p}from"./services.DS0GXnG5.js";import{a as v,b as u,D as f,P as m}from"./managers.DxU0Vghc.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function o(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=o(i);fetch(i.href,r)}})();class M{constructor(){n(this,"storageService");n(this,"migrationService");n(this,"stockApiService");n(this,"stockManager");n(this,"accountManager");n(this,"dividendManager");n(this,"portfolioManager")}async initialize(){console.log("=== v1.3.X 架構應用程式啟動 ==="),console.log("版本：v1.3.0.0001"),console.log("初始化時間：",new Date().toISOString());try{this.initializeServices(),await this.checkAndMigrate(),this.initializeManagers(),this.exposeToGlobal(),console.log("✅ 應用程式初始化完成"),console.log("================================="),this.notifyUIReady()}catch(e){throw console.error("❌ 應用程式初始化失敗:",e),this.handleInitializationError(e),e}}initializeServices(){console.log("📦 初始化服務層..."),this.storageService=new d,console.log("  ✓ StorageService 已初始化"),this.migrationService=new h,console.log("  ✓ MigrationService 已初始化"),this.stockApiService=new p,console.log("  ✓ StockApiService 已初始化"),console.log("✅ 服務層初始化完成")}async checkAndMigrate(){if(console.log("🔄 檢查資料遷移需求..."),this.migrationService.shouldPromptMigration())if(console.log("⚠️  偵測到 v1.2.X 資料，需要遷移"),await this.promptMigration()){console.log("開始執行資料遷移...");const o=this.migrationService.migrate();o.success?(console.log("✅ 資料遷移成功"),console.log(`  - 遷移股票數: ${o.migratedStocks}`),console.log(`  - 遷移帳戶數: ${o.migratedAccounts}`),this.showMigrationSuccess(o)):(console.error("❌ 資料遷移失敗:",o.error),this.showMigrationError(o.error))}else console.log("使用者選擇不遷移，從空白狀態開始");else this.migrationService.hasNewData()?console.log("✓ 已有 v1.3.X 資料，無需遷移"):this.migrationService.hasOldData()?console.log("✓ 已有 v1.3.X 資料，保留 v1.2.X 資料"):console.log("✓ 無現有資料，從空白狀態開始")}async promptMigration(){return new Promise(e=>{const s=confirm(`偵測到 v1.2.X 版本的資料。

是否要將資料遷移到 v1.3.X？

✓ 遷移後會保留舊版資料
✓ 可以隨時回到舊版使用
✓ 新版提供更好的效能和功能

選擇「取消」將從空白狀態開始`);e(s)})}showMigrationSuccess(e){const o=`✅ 資料遷移成功！

已遷移 ${e.migratedStocks} 支股票
已遷移 ${e.migratedAccounts} 個帳戶

舊版資料已保留，您可以隨時回到 v1.2.X 使用`;alert(o)}showMigrationError(e){const o=`❌ 資料遷移失敗

錯誤原因: ${e||"未知錯誤"}

您可以：
1. 重新整理頁面再試一次
2. 繼續使用 v1.2.X 版本
3. 手動匯入資料`;alert(o)}initializeManagers(){console.log("📦 初始化管理器層..."),this.stockManager=new v(this.stockApiService,this.storageService),console.log("  ✓ StockManager 已初始化"),this.accountManager=new u(this.storageService),console.log("  ✓ AccountManager 已初始化"),this.dividendManager=new f(this.storageService),console.log("  ✓ DividendManager 已初始化"),this.portfolioManager=new m(this.stockManager,this.accountManager,this.dividendManager),console.log("  ✓ PortfolioManager 已初始化"),console.log("✅ 管理器層初始化完成")}exposeToGlobal(){console.log("🌐 暴露管理器到全域..."),window.app={storageService:this.storageService,migrationService:this.migrationService,stockApiService:this.stockApiService,stockManager:this.stockManager,accountManager:this.accountManager,dividendManager:this.dividendManager,portfolioManager:this.portfolioManager,version:"v1.3.0.0001",getPortfolioSummary:()=>this.portfolioManager.getPortfolioSummary(),updateAllPrices:()=>this.stockManager.updateAllPrices(),showCopyrightInfo:()=>this.showCopyrightInfo()},window.portfolio=window.app,console.log("✅ 管理器已暴露到 window.app 和 window.portfolio")}notifyUIReady(){const e=new CustomEvent("appReady",{detail:{version:"v1.3.0.0001",timestamp:new Date().toISOString()}});window.dispatchEvent(e),console.log("📢 已觸發 appReady 事件")}handleInitializationError(e){const o=`應用程式初始化失敗

錯誤訊息: ${e instanceof Error?e.message:String(e)}

請重新整理頁面或聯絡技術支援`;alert(o)}showCopyrightInfo(){alert(`存股紀錄系統 v1.3.0.0001
版權所有 © 2025 徐國洲

授權條款：CC BY-NC 4.0
- ✅ 允許個人使用、修改、分發
- ✅ 允許非營利組織使用  
- ❌ 禁止商業使用
- ⚠️ 必須保留版權聲明

聯絡方式：kenshu528@gmail.com
GitHub：https://github.com/kenshu528-oss

免責聲明：
本軟體僅供個人投資記錄使用，不構成投資建議。
股價資料來源於第三方 API，準確性請自行驗證。
使用者需自行承擔投資風險。`)}getServices(){return{storage:this.storageService,migration:this.migrationService,stockApi:this.stockApiService}}getManagers(){return{stock:this.stockManager,account:this.accountManager,dividend:this.dividendManager,portfolio:this.portfolioManager}}}async function c(){console.log("🚀 啟動 v1.3.X 架構應用程式...");try{const t=new M;await t.initialize(),window.application=t}catch(t){console.error("💥 應用程式啟動失敗:",t)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",c):c();
//# sourceMappingURL=main.CT-hC-k3.js.map
