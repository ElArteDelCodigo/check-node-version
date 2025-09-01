import { BaseApp } from './BaseApp';

export class SequelizeCliApp extends BaseApp {
  constructor() {
    super('sequelize-cli');
  }

  getInstallMsg(): string {
    return 'npm install -g sequelize-cli@6.6.3';
  }
}
