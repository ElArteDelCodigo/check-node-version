type Engines = {
  [key: string]: string;
};

type PackageJson = {
  name?: string;
  version?: string;
  engines?: Engines;
};
