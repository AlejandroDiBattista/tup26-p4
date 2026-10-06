// Esta función recibe un número y responde si es primo o no.
// Un número primo es mayor que 1 y solo se puede dividir exactamente
// (sin que sobre nada) por 1 y por sí mismo.
function esPrimo(n) {
  // Los números menores que 2 no son primos.
  // Por ejemplo: 0 y 1 no cumplen la definición de número primo.
  // Si esto se cumple, devolvemos false (falso: no es primo) y terminamos
  // inmediatamente la función.
  if (n < 2) return false;

  // Vamos a probar si n se puede dividir por algún número entero desde 2
  // hasta la raíz cuadrada de n.
  // 'let divisor = 2' crea una variable llamada divisor y empieza en 2.
  // 'divisor <= Math.sqrt(n)' significa que repetimos mientras divisor no
  // supere la raíz cuadrada de n. Math.sqrt(n) calcula esa raíz cuadrada.
  // 'divisor++' suma 1 a divisor al terminar cada vuelta del bucle.
  // No hace falta probar más allá de la raíz cuadrada: si n tiene un divisor
  // mayor que ella, también tendrá uno menor que ella.
  for (let divisor = 2; divisor <= Math.sqrt(n); divisor++) {
    // El símbolo % calcula el resto de una división.
    // Si n % divisor da 0, la división es exacta: divisor divide a n.
    // Entonces n tiene un divisor distinto de 1 y de sí mismo, así que no
    // es primo. Devolvemos false y terminamos la función.
    if (n % divisor === 0) return false;
  }

  // Si llegamos hasta aquí, ningún número probado dividió a n exactamente.
  // Por lo tanto, n es primo y devolvemos true (verdadero).
  return true;
}

// Creamos una lista vacía para guardar los números primos encontrados.
// 'const' quiere decir que la variable primos seguirá apuntando a esta misma
// lista; podemos agregarle elementos, pero no reemplazarla por otra lista.
const primos = [];

// Empezamos a revisar los números desde el 2, que es el primer número primo.
// 'let' permite cambiar el valor de esta variable durante el programa.
let numero = 2;

// Este bucle se repite mientras la lista tenga menos de 100 elementos.
// primos.length indica cuántos elementos hay en la lista.
while (primos.length < 100) {
  // Preguntamos si el número actual es primo llamando a la función esPrimo.
  // Si devuelve true, lo agregamos al final de la lista con push().
  if (esPrimo(numero)) primos.push(numero);

  // Aumentamos el número en 1 para revisar el siguiente en la próxima vuelta.
  numero++;
}

// Mostramos en la consola la lista completa de los 100 primeros números primos.
// Para ejecutar este archivo desde una terminal, usá: node primos.js
console.log(primos);
