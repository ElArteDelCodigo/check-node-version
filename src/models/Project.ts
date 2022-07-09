import path from 'path';
import {
  BaseApp,
  NodeApp,
  NpmApp,
  Pm2App,
  SequelizeCliApp,
  YarnApp,
} from '../apps';
import { APP_LIST } from '../common/constants';

export class Project {
  projectPath: string;
  name: string;
  version: string;
  requiredApps: BaseApp[];

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.version = '';
    this.name = '';
    this.requiredApps = [];
  }

  async initialize() {
    const packageJson = await this.getPackageJsonValue();

    if (packageJson.name) {
      this.name = packageJson.name;
    }

    if (packageJson.version) {
      this.version = packageJson.version;
    }

    if (packageJson.engines) {
      this.requiredApps = await this.initializeRequiredApps(
        packageJson.engines,
      );
    }
  }

  private async initializeRequiredApps(engines: Engines): Promise<BaseApp[]> {
    const appSelectedList: BaseApp[] = [];
    for (const key of Object.keys(engines)) {
      if (!APP_LIST.includes(key)) continue;

      let app: BaseApp | null = null;
      if (key === 'node') app = new NodeApp();
      if (key === 'npm') app = new NpmApp();
      if (key === 'pm2') app = new Pm2App();
      if (key === 'yarn') app = new YarnApp();
      if (key === 'sequelize-cli') app = new SequelizeCliApp();

      if (app) {
        await app.initialize(engines[key]);
        appSelectedList.push(app);
      }
    }

    return appSelectedList;
  }

  private async getPackageJsonValue(): Promise<PackageJson> {
    try {
      const packageJsonPath = path.resolve(this.projectPath, 'package.json');
      const packageJson = await import(packageJsonPath);
      return packageJson;
    } catch (e) {
      return {};
    }
  }

  getVersion() {
    return this.version;
  }

  getName() {
    return this.name;
  }

  private getPadLength() {
    const padLength =
      this.requiredApps.reduce(
        (prev, curr) => (curr.name.length > prev ? curr.name.length : prev),
        0,
      ) + 1;
    return padLength;
  }

  async checkVersion(): Promise<boolean> {
    let isValid = true;
    const padLength = this.getPadLength();

    this.printInfo();

    for (const app of this.requiredApps) {
      const appIsValid = await app.isValid();

      if (appIsValid) {
        app.printCheckValidMessage(padLength);
        continue;
      }

      app.printCheckErrorMessage(padLength);
      isValid = false;
    }

    this.printLineBreack();

    if (isValid) {
      this.printSuccessCheck();
    }

    if (!isValid) {
      this.printErrorCheck();
    }

    this.printLineBreack();

    return isValid;
  }

  private printLineBreack() {
    process.stdout.write('\n');
  }

  private printSuccessCheck() {
    const msg = `\x1b[94mParece que todo está en orden, continuemos...\x1b[0m\n`;
    process.stdout.write(msg);
  }

  private printErrorCheck() {
    const padLength = this.getPadLength();

    const installMessages = this.requiredApps
      .map((app) => {
        const appNamePadded = `${app.name}:`.padEnd(padLength, ' ');
        const installCmd = app.getInstallMsg();
        const installInfo = app.getInstallInfoMsg();
        return `\x1b[36m\n    - para instalar ${appNamePadded} ${installCmd}\x1b[33m   ${installInfo}`;
      })
      .join('');

    const versionMessages = this.requiredApps
      .map((app) => {
        const versionMsg = app.getVersionMsg();
        return `\x1b[36m\n    ${versionMsg}\x1b[33m`;
      })
      .join('');

    const msg = `¡Ups! no podemos continuar.\n
Asegúrate de tener instalada la versión correcta e inténtalo nuevamente.\n
\x1b[36mEjemplo:\n    ${installMessages}\n\x1b[36m
Comprueba la versión:\n    ${versionMessages}\n`;
    process.stdout.write(`\x1b[33m${msg}\n\x1b[0m`);
  }

  private printInfo() {
    const msg = `\x1b[94m${this.name}: ${this.version}\x1b[0m\n`;
    process.stdout.write(msg);
  }

  printSample() {
    const appItemMsg = APP_LIST.map(
      (appName) => `  - \x1b[36m${appName}\x1b[0m`,
    ).join('\n');
    const msg = `\x1b[32m\n¡Ups! ¿estamos dentro del proyecto?\x1b[0m\n
Si es así, puedes especificar la versión requerida de:\n
${appItemMsg}\n
dentro del archivo \x1b[36mpackage.json\x1b[0m\n
Ejemplo:\n
    \x1b[36m{
      "name": "my-project",
      "version": "1.0.0",
      "engines": {
        "node": "^16",
        "npm": "^8"
      }
    }\x1b[0m\n
Formatos válidos (revisar el método satisfies):\n
    \x1b[36mhttps://github.com/npm/node-semver#usage\x1b[0m\n\n`;
    process.stdout.write(msg);
  }
}
