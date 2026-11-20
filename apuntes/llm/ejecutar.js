const ejemplo = process.argv[2]?.toUpperCase()

if (!ejemplo || !/^[TRGJ](?:10|[1-9])$/.test(ejemplo)) {
  console.log('Demostraciones: el modelo de lenguaje como función\n')
  console.log('T1 a T10: Transformar')
  console.log('R1 a R10: Reducir')
  console.log('G1 a G10: Generar')
  console.log('J1 a J10: Juzgar')
  console.log('\nUso: pnpm demo T1')
  console.log('También podés ejecutar directamente: node demo/T1.js')
  process.exitCode = ejemplo ? 1 : 0
} else {
  await import(`./demo/${ejemplo}.js`)
}
