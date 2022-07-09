import { BaseApp } from './BaseApp';

export class YarnApp extends BaseApp {
  constructor() {
    super('yarn');
  }

  getInstallMsg(): string {
    return 'npm install -g yarn@1.22.19';
  }
}
