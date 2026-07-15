/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'esnext',
          target: 'es2022',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowJs: true,
          resolveJsonModule: true,
          strict: false,
          noUnusedLocals: false,
          noUnusedParameters: false,
          isolatedModules: true,
        },
      },
    ],
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  // Run tests TUẦN TỰ để tránh conflict DB
  maxWorkers: 1,
};