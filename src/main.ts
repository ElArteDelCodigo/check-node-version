import { Project } from './models/Project';

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
    return (await import(`${__dirname}/../package.json`)).version;
  } catch (e) {
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
    return process.stdout.write(`${version}\n`);
  }

  // EXECUTE APP
  const project = new Project(process.cwd());
  await project.initialize();

  if (project.requiredApps.length === 0) {
    project.printSample();
    process.exit(0);
  }

  const isValid = await project.checkVersion();
  if (!isValid) {
    process.exit(1);
  }
}

init().catch((e) => {
  console.error(e);
  process.exit(1);
});
