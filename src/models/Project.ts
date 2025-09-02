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
import {
  bold,
  cyan,
  green,
  lightBlue,
  magenta,
  red,
  reset,
  yellow,
} from '../tools/colors';

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

  private getPadLength() {
    const padLength =
      this.requiredApps.reduce(
        (prev, curr) => (curr.name.length > prev ? curr.name.length : prev),
        0,
      ) + 1;
    return padLength;
  }

  async checkVersion(): Promise<{ isValid: boolean; pathValid: boolean }> {
    this.printProjectInfo(this.projectPath, this.name, this.version);

    if (!this.nodeProject) {
      this.printNoProjectValid();
      this.printSample();
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
    }

    const isValid = appList.every((item) => item.isValid);
    return { isValid, pathValid: true };
  }

  private printNoProjectValid() {
    const msg = `${yellow}\n> No se detectó un proyecto válido de NodeJS en esta ubicación.\n${reset}`;
    process.stdout.write(msg);
  }

  private printNoAppsDetected() {
    const msg = `${yellow}\n> No tiene definidas las dependencias requeridas.\n${reset}`;
    process.stdout.write(msg);
  }

  private printCheckResult(appList: Array<AppCheckResultItem>) {
    const nameWidth =
      Math.max(...appList.map((i) => i.name.length), 'Paquete'.length) + 1;
    const currentWidth =
      Math.max(
        ...appList.map((i) => i.current.length),
        'Versión actual'.length,
      ) + 1;
    const requiredWidth =
      Math.max(
        ...appList.map((i) => i.required.length),
        'Versión requerida'.length,
      ) + 1;

    const header =
      ` ${'Paquete'.padEnd(nameWidth)}│` +
      ` ${'Versión actual'.padEnd(currentWidth)}│` +
      ` ${'Versión requerida'.padEnd(requiredWidth)}│ Estado \n`;
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
      ? `\n${green}> Todas las dependencias cumplen con los requisitos.${reset}\n\n`
      : `\n${red}> Algunas dependencias no cumplen con los requisitos.\n> Revisa el campo "engines" del archivo package.json.${reset}\n\n`;

    process.stdout.write(footer);

    if (!allValid) {
      this.printErrorCheck();
    }
  }

  private printLineBreack() {
    process.stdout.write('\n');
  }

  private printProjectInfo(
    projectPath: string,
    name?: string,
    version?: string,
  ) {
    const msg = `${reset}${lightBlue}\n> Verificando dependencias...${reset}

${reset}Proyecto : ${lightBlue}${projectPath}/package.json${reset}
${reset}Nombre   : ${lightBlue}${name || '-'}${reset}
${reset}Versión  : ${lightBlue}${version || '-'}${reset}\n`;
    process.stdout.write(msg);
  }

  private printSample() {
    // Define las versiones mínimas en el campo "engines" de tu package.json.
    const msg = `${lightBlue}> Define los requisitos de versiones en el bloque "engines" del archivo ${reset}${bold}package.json${reset}

${bold}Ejemplo:${reset}

  {
    "name": "my-project",
    "version": "1.0.0",
  ${green}  "engines": {
      "node": "^22",
      "npm": ">=10"
    }${reset}
  }

${reset}Paquetes soportados: ${green}node, npm, yarn, pm2, sequelize-cli${reset}
${reset}Referencia sobre Semver: ${reset}https://github.com/npm/node-semver#usage${reset}\n
`;

    process.stdout.write(msg);
  }

  private printErrorCheck() {
    const padLength = this.getPadLength();

    const installMessages = this.requiredApps
      .map((app) => {
        const appNamePadded = `${app.name}:`.padEnd(padLength, ' ');
        const installCmd = app.getInstallMsg();
        const installInfo = app.getInstallInfoMsg();
        return `${cyan}\n    - ${appNamePadded} ${installCmd}${magenta}   ${installInfo}`;
      })
      .join('');

    const versionMessages = this.requiredApps
      .map((app) => `${cyan}\n    ${app.getVersionMsg()}`)
      .join('');

    const msg = `${yellow}> Asegúrate de tener instalada la versión correcta e inténtalo nuevamente.${reset}

  ${cyan}Instalación sugerida:
    ${installMessages}

  ${cyan}Verifica la versión instalada:
    ${versionMessages}
`;
    process.stdout.write(`${msg}\n${reset}`);
  }
}
