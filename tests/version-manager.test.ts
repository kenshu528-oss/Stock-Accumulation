/**
 * 版本管理功能測試
 */

import { VersionManager } from '../src/utils/VersionManager.js';

describe('版本管理功能', () => {
  describe('版本號解析', () => {
    test('應該正確解析4位數建置號版本', () => {
      const version = 'v1.2.3.0001';
      const parsed = VersionManager.parseVersion(version);
      
      expect(parsed).not.toBeNull();
      expect(parsed!.major).toBe(1);
      expect(parsed!.minor).toBe(2);
      expect(parsed!.patch).toBe(3);
      expect(parsed!.build).toBe(1);
      expect(parsed!.full).toBe(version);
    });

    test('應該拒絕5位數建置號版本', () => {
      const version = 'v1.2.3.00001';
      const parsed = VersionManager.parseVersion(version);
      
      expect(parsed).toBeNull();
    });

    test('應該支援不帶v前綴的版本號', () => {
      const version = '1.2.3.0001';
      const parsed = VersionManager.parseVersion(version);
      
      expect(parsed).not.toBeNull();
      expect(parsed!.major).toBe(1);
    });
  });

  describe('版本號格式化', () => {
    test('應該生成正確的4位數建置號格式', () => {
      const formatted = VersionManager.formatVersion(1, 2, 3, 1);
      expect(formatted).toBe('v1.2.3.0001');
    });

    test('應該自動補零到4位數', () => {
      const formatted = VersionManager.formatVersion(1, 2, 3, 42);
      expect(formatted).toBe('v1.2.3.0042');
    });

    test('應該處理4位數建置號', () => {
      const formatted = VersionManager.formatVersion(1, 2, 3, 9999);
      expect(formatted).toBe('v1.2.3.9999');
    });
  });

  describe('版本號比較', () => {
    test('應該正確比較相同版本', () => {
      const result = VersionManager.compareVersions('v1.2.3.0001', 'v1.2.3.0001');
      expect(result).toBe(0);
    });

    test('應該正確比較不同建置號', () => {
      const result1 = VersionManager.compareVersions('v1.2.3.0001', 'v1.2.3.0002');
      expect(result1).toBe(-1);

      const result2 = VersionManager.compareVersions('v1.2.3.0002', 'v1.2.3.0001');
      expect(result2).toBe(1);
    });

    test('應該正確比較不同版本號', () => {
      const result1 = VersionManager.compareVersions('v1.2.3.0001', 'v1.2.4.0001');
      expect(result1).toBe(-1);

      const result2 = VersionManager.compareVersions('v1.3.0.0001', 'v1.2.9.9999');
      expect(result2).toBe(1);
    });
  });

  describe('版本號遞增', () => {
    test('應該正確遞增建置號', () => {
      const result = VersionManager.incrementVersion('v1.2.3.0001', 'build');
      expect(result).toBe('v1.2.3.0002');
    });

    test('應該正確遞增修訂版本號', () => {
      const result = VersionManager.incrementVersion('v1.2.3.0001', 'patch');
      expect(result).toBe('v1.2.4.0001');
    });

    test('應該正確遞增次版本號', () => {
      const result = VersionManager.incrementVersion('v1.2.3.0001', 'minor');
      expect(result).toBe('v1.3.0.0001');
    });

    test('應該正確遞增主版本號', () => {
      const result = VersionManager.incrementVersion('v1.2.3.0001', 'major');
      expect(result).toBe('v2.0.0.0001');
    });

    test('建置號超過9999時應該自動遞增patch版本', () => {
      const result = VersionManager.incrementVersion('v1.2.3.9999', 'build');
      expect(result).toBe('v1.2.4.0001');
    });
  });

  describe('版本號驗證', () => {
    test('應該接受有效的4位數版本號', () => {
      const validVersions = [
        'v1.0.0.0001',
        'v1.2.3.0042',
        'v10.20.30.9999',
        '1.2.3.0001'
      ];

      validVersions.forEach(version => {
        expect(VersionManager.isValidVersion(version)).toBe(true);
      });
    });

    test('應該拒絕無效的版本號', () => {
      const invalidVersions = [
        'v1.2.3.00001', // 5位數建置號
        'v1.2.3',       // 缺少建置號
        '1.2',          // 格式不完整
        'v1.2.3.abc',   // 非數字建置號
        'invalid'       // 完全無效
      ];

      invalidVersions.forEach(version => {
        expect(VersionManager.isValidVersion(version)).toBe(false);
      });
    });
  });

  describe('版本統計', () => {
    test('應該正確計算版本統計', () => {
      const versions = [
        'v1.0.0.0001',
        'v1.0.0.0002',
        'v1.0.1.0001',
        'v1.1.0.0001',
        'v2.0.0.0001'
      ];

      const stats = VersionManager.getVersionStats(versions);
      
      expect(stats.total).toBe(5);
      expect(stats.latest).toBe('v2.0.0.0001');
      expect(stats.oldest).toBe('v1.0.0.0001');
      expect(stats.majorVersions).toBe(2); // v1.x.x.x 和 v2.x.x.x
      expect(stats.minorVersions).toBe(3); // v1.0.x.x, v1.1.x.x, v2.0.x.x
      expect(stats.patchVersions).toBe(4); // v1.0.0.x, v1.0.1.x, v1.1.0.x, v2.0.0.x
    });
  });

  describe('更新日誌生成', () => {
    test('應該生成正確的更新日誌格式', () => {
      const version = 'v1.2.3.0001';
      const date = new Date('2025-01-01');
      
      const changelog = VersionManager.generateChangelogEntry(version, date, 'build', '修正按鈕顯示問題');
      
      expect(changelog).toContain('v1.2.3.0001');
      expect(changelog).toContain('2025-01-01');
      expect(changelog).toContain('🐛');
      expect(changelog).toContain('Bug修正版');
      expect(changelog).toContain('修正按鈕顯示問題');
    });
  });
});