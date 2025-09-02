import semver from 'semver';
import { cmd } from '../tools/Util';

export abstract class BaseApp {
  name: string;
  currentVersion: string;
  requiredVersion: string;
  executePath: string;

  constructor(name: string) {
    this.name = name;
    this.currentVersion = '';
    this.requiredVersion = '';
    this.executePath = '';
  }

  async initialize(requiredVersion: string, executePath: string) {
    this.executePath = executePath;
    this.currentVersion = await this.getVersion();
    this.requiredVersion = requiredVersion;
  }

  private async getVersion(): Promise<string> {
    try {
      const cmdResult = await cmd(`${this.name} --version`, this.executePath);
      const currentVersion = cmdResult.trim().split('\n').pop();
      return currentVersion ? currentVersion.trim().replace('v', '') : '';
    } catch (_e) {
      return '';
    }
  }

  async isValid(): Promise<boolean> {
    return semver.satisfies(this.currentVersion, this.requiredVersion);
  }

  getMinVersion(): string {
    try {
      const raw = (this.requiredVersion ?? '').trim();
      if (!raw || raw === '*') return 'latest';

      const exact = semver.valid(raw);
      if (exact) return exact;

      const range = semver.validRange(raw);
      if (range) {
        const min = semver.minVersion(range);
        if (min) return min.version;
      }

      // Si llega aquí, no se pudo resolver
      return '1.0.0';
    } catch {
      // En cualquier error inesperado
      return '1.0.0';
    }
  }

  getInstallMsg(): string {
    return `npm install -g ${this.name}@${this.getMinVersion()}`;
  }

  getInstallInfoMsg(): string {
    return '';
  }

  getVersionMsg(): string {
    return `${this.name} --version`;
  }
}
