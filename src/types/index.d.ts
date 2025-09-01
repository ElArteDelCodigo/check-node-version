type Engines = {
  [key: string]: string;
};

type PackageJson = {
  name?: string;
  version?: string;
  engines?: Engines;
};

type AppCheckResultItem = {
  name: string;
  current: string;
  required: string;
  isValid: boolean;
};
