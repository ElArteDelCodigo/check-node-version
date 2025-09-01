import { BaseApp } from './BaseApp';

export class Pm2App extends BaseApp {
  constructor() {
    super('pm2');
  }

  getInstallMsg(): string {
    return 'npm install -g pm2@6.0.8';
  }
}
