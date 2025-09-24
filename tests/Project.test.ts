import { Project } from '../src/models/Project';
import path from 'path';
import { attachStdoutSpy } from './helpers/stdout';

describe('pruebas de Project.ts', () => {
  test('Inicializa el proyecto', async () => {
    const PROJECT_PATH = path.resolve(__dirname, 'app-sample/without-required');
    const project = new Project(PROJECT_PATH);
    expect(project.name).toBe('');

    await project.initialize();
    expect(project.name).toBe('app-sample');
    expect(project.version).toBe('1.0.0');
  });

  test('Proyecto vacío', async () => {
    const PROJECT_PATH = path.resolve(__dirname, 'app-sample/empty-project');
    const project = new Project(PROJECT_PATH);
    await project.initialize();

    expect(project.requiredApps.length).toBe(0);

    let output = '';
    const writeSpy = attachStdoutSpy((text) => {
      output += text;
    });

    try {
      const { isValid, pathValid } = await project.checkVersion();
      expect(output).toContain('> Verificando dependencias...');
      expect(output).toContain('Paquete');
      expect(output).toContain(
        '> No se detectó un proyecto válido de NodeJS en esta ubicación.',
      );
      expect(output).toContain('Ejemplo');
      expect(output).toContain('Paquetes soportados:');
      expect(output).toContain('Referencia sobre Semver:');
      expect(isValid).toBe(true);
      expect(pathValid).toBe(false);
    } finally {
      writeSpy.mockRestore();
    }
  });

  test('Sin dependencias requeridas', async () => {
    const PROJECT_PATH = path.resolve(__dirname, 'app-sample/without-required');
    const project = new Project(PROJECT_PATH);
    await project.initialize();

    expect(project.requiredApps.length).toBe(0);

    let output = '';
    const writeSpy = attachStdoutSpy((text) => {
      output += text;
    });

    try {
      const { isValid, pathValid } = await project.checkVersion();
      expect(output).toContain('> Verificando dependencias...');
      expect(output).toContain('Paquete');
      expect(output).toContain(
        '> No tiene definidas las dependencias requeridas.',
      );
      expect(output).toContain('Ejemplo');
      expect(output).toContain('Paquetes soportados:');
      expect(output).toContain('Referencia sobre Semver:');
      expect(isValid).toBe(true);
      expect(pathValid).toBe(true);
    } finally {
      writeSpy.mockRestore();
    }
  });

  test('Dependencias parciales', async () => {
    const PROJECT_PATH = path.resolve(__dirname, 'app-sample/partial-required');
    const project = new Project(PROJECT_PATH);
    await project.initialize();

    expect(project.requiredApps.length).toBe(2);

    let output = '';
    const writeSpy = attachStdoutSpy((text) => {
      output += text;
    });

    try {
      const { isValid, pathValid } = await project.checkVersion();
      expect(output).toContain('> Verificando dependencias...');
      expect(output).toContain('Paquete');
      expect(output).toContain('Versión actual');
      expect(output).toContain('Versión requerida');
      expect(output).toContain(
        '> Todas las dependencias cumplen con los requisitos',
      );
      expect(isValid).toBe(true);
      expect(pathValid).toBe(true);
    } finally {
      writeSpy.mockRestore();
    }
  });

  test('Dependencias incompatibles', async () => {
    const PROJECT_PATH = path.resolve(__dirname, 'app-sample/mismatched');
    const project = new Project(PROJECT_PATH);
    await project.initialize();

    expect(project.requiredApps.length).toBe(4);

    let output = '';
    const writeSpy = attachStdoutSpy((text) => {
      output += text;
    });

    try {
      const { isValid, pathValid } = await project.checkVersion();
      expect(output).toContain('> Verificando dependencias...');
      expect(output).toContain('Paquete');
      expect(output).toContain('Versión actual');
      expect(output).toContain('Versión requerida');
      expect(output).toContain(
        '> Algunas dependencias no cumplen con los requisitos.',
      );
      expect(output).toContain(
        '> Asegúrate de tener instalada la versión correcta e inténtalo nuevamente.',
      );
      expect(output).toContain(
        '> Asegúrate de tener instalada la versión correcta e inténtalo nuevamente.',
      );
      expect(output).toContain('Instalación sugerida');
      expect(output).toContain('Verifica la versión instalada');
      expect(output).toContain('node');
      expect(output).toContain('npm');
      expect(output).toContain('yarn');
      expect(output).toContain('pm2');
      expect(output).not.toContain('sequelize-cli');
      expect(isValid).toBe(false);
      expect(pathValid).toBe(true);
    } finally {
      writeSpy.mockRestore();
    }
  });

  test('Todas las dependencias requeridas', async () => {
    const PROJECT_PATH = path.resolve(__dirname, 'app-sample/full-required');
    const project = new Project(PROJECT_PATH);
    await project.initialize();
    expect(project.requiredApps.length).toBe(6);

    let output = '';
    const writeSpy = attachStdoutSpy((text) => {
      output += text;
    });

    try {
      const { isValid, pathValid } = await project.checkVersion();
      expect(output).toContain('> Verificando dependencias...');
      expect(output).toContain('Paquete');
      expect(output).toContain('Versión actual');
      expect(output).toContain('Versión requerida');
      expect(output).toContain(
        '> Todas las dependencias cumplen con los requisitos',
      );
      expect(isValid).toBe(true);
      expect(pathValid).toBe(true);
    } finally {
      writeSpy.mockRestore();
    }
  });

  test('Dependencias condicionales', async () => {
    const PROJECT_PATH = path.resolve(
      __dirname,
      'app-sample/required-conditional',
    );
    const project = new Project(PROJECT_PATH);
    await project.initialize();
    expect(project.requiredApps.length).toBe(2);

    let output = '';
    const writeSpy = attachStdoutSpy((text) => {
      output += text;
    });

    try {
      const { isValid, pathValid } = await project.checkVersion();
      expect(output).toContain('> Verificando dependencias...');
      expect(output).toContain('Paquete');
      expect(output).toContain('Versión actual');
      expect(output).toContain('Versión requerida');
      expect(output).toContain(
        '> Todas las dependencias cumplen con los requisitos',
      );
      expect(isValid).toBe(true);
      expect(pathValid).toBe(true);
    } finally {
      writeSpy.mockRestore();
    }
  });

  test('Dependencias condicionales con error', async () => {
    const PROJECT_PATH = path.resolve(
      __dirname,
      'app-sample/required-conditional-with-error',
    );
    const project = new Project(PROJECT_PATH);
    await project.initialize();
    expect(project.requiredApps.length).toBe(2);

    let output = '';
    const writeSpy = attachStdoutSpy((text) => {
      output += text;
    });

    try {
      const { isValid, pathValid } = await project.checkVersion();
      expect(output).toContain('> Verificando dependencias...');
      expect(output).toContain('Paquete');
      expect(output).toContain('Versión actual');
      expect(output).toContain('Versión requerida');
      expect(output).toContain(
        '> Algunas dependencias no cumplen con los requisitos.',
      );
      expect(output).toContain(
        '> Asegúrate de tener instalada la versión correcta e inténtalo nuevamente.',
      );
      expect(output).toContain('nvm install 50.0.0');
      expect(output).toContain('npm install -g npm@50.50.0');
      expect(isValid).toBe(false);
      expect(pathValid).toBe(true);
    } finally {
      writeSpy.mockRestore();
    }
  });
});
