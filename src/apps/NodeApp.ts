import { BaseApp } from './BaseApp';

export class NodeApp extends BaseApp {
  constructor() {
    super('node');
  }

  getInstallMsg(): string {
    return 'nvm install 22.19.0';
  }

  getInstallInfoMsg(): string {
    return '(https://github.com/nvm-sh/nvm)';
  }
}
