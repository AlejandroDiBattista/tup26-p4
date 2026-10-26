import { fileURLToPath } from 'node:url';

// Funciona tanto desde src (tsx) como desde dist (compilado).
export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
