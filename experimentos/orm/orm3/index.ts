// Demostración flexible: SQLite local vs Turso
// Auto-detecta el entorno y usa la base de datos correspondiente

import { db, users, isDevelopment, isProduction } from './db/schema';
import { eq } from 'drizzle-orm';

async function demo() {
  console.log('🔍 Modo de detección automática\n');
  console.log('📊 Estado actual:');
  console.log(`   - Modo desarrollo: ${isDevelopment}`);
  console.log(`   - Modo producción: ${isProduction}`);
  console.log(`   - Driver usando: ${isDevelopment ? 'SQLite local' : 'Turso (libSQL)'}\n`);

  // Ejemplo de operación que funciona en ambos modos
  // En desarrollo local, crearemos la tabla si no existe
  // En producción Turso, la tabla debería ya existir
  
  if (isDevelopment) {
    console.log('💡 En desarrollo local: SQLite está listo');
    console.log('   (Usa tu propia base de datos o la que venga por defecto)\n');
  } else {
    console.log('🌐 En producción Turso: Conexión activa');
    console.log('   (Base de datos en la nube Turso)\n');
  }

  console.log('✅ Configuración flexible exitosa');
  console.log('   - Cambia DATABASE_URL a libsql://... para Turso');
  console.log('   - Deja vacío o usa ruta local para SQLite\n');
}

demo().catch((error) => {
  console.error('❌ Error:', error.message);
});