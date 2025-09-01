import path from 'path';
import fs from 'fs';
import {
  BaseApp,
  NodeApp,
  NpmApp,
  Pm2App,
  SequelizeCliApp,
  YarnApp,
} from '../apps';
import { APP_LIST } from '../common/constants';
import { FAIL, OK } from '../tools/Util';
import { bold, green, lightBlue, magenta, red, reset } from '../tools/colors';

export class Project {
  projectPath: string;
  name: string;
  version: string;
  requiredApps: BaseApp[];
  nodeProject: boolean;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.version = '';
    this.name = '';
    this.requiredApps = [];
    this.nodeProject = false;
  }

  async initialize() {
    const packageJson = await this.getPackageJsonValue();
    const nodeProject = !!packageJson;
    this.nodeProject = nodeProject;

    if (!nodeProject) {
      return;
    }

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
        await app.initialize(engines[key], this.projectPath);
        appSelectedList.push(app);
      }
    }

    return appSelectedList;
  }

  private async getPackageJsonValue(): Promise<PackageJson | null> {
    try {
      const packageJsonPath = path.resolve(this.projectPath, 'package.json');
      const raw = await fs.promises.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(raw) as PackageJson;
      return packageJson;
    } catch (_e) {
      return null;
    }
  }

  async checkVersion(): Promise<{ isValid: boolean; pathValid: boolean }> {
    this.printProjectInfo();

    if (!this.nodeProject) {
      this.printNoProjectValid();
      this.printLineBreack();
      this.printNoChecksRequired(green);
      return { isValid: true, pathValid: false };
    }

    const appList: Array<AppCheckResultItem> = [];
    for (const app of this.requiredApps) {
      const appIsValid = await app.isValid();
      appList.push({
        name: app.name,
        current: app.currentVersion,
        required: app.requiredVersion,
        isValid: appIsValid,
      });
    }

    if (appList.length > 0) {
      this.printLineBreack();
      this.printCheckResult(appList);
    }

    if (appList.length === 0) {
      this.printNoAppsDetected();
      this.printSample();
      this.printNoChecksRequired(green);
    }

    const isValid = appList.every((item) => item.isValid);
    return { isValid, pathValid: true };
  }

  private printNoProjectValid() {
    const msg = `${lightBlue}\vEsta ubicación no corresponde a un proyecto de NodeJS\n${reset}`;
    process.stdout.write(msg);
  }

  private printNoAppsDetected() {
    const msg = `${lightBlue}\vNo se encontraron dependencias requeridas en el campo "engines" del archivo ${reset}${bold}package.json${reset} \n${reset}`;
    process.stdout.write(msg);
  }

  private printCheckResult(appList: Array<AppCheckResultItem>) {
    const nameWidth =
      Math.max(...appList.map((i) => i.name.length), 'Paquete'.length) + 2;
    const currentWidth =
      Math.max(...appList.map((i) => i.current.length), 'Actual'.length) + 2;
    const requiredWidth =
      Math.max(...appList.map((i) => i.required.length), 'Requerida'.length) +
      2;

    const header =
      ` ${'Paquete'.padEnd(nameWidth)}│` +
      ` ${'Actual'.padEnd(currentWidth)}│` +
      ` ${'Requerida'.padEnd(requiredWidth)}│ Cumple \n`;
    process.stdout.write(lightBlue + header);

    const line =
      `${'─'.repeat(nameWidth + 1)}┼` +
      `${'─'.repeat(currentWidth + 1)}┼` +
      `${'─'.repeat(requiredWidth + 1)}┼────────\n`;
    process.stdout.write(lightBlue + line);

    appList.forEach((item) => {
      const status = item.isValid ? `${OK}` : `${FAIL}`;
      const color = item.isValid ? `${green}` : `${red}`;

      const row =
        ` ${item.name.padEnd(nameWidth)}│` +
        ` ${item.current.padEnd(currentWidth)}│` +
        ` ${item.required.padEnd(requiredWidth)}│ ${status}`;

      process.stdout.write(color + row + reset + '\n');
    });

    const allValid = appList.every((i) => i.isValid);
    const footer = allValid
      ? `\n${green}${OK} Todas las dependencias cumplen con los requisitos.${reset}\n\n`
      : `\n${red}${FAIL} Algunas dependencias no cumplen con los requisitos. Revisa el campo "engines" del archivo package.json${reset}\n\n`;

    process.stdout.write(footer);
  }

  private printNoChecksRequired(color: string) {
    const msg = `${color}${OK} No se encontraron requisitos de versiones.${reset}\n\n`;
    process.stdout.write(msg);
  }

  private printLineBreack() {
    process.stdout.write('\n');
  }

  private printProjectInfo() {
    const msg = `${reset}${lightBlue}\n> Verificando dependencias...${reset}

${reset}${this.projectPath}/package.json${reset}\n`;
    process.stdout.write(msg);
  }

  private printSample() {
    const msg = `${lightBlue}\nPuede especificar versiones requeridas de: ${green}node, npm, yarn, pm2, sequelize-cli${reset}

${bold}Ejemplo:${reset}

  {
    "name": "my-project",
    "version": "1.0.0",
  ${green}  "engines": {
      "node": "^16",
      "npm": "^8"
    }${reset}
  }

${reset}Semver (satisfies):${reset} ${magenta}https://github.com/npm/node-semver#usage${reset}\n
`;

    process.stdout.write(msg);
  }
}
