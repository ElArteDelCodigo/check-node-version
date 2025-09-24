import { Project } from './models/Project';
import fs from 'fs';
import path from 'path';
import { printWithColor } from './tools/Util';

if (!String.prototype.padEnd) {
  String.prototype.padEnd = function () {
    return this.toString();
  };
}

if (!String.prototype.padStart) {
  String.prototype.padStart = function () {
    return this.toString();
  };
}

async function getVersion(): Promise<string> {
  try {
    const pkgPath = path.join(__dirname, '..', 'package.json');
    const raw = await fs.promises.readFile(pkgPath, 'utf8');
    const pkg = JSON.parse(raw) as PackageJson;
    return pkg.version ?? '';
  } catch (_e) {
    return '';
  }
}

async function init() {
  // SHOW APP VERSION
  if (
    process.argv.join(' ').includes(' --version') ||
    process.argv.join(' ').includes(' -v')
  ) {
    const version = await getVersion();
    const msg = `${version}\n`;
    return printWithColor(msg);
  }

  // EXECUTE APP
  const project = new Project(process.cwd());
  await project.initialize();

  const { isValid, pathValid } = await project.checkVersion();
  if (pathValid && !isValid) {
    process.exit(1);
  }
}

init().catch((e) => {
  console.error(e);
  process.exit(1);
});
