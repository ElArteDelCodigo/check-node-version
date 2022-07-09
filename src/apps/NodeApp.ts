import { BaseApp } from './BaseApp';

export class NodeApp extends BaseApp {
  constructor() {
    super('node');
  }

  getInstallMsg(): string {
    return 'nvm install 16.15.1';
  }

  getInstallInfoMsg(): string {
    return '(https://github.com/nvm-sh/nvm)';
  }
}
