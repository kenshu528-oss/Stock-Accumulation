/**
 * 版本號一致性檢查腳本
 * Version Consistency Check Script
 */

const fs = require('fs');
const path = require('path');

class VersionChecker {
    constructor() {
        this.files = [
            'src/script.js',
            'src/version.js', 
            'index.html',
            'README.md',
            'netlify-upload/index.html',
            'netlify-upload/src/version.js'
        ];
        this.versionPattern = /v?(\d+\.\d+\.\d+\.\d+)/g;
        this.versions = new Map();
    }

    checkFiles() {
        console.log('🔍 檢查版本號一致性...\n');
        
        this.files.forEach(file => {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                const matches = [...content.matchAll(this.versionPattern)];
                
                if (matches.length > 0) {
                    const fileVersions = matches.map(match => match[1]);
                    this.versions.set(file, fileVersions);
                    
                    console.log(`📄 ${file}:`);
                    fileVersions.forEach(version => {
                        console.log(`   └─ v${version}`);
                    });
                } else {
                    console.log(`⚠️  ${file}: 未找到版本號`);
                }
            } else {
                console.log(`❌ ${file}: 檔案不存在`);
            }
        });

        this.analyzeVersions();
    }

    analyzeVersions() {
        console.log('\n📊 版本號分析:');
        
        const allVersions = new Set();
        this.versions.forEach(versions => {
            versions.forEach(version => allVersions.add(version));
        });

        if (allVersions.size === 1) {
            const version = Array.from(allVersions)[0];
            console.log(`✅ 所有檔案版本號一致: v${version}`);
        } else {
            console.log(`❌ 發現 ${allVersions.size} 個不同的版本號:`);
            Array.from(allVersions).forEach(version => {
                console.log(`   • v${version}`);
            });
            
            console.log('\n🔧 需要統一的檔案:');
            this.versions.forEach((versions, file) => {
                if (versions.length > 1 || !allVersions.has(versions[0])) {
                    console.log(`   • ${file}`);
                }
            });
        }
    }

    getLatestVersion() {
        const allVersions = [];
        this.versions.forEach(versions => {
            versions.forEach(version => allVersions.push(version));
        });

        if (allVersions.length === 0) return null;

        return allVersions.sort((a, b) => {
            const aParts = a.split('.').map(Number);
            const bParts = b.split('.').map(Number);
            
            for (let i = 0; i < 4; i++) {
                if (aParts[i] !== bParts[i]) {
                    return bParts[i] - aParts[i];
                }
            }
            return 0;
        })[0];
    }

    generateNextVersion(type = 'build') {
        const latest = this.getLatestVersion();
        if (!latest) return '1.0.0.0001';

        const parts = latest.split('.').map(Number);
        
        switch (type) {
            case 'major':
                return `${parts[0] + 1}.0.0.0001`;
            case 'minor':
                return `${parts[0]}.${parts[1] + 1}.0.0001`;
            case 'patch':
                return `${parts[0]}.${parts[1]}.${parts[2] + 1}.0001`;
            case 'build':
            default:
                const newBuild = String(parts[3] + 1).padStart(4, '0');
                return `${parts[0]}.${parts[1]}.${parts[2]}.${newBuild}`;
        }
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    const checker = new VersionChecker();
    checker.checkFiles();
    
    console.log('\n🚀 建議的下一個版本號:');
    console.log(`   • Build: v${checker.generateNextVersion('build')}`);
    console.log(`   • Patch: v${checker.generateNextVersion('patch')}`);
    console.log(`   • Minor: v${checker.generateNextVersion('minor')}`);
    console.log(`   • Major: v${checker.generateNextVersion('major')}`);
}

module.exports = VersionChecker;