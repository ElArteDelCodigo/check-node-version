import { Project } from '../src/models/Project';
import path from 'path';

describe('testing Project.ts file', () => {
  test('Initialize project', async () => {
    const PROJECT_PATH = path.resolve(__dirname, 'app-sample/empty-project');
    const project = new Project(PROJECT_PATH);
    expect(project.name).toBe('');

    await project.initialize();
    expect(project.name).toBe('app-sample');
    expect(project.version).toBe('1.0.0');
  });

  test('Empty project', async () => {
    const PROJECT_PATH = path.resolve(__dirname, 'app-sample/empty-project');
    const project = new Project(PROJECT_PATH);
    await project.initialize();

    expect(project.requiredApps.length).toBe(0);

    const isValid = await project.checkVersion();
    expect(isValid).toBe(true);
  });

  test('Partial required', async () => {
    const PROJECT_PATH = path.resolve(__dirname, 'app-sample/partial-required');
    const project = new Project(PROJECT_PATH);
    await project.initialize();

    expect(project.requiredApps.length).toBe(2);

    const isValid = await project.checkVersion();
    expect(isValid).toBe(true);
  });

  test('Full required', async () => {
    const PROJECT_PATH = path.resolve(__dirname, 'app-sample/full-required');
    const project = new Project(PROJECT_PATH);
    await project.initialize();

    expect(project.requiredApps.length).toBe(5);

    const isValid = await project.checkVersion();
    expect(isValid).toBe(true);
  });
});
