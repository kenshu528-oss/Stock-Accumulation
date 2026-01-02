/**
 * 版本管理工具
 * 
 * 負責版本號的生成、比較和更新
 */

export interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
  build: number;
  full: string;
}

export class VersionManager {
  private static readonly VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)\.(\d{4})$/;

  /**
   * 解析版本號
   */
  static parseVersion(version: string): VersionInfo | null {
    const match = version.match(this.VERSION_PATTERN);
    if (!match) {
      return null;
    }

    const [, major, minor, patch, build] = match;
    return {
      major: parseInt(major, 10),
      minor: parseInt(minor, 10),
      patch: parseInt(patch, 10),
      build: parseInt(build, 10),
      full: version
    };
  }

  /**
   * 格式化版本號（確保4位數建置號）
   */
  static formatVersion(major: number, minor: number, patch: number, build: number): string {
    const buildStr = build.toString().padStart(4, '0');
    return `v${major}.${minor}.${patch}.${buildStr}`;
  }

  /**
   * 比較版本號
   * @returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  static compareVersions(version1: string, version2: string): number {
    const v1 = this.parseVersion(version1);
    const v2 = this.parseVersion(version2);

    if (!v1 || !v2) {
      throw new Error('Invalid version format');
    }

    // 比較主版本號
    if (v1.major !== v2.major) {
      return v1.major < v2.major ? -1 : 1;
    }

    // 比較次版本號
    if (v1.minor !== v2.minor) {
      return v1.minor < v2.minor ? -1 : 1;
    }

    // 比較修訂版本號
    if (v1.patch !== v2.patch) {
      return v1.patch < v2.patch ? -1 : 1;
    }

    // 比較建置號
    if (v1.build !== v2.build) {
      return v1.build < v2.build ? -1 : 1;
    }

    return 0;
  }

  /**
   * 遞增版本號
   */
  static incrementVersion(
    currentVersion: string, 
    type: 'major' | 'minor' | 'patch' | 'build' = 'build'
  ): string {
    const version = this.parseVersion(currentVersion);
    if (!version) {
      throw new Error('Invalid version format');
    }

    let { major, minor, patch, build } = version;

    switch (type) {
      case 'major':
        major += 1;
        minor = 0;
        patch = 0;
        build = 1;
        break;
      case 'minor':
        minor += 1;
        patch = 0;
        build = 1;
        break;
      case 'patch':
        patch += 1;
        build = 1;
        break;
      case 'build':
      default:
        build += 1;
        // 如果建置號超過9999，自動遞增patch版本
        if (build > 9999) {
          patch += 1;
          build = 1;
        }
        break;
    }

    return this.formatVersion(major, minor, patch, build);
  }

  /**
   * 生成初始版本號
   */
  static generateInitialVersion(): string {
    return this.formatVersion(1, 0, 0, 1);
  }

  /**
   * 驗證版本號格式
   */
  static isValidVersion(version: string): boolean {
    return this.VERSION_PATTERN.test(version);
  }

  /**
   * 獲取版本號的各個部分
   */
  static getVersionParts(version: string): {
    majorMinorPatch: string;
    buildNumber: string;
    isPreRelease: boolean;
  } {
    const parsed = this.parseVersion(version);
    if (!parsed) {
      throw new Error('Invalid version format');
    }

    return {
      majorMinorPatch: `v${parsed.major}.${parsed.minor}.${parsed.patch}`,
      buildNumber: parsed.build.toString().padStart(4, '0'),
      isPreRelease: parsed.build < 1000 // 建置號小於1000視為預發布版本
    };
  }

  /**
   * 生成版本更新日誌格式
   */
  static generateChangelogEntry(
    version: string, 
    date: Date = new Date(),
    type: 'major' | 'minor' | 'patch' | 'build' = 'build',
    description: string = ''
  ): string {
    const dateStr = date.toISOString().split('T')[0];
    const typeEmoji = {
      major: '🚀',
      minor: '✨',
      patch: '🔧',
      build: '🐛'
    };

    const typeText = {
      major: '重大版本',
      minor: '功能版本',
      patch: '修正版本',
      build: 'Bug修正版'
    };

    return `### ${version} (${dateStr}) ${typeEmoji[type]} - ${typeText[type]}${description ? '\n' + description : ''}`;
  }

  /**
   * 檢查是否需要版本遷移
   */
  static needsMigration(currentVersion: string, targetVersion: string): boolean {
    try {
      return this.compareVersions(currentVersion, targetVersion) < 0;
    } catch {
      return true; // 如果版本格式無效，假設需要遷移
    }
  }

  /**
   * 獲取版本統計資訊
   */
  static getVersionStats(versions: string[]): {
    total: number;
    latest: string;
    oldest: string;
    majorVersions: number;
    minorVersions: number;
    patchVersions: number;
    buildVersions: number;
  } {
    if (versions.length === 0) {
      throw new Error('No versions provided');
    }

    const validVersions = versions.filter(v => this.isValidVersion(v));
    const sortedVersions = validVersions.sort((a, b) => this.compareVersions(a, b));

    const parsedVersions = validVersions.map(v => this.parseVersion(v)!);
    const majorVersions = new Set(parsedVersions.map(v => v.major)).size;
    const minorVersions = new Set(parsedVersions.map(v => `${v.major}.${v.minor}`)).size;
    const patchVersions = new Set(parsedVersions.map(v => `${v.major}.${v.minor}.${v.patch}`)).size;

    return {
      total: validVersions.length,
      latest: sortedVersions[sortedVersions.length - 1],
      oldest: sortedVersions[0],
      majorVersions,
      minorVersions,
      patchVersions,
      buildVersions: validVersions.length
    };
  }
}