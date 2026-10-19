import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// ---------------------------------------------------------------------------
// Reglas de arquitectura: las dependencias apuntan siempre hacia adentro.
//   domain       -> no importa nada
//   ports        -> domain
//   application  -> ports + domain
//   adapters     -> core (nunca al revés)
// ---------------------------------------------------------------------------
const NO_FRAMEWORKS = {
  group: ['react', 'react/*', 'react-*', 'react-dom/*'],
  message: 'El núcleo es TypeScript puro: no puede depender de React ni de librerías de UI.',
};
const NO_ADAPTERS = { group: ['**/adapters/**'], message: 'El núcleo no puede importar adaptadores.' };
const NO_APPLICATION = { group: ['**/application/**'], message: 'Solo application puede usar application.' };
const NO_PORTS = { group: ['**/ports/**'], message: 'El dominio no conoce los puertos.' };

const restrict = (...patterns) => ({ 'no-restricted-imports': ['error', { patterns }] });

const NAMING = [
  { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
  { selector: ['class', 'enum', 'typeAlias'], format: ['PascalCase'] },
  { selector: 'enumMember', format: ['UPPER_CASE'] },
];

export default defineConfig(
  globalIgnores(['dist/', 'coverage/', 'node_modules/']),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Convenciones: interfaces con I, enums en UPPER_CASE, === siempre, public/private explícito.
      '@typescript-eslint/naming-convention': ['error', ...NAMING],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'explicit', overrides: { constructors: 'no-public' } },
      ],
      eqeqeq: 'error',
    },
  },
  {
    // Los puertos se nombran por su rol (GameServicePort), sin la I.
    files: ['src/core/ports/**/*.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'interface', filter: { regex: 'Port$', match: true }, format: ['PascalCase'] },
        ...NAMING,
      ],
    },
  },

  // --- Arquitectura (cada bloque reemplaza al anterior, por eso repite los patrones) ---
  { files: ['src/core/application/**/*.ts'], rules: restrict(NO_FRAMEWORKS, NO_ADAPTERS) },
  { files: ['src/core/ports/**/*.ts'], rules: restrict(NO_FRAMEWORKS, NO_ADAPTERS, NO_APPLICATION) },
  { files: ['src/core/domain/**/*.ts'], rules: restrict(NO_FRAMEWORKS, NO_ADAPTERS, NO_APPLICATION, NO_PORTS) },
  {
    files: ['src/adapters/ui/**/*.{ts,tsx}'],
    rules: restrict({ group: ['**/storage/**'], message: 'Los adaptadores no se conocen entre sí.' }),
  },
  {
    files: ['src/adapters/storage/**/*.ts'],
    rules: restrict({ group: ['**/ui/**'], message: 'Los adaptadores no se conocen entre sí.' }),
  },

  {
    files: ['src/**/*.tsx', 'src/adapters/**/*.ts', 'src/main.tsx'],
    extends: [reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
);
