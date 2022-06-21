import { exec, ExecException } from "child_process";
import semver from "semver";
import path from "path";

const APP_LIST = ["node", "npm", "yarn", "sequelize", "pm2"];
const PROJECT_PATH = process.cwd();

const OK = `${process.platform === 'linux' ? '\u2713' : ''}`;
const FAIL = `${process.platform === 'linux' ? '\u2715' : 'x'}`;

let padLength = 0;

const cmd = (command: string, executePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { cwd: executePath },
      (error: ExecException | null, stdout: string, stderr: string) => {
        if (error) reject(stderr);
        if (!error) resolve(stdout);
      }
    );
  });
};

async function getPackageJson() {
  try {
    const packageJsonPath = path.resolve(PROJECT_PATH, "package.json");
    const packageJson = await import(packageJsonPath);
    return packageJson;
  } catch (e) {
    return {};
  }
}

async function getCurrentVersion(appName: string): Promise<string> {
  try {
    const currentVersion = (await cmd(`${appName} --version`, PROJECT_PATH))
      .trim()
      .split('\n')
      .pop();
    return currentVersion ? currentVersion.trim().replace("v", "") : '';
  } catch (e) {
    return '';
  }
}

async function getVersion(): Promise<string> {
  try {
    return (await import(`${__dirname}/../package.json`)).version;
  } catch (e) {
    return '';
  }
}

async function getRequiredVersion(appName: string): Promise<string> {
  const packageJson = await getPackageJson();
  const requiredVersion =
    packageJson.engines?.[appName] || packageJson.volta?.[appName];
  return requiredVersion;
}

async function versionValid(appName: string): Promise<boolean> {
  const currentVersion = await getCurrentVersion(appName);
  const requiredVersion = await getRequiredVersion(appName);

  const isValid =
    !requiredVersion || semver.satisfies(currentVersion, requiredVersion);

  const resultMsg = isValid
    ? `\x1b[32m${(appName + ':').padEnd(padLength, ' ')} ${currentVersion.padStart(7, ' ')} ${OK}  versión requerida: ${requiredVersion}\x1b[0m\n`
    : `\x1b[31m${(appName + ':').padEnd(padLength, ' ')} ${currentVersion.padStart(7, ' ')} ${FAIL}  versión requerida: ${requiredVersion}\x1b[0m\n`;

  process.stdout.write(resultMsg);
  return isValid;
}

async function getApps(): Promise<string[]> {
  const packageJson = await getPackageJson();
  const appSet = new Set<string>();

  if (packageJson.engines)
    Object.keys(packageJson.engines).map((key) => appSet.add(key));

  if (packageJson.volta)
    Object.keys(packageJson.volta).map((key) => appSet.add(key));

  const appSelectedList = Array.from(appSet);
  return APP_LIST.filter((app) => appSelectedList.includes(app));
}

async function init() {
  // SHOW APP VERSION
  if (
    process.argv.join(" ").includes(" --version") ||
    process.argv.join(" ").includes(" -v")
  ) {
    const version = await getVersion();
    return process.stdout.write(`${version}\n`);
  }

  // EXECUTE APP
  const appList = await getApps();
  padLength = appList.reduce((prev, curr) => curr.length > prev ? curr.length : prev, 0) + 1;

  if (appList.length === 0) {
    const infoMsg = `\x1b[32m\n¡Ups! ¿estamos dentro del proyecto?\x1b[0m

Si es así, puedes especificar la versión requerida de:

  - \x1b[36mnode\x1b[0m
  - \x1b[36mnpm\x1b[0m
  - \x1b[36myarn\x1b[0m
  - \x1b[36mpm2\x1b[0m
  - \x1b[36msequelize\x1b[0m

dentro del archivo \x1b[36mpackage.json\x1b[0m

Ejemplo:

    \x1b[36m{
      "name": "my-project",
      "version": "1.0.0",
      "engines": {
        "node": "^16",
        "npm": "^8"
      }
    }\x1b[0m

Formatos válidos (revisar el método satisfies):

    \x1b[36mhttps://github.com/npm/node-semver#usage\x1b[0m

`;
    return process.stdout.write(infoMsg);
  }

  let isValid = true;

  const packageJson = await getPackageJson();
  const appMsg = `\x1b[94m${packageJson.name}: ${packageJson.version}\x1b[0m\n`;
  process.stdout.write(appMsg);

  for (const appItem of appList) {
    if (!(await versionValid(appItem))) isValid = false;
  }

  if (!isValid) {
    let errorMsg = `
¡Ups! no podemos continuar.

Asegúrate de tener instalada la versión correcta e inténtalo nuevamente.

\x1b[36mEjemplo:
`;

    if (appList.includes('node')) {
      errorMsg += `\x1b[36m
    - para instalar ${'node:'.padEnd(padLength, ' ')} nvm install 16.15.1\x1b[33m   (https://github.com/nvm-sh/nvm)`
    }

    if (appList.includes('npm')) {
      errorMsg += `\x1b[36m
    - para instalar ${'npm:'.padEnd(padLength, ' ')} npm install -g npm@8.12.2\x1b[33m`
    }

    if (appList.includes('yarn')) {
      errorMsg += `\x1b[36m
    - para instalar ${'yarn:'.padEnd(padLength, ' ')} npm install -g yarn@1.22.19\x1b[33m`
    }

    if (appList.includes('sequelize')) {
      errorMsg += `\x1b[36m
    - para instalar ${'sequelize:'.padEnd(padLength, ' ')} npm install -g sequelize-cli@6.4.1\x1b[33m`
    }

    if (appList.includes('pm2')) {
      errorMsg += `\x1b[36m
    - para instalar ${'pm2:'.padEnd(padLength, ' ')} npm install -g pm2@5.2.0\x1b[33m`
    }

    errorMsg += `\x1b[36m

Comprueba la versión:
    `;

    if (appList.includes('node')) {
      errorMsg += `\x1b[36m
    node -v\x1b[33m`
    }

    if (appList.includes('npm')) {
      errorMsg += `\x1b[36m
    npm -v\x1b[33m`
    }

    if (appList.includes('yarn')) {
      errorMsg += `\x1b[36m
    yarn -v\x1b[33m`
    }

    if (appList.includes('sequelize')) {
      errorMsg += `\x1b[36m
    sequelize -v\x1b[33m`
    }

    if (appList.includes('pm2')) {
      errorMsg += `\x1b[36m
    pm2 -v\x1b[33m`
    }

    process.stdout.write(`\x1b[33m${errorMsg}\n\n\x1b[0m`);
    process.exit(1);
  }

  const successMsg = `\x1b[94m
Parece que todo está en orden, continuemos...

\x1b[0m`;
  process.stdout.write(successMsg);
}

init().catch((e) => {
  console.error(e);
  process.exit(1);
});
