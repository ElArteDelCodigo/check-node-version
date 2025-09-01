import { BaseApp } from './BaseApp';

export class NpmApp extends BaseApp {
  constructor() {
    super('npm');
  }

  getInstallMsg(): string {
    return 'npm install -g npm@10.9.3';
  }
}
