# Examen completo

---

# Examen de fundamentos de C#: variables, memoria y tipos básicos

## Tipado en C#

---

### Tipado estático

1) ¿Qué significa que C# tenga tipado estático?

- [ ] Que todas las variables deben declararse como `static`.
- [x] Que el tipo de cada variable se conoce y se controla antes de ejecutar el programa.
- [ ] Que el tipo de una variable puede cambiar libremente durante la ejecución.

---

### Tipado fuerte

2) ¿Qué describe mejor la idea de tipado fuerte?

```csharp
int numero = 10;
string texto = "20";
```

- [ ] `string` e `int` son equivalentes.
- [ ] `numero = texto;` funciona siempre porque C# convierte automáticamente.
- [x] Hay que convertir explícitamente si se quiere pasar de `string` a `int`.

---

## Variables e inferencia de tipos

### Asignación

3) En C#, ¿Qué significa la instrucción `x = x + 1;` si antes `x` tenía el valor `5`?

- [ ] Que se intenta escribir una igualdad matemática imposible.
- [x] Que se toma el valor actual de `x`, se le suma `1` y se guarda el resultado en `x`.
- [ ] Que se crea una nueva variable llamada `x + 1`.

---

### Inferencia con `var`

4) ¿Qué significa realmente `var` en C#?

- [ ] Que la variable cambia de tipo según lo que se le asigne después.
- [ ] Que la variable no tiene tipo.
- [x] Que el compilador infiere el tipo a partir del valor inicial.

---

### Tipo inferido

5) ¿Cuál es la interpretación correcta de esta declaración?

```csharp
var activo = true;
```

- [ ] `activo` queda sin tipo hasta que el programa se ejecute.
- [ ] `activo` puede cambiar libremente entre tipos distintos durante la ejecución.
- [x] El compilador infiere que `activo` es de tipo `bool`.

---

### Uso de `var`

6) ¿En cuál de estos casos el uso de `var` resulta más claro?

- [x] `var alumnos = new List<string>();`
- [ ] `var dato = ObtenerResultado();`
- [ ] `var resultado = Procesar();`

---

### Alcance

7) ¿Qué pasa con una variable declarada dentro de un `if` cuando termina ese bloque?

- [x] Sale de alcance y ya no puede usarse fuera de ese bloque.
- [ ] Sigue existiendo en todo el programa.
- [ ] Se convierte automáticamente en variable global.

---

## Constantes, campos y miembros estáticos

### `const`

8) ¿Para qué caso corresponde usar `const`?

- [ ] Para un valor que se asigna por primera vez dentro del constructor.
- [x] Para un valor fijo conocido en tiempo de compilación.
- [ ] Para una variable local que cambia dentro de un bloque.

---

### `readonly`

9) ¿En qué caso tiene sentido usar `readonly`?

- [ ] Cuando el valor debe conocerse obligatoriamente en tiempo de compilación.
- [ ] Cuando un campo debe poder cambiarse desde cualquier método.
- [x] Cuando un campo puede asignarse al construir el objeto y luego no debería modificarse.

---

### `const` vs. `readonly`

10) ¿Cuál es la diferencia principal entre `const` y `readonly`?

- [ ] `readonly` solo sirve para variables locales y `const` solo para parámetros.
- [ ] No hay diferencia real entre ambas.
- [x] `const` se fija en compilación y `readonly` puede asignarse en la declaración o en el constructor.

---

### Clases estáticas

11) ¿Cuál es un uso razonable de una clase estática?

- [ ] Guardar todo el código del programa en una única clase gigante.
- [x] Agrupar constantes, configuraciones simples, funciones auxiliares o valores reutilizables.
- [ ] Crear objetos dinámicos que vivan siempre en la stack.

---

### Campo estático

12) En este código, ¿cómo se accede al contador compartido?

```csharp
static class Global {
    public static int ContadorGlobal = 0;
}
```

- [x] `Global.ContadorGlobal`
- [ ] `ContadorGlobal.Global`
- [ ] `new Global().ContadorGlobal`

---

### Tiempo de vida

13) ¿Cuál es la diferencia entre una variable local y una variable estática respecto de su tiempo de vida?

- [x] La variable local vive mientras se ejecuta su bloque; la variable estática vive durante toda la ejecución del programa.
- [ ] La variable estática vive solo dentro de un bloque; la variable local vive durante todo el programa.
- [ ] Ambas viven siempre durante toda la ejecución del programa.

---

### Namespace

14) ¿Para qué sirve un `namespace` en C#?

- [ ] Para convertir una variable local en una variable global.
- [ ] Para copiar objetos por valor automáticamente.
- [x] Para agrupar tipos relacionados y evitar conflictos de nombres.

---

## Memoria y copias

### Stack y heap

15) ¿Con qué se suele asociar el heap?

- [x] Con objetos creados dinámicamente y memoria administrada por el recolector de basura.
- [ ] Con llamadas a métodos, variables locales y datos de vida corta.
- [ ] Con constantes conocidas en tiempo de compilación únicamente.

---

### Tipos por valor

16) ¿Qué imprime este código?

```csharp
int a = 10;
int b = a;
b = 20;

Console.WriteLine(a);
```

- [ ] `20`, porque `a` y `b` apuntan al mismo dato.
- [x] `10`, porque al copiar un tipo por valor se copia el dato.
- [ ] Da error, porque no se puede asignar `a` a `b`.

---

### Tipos por referencia

17) ¿Qué imprime este código?

```csharp
int[] numeros = { 1, 2, 3 };
int[] copia = numeros;

copia[0] = 99;

Console.WriteLine(numeros[0]);
```

- [ ] `1`, porque `copia` es siempre un arreglo independiente.
- [ ] Da error, porque no se puede modificar un arreglo desde otra variable.
- [x] `99`, porque ambas variables apuntan al mismo arreglo.

---

### Copia independiente

18) Si `numeros` es un arreglo, ¿Qué instrucción crea una copia independiente?

- [ ] `int[] copia = numeros;`
- [ ] `int[] copia = ref numeros;`
- [x] `int[] copia = (int[])numeros.Clone();`

---

## Tipos básicos y literales

### Literales numéricos

19) ¿Cómo interpreta C# normalmente el literal `19.99`?

- [ ] Como `decimal`.
- [x] Como `double`.
- [ ] Como `int`.

---

### Sufijos de literales

20) ¿Qué literal corresponde claramente a un `decimal`?

- [ ] `10.5`
- [x] `10.5m`
- [ ] `10.5f`

---

### Hexadecimal

21) ¿Qué representa `0xFF` en decimal?

- [x] 255
- [ ] 15
- [ ] 512

---

### Binario

22) ¿Qué valor decimal representa `0b1010`?

- [ ] 8
- [ ] 12
- [x] 10

---

### Separadores visuales

23) ¿Para qué sirve el carácter `_` en un literal como `1_000_000`?

- [ ] Para indicar que el número es `long`.
- [x] Para mejorar la legibilidad sin cambiar el valor numérico.
- [ ] Para separar decimales.

---

# Examen de lenguaje C#

## Funciones, delegados y eventos en C#

---

### Uso de `out`

24. ¿Qué caracteriza al modificador `out`?
- [ ] La variable debe estar inicializada antes de llamar al método.
- [x] La variable no necesita estar inicializada antes de la llamada y el método debe asignarla.
- [ ] El método no puede devolver además un `bool`.

---

### Parámetros variables

25. ¿Para qué sirve `params` en una firma de método?
- [x] Para aceptar una cantidad variable de argumentos del mismo tipo.
- [ ] Para obligar a pasar los argumentos por referencia.
- [ ] Para declarar parámetros opcionales con nombre.

---

### Función local estática

26. ¿Qué ventaja tiene declarar una función local como `static`?
- [ ] Permite modificar cualquier variable externa sin restricciones.
- [x] Evita capturas accidentales del contexto externo y puede ser más eficiente.
- [ ] Hace que la función sea visible desde toda la clase.

---

### Delegados multicast

27. ¿Qué efecto produce usar `+=` sobre un delegado multicast?
- [ ] Reemplaza el método actual por el nuevo.
- [ ] Convierte el delegado en un evento automáticamente.
- [x] Agrega otro método a la lista de invocación del delegado.

---

## Clases y objetos en C#

### Constructor por defecto

28. ¿Qué pasa con el constructor por defecto cuando una clase declara al menos un constructor explícito?
- [ ] Sigue existiendo siempre de forma implícita.
- [ ] Se transforma automáticamente en `private`.
- [x] Deja de generarse implícitamente y hay que declararlo a mano si se necesita.

---

### Delegación entre constructores

29. ¿Para qué se usa `: this(...)` en un constructor?
- [x] Para llamar a otro constructor de la misma clase y reutilizar lógica de inicialización.
- [ ] Para invocar un método estático antes de crear el objeto.
- [ ] Para indicar que el constructor es opcional.

---

### Primary constructor

30. ¿Qué afirmación es correcta sobre el primary constructor en una clase?
- [ ] Crea propiedades públicas automáticamente igual que un `record`.
- [x] Hace que los parámetros estén disponibles en todo el cuerpo de la clase, pero no crea propiedades por sí solo.
- [ ] Sólo puede usarse en clases abstractas.

---

### Auto-propiedades

31. ¿Qué significa esta propiedad?

```csharp
public int Stock { get; private set; }
```

- [ ] Que nadie puede leer `Stock` desde afuera.
- [ ] Que `Stock` sólo puede asignarse en el constructor.
- [x] Que puede leerse desde afuera, pero sólo escribirse desde dentro de la clase.

---

### Propiedades requeridas

32. ¿Qué busca garantizar `required` en una propiedad con `init`?
- [ ] Que la propiedad pueda cambiarse libremente durante toda la vida del objeto.
- [x] Que la propiedad sea obligatoria en el inicializador del objeto y el compilador lo verifique.
- [ ] Que la propiedad sólo pueda declararse en una interfaz.

---

## Interfaces y contratos en C#

### Idea central de interfaz

33. ¿Qué expresa principalmente una interfaz en C#?
- [ ] Qué campos privados comparte una jerarquía de tipos.
- [ ] Cómo está implementada internamente una clase.
- [x] Un contrato de comportamiento: qué puede hacer un tipo.

---

### Miembros permitidos

34. ¿Cuál de estos elementos NO puede tener una interfaz?
- [ ] Métodos sin implementación.
- [x] Campos o variables de instancia.
- [ ] Propiedades.

---

### Implementación múltiple

35. ¿Cuál es una ventaja clave de las interfaces frente a las clases abstractas?
- [x] Un tipo puede implementar múltiples interfaces distintas.
- [ ] Una interfaz puede tener constructores con parámetros.
- [ ] Una interfaz puede guardar estado compartido en campos.

---

### Métodos por defecto

36.  ¿Cómo se accede a un método por defecto definido en una interfaz?
- [ ] Siempre a través de la clase concreta, aunque no lo declare explícitamente.
- [ ] Sólo desde un constructor estático.
- [x] A través de una referencia tipada como la interfaz.

---

### Interfaz vs clase abstracta

37. Si varios tipos comparten sólo un contrato de comportamiento, pero no estado común, ¿Qué conviene usar?
- [ ] Una clase abstracta con campos protegidos obligatorios.
- [ ] Un `record struct`.
- [x] Una interfaz.

---

## Tipos compuestos y colecciones en C#

### Inmutabilidad de string

38. ¿Qué pasa cuando se ejecuta `ToUpper()` sobre un `string`?
- [ ] Se modifica el mismo objeto original.
- [x] Se crea un nuevo string y el original queda igual.
- [ ] El resultado depende de si la variable fue declarada con `var`.

---

### StringBuilder

39. ¿Cuándo conviene usar `StringBuilder`?
- [ ] Cuando quiero comparar strings ignorando mayúsculas y minúsculas.
- [ ] Cuando necesito acceder a un carácter por índice.
- [x] Cuando voy construyendo un texto de forma incremental y quiero evitar muchas asignaciones intermedias.

---

### List

40. ¿Qué garantiza escribir `List<string>`?
- [ ] Que la lista tendrá tamaño fijo.
- [x] Que la lista sólo podrá contener valores de tipo `string`.
- [ ] Que la lista se ordenará automáticamente.

---

### Dictionary<TKey, TValue>

41. ¿Qué ventaja tiene `TryGetValue` frente al acceso directo con `diccionario[clave]`?
- [ ] Permite modificar varias claves a la vez.
- [ ] Obliga a recorrer el diccionario completo antes de leer.
- [x] Evita una excepción si la clave no existe y permite consultar de forma segura.

---

### Record

42. ¿Qué diferencia clave muestra el apunte entre `class` y `record`?
- [x] `record` compara por valor y `class`, en ese ejemplo, compara por referencia.
- [ ] `record` no puede tener métodos.
- [ ] `class` siempre es inmutable y `record` siempre es mutable.

---

## Null y tipos anulables en C#

### Null en tipos por referencia y valor

43. ¿Cuál de estas declaraciones es válida?

```csharp
string nombre = null;
int edad = null;
int? codigo = null;
```

- [ ] Sólo la segunda.
- [x] La primera y la tercera.
- [ ] Las tres.

---

### Nullable value type

44. ¿Qué representa `int?` en C#?
- [ ] Un entero que siempre vale 0 por defecto.
- [ ] Un alias para `string`.
- [x] Un tipo por valor que puede contener un `int` o `null`.

---

### Operador `?.`

45. ¿Qué hace el operador `?.`?
- [x] Accede a un miembro sólo si el objeto no es `null`; si es `null`, retorna `null`.
- [ ] Fuerza al compilador a ignorar warnings de null.
- [ ] Reemplaza automáticamente `null` por una cadena vacía.

---

### Operador `??`

46. ¿Qué devuelve esta expresión si `nombre` es `null`?

```csharp
string display = nombre ?? "Anónimo";
```

- [ ] `null`
- [ ] Lanza una excepción
- [x] `"Anónimo"`

---

### Buenas prácticas con null

47. ¿Qué conviene preferir para verificar null?
- [ ] `valor == null`, porque nunca puede ser sobrecargado
- [ ] `valor!`, porque resuelve el null en tiempo de ejecución
- [x] `valor is null` o `valor is not null`

---

# Examen de enumeraciones en C#

## Enumeraciones en C#

---

### Concepto de enum

48) ¿Qué representa un `enum` en C#?

- [ ] Un tipo dinámico que puede recibir cualquier valor durante la ejecución.
- [x] Un tipo que define un conjunto finito de constantes con nombre.
- [ ] Una colección que guarda objetos creados en el heap.

---

### Valores automáticos

49) En este enum, ¿Qué valor entero tiene `Miercoles`?

```csharp
public enum DiaSemana {
    Lunes,
    Martes,
    Miercoles,
    Jueves
}
```

- [ ] `1`
- [ ] `3`
- [x] `2`

---

### Tipo subyacente

50) ¿Cuál es el tipo entero subyacente predeterminado de un enum en C#?

- [x] `int`
- [ ] `short`
- [ ] `byte`

---

### Uso de `var` con enums

51) ¿Qué tipo infiere el compilador para `mañana`?

```csharp
var mañana = DiaSemana.Jueves;
```

- [ ] `int`
- [x] `DiaSemana`
- [ ] `string`

---

### Conversión desde entero

52) ¿Qué ocurre con este código?

```csharp
EstadoOrden raro = (EstadoOrden)50;
```

- [ ] Lanza una excepción porque `50` no está definido.
- [ ] Convierte automáticamente `50` al primer valor definido del enum.
- [x] Es válido aunque `50` no corresponda a un miembro definido.

---

### Validación de valores

53) ¿Para qué sirve `Enum.IsDefined`?

- [x] Para verificar que un valor corresponda a un miembro definido del enum.
- [ ] Para convertir un enum en `string` sin usar `ToString`.
- [ ] Para obtener el tipo subyacente de un enum.

---

### Parseo seguro

54) ¿Cuál es la ventaja de `Enum.TryParse<T>()` frente a `Enum.Parse<T>()`?

- [ ] `TryParse` solo funciona con números enteros.
- [x] `TryParse` permite intentar la conversión sin lanzar excepción si falla.
- [ ] `TryParse` modifica el enum original si encuentra el valor.

---

### Reflexión sobre enums

55) ¿Qué devuelve `Enum.GetValues<DiaSemana>()`?

- [ ] Los nombres del enum como arreglo de `string`.
- [ ] El valor entero más alto definido en el enum.
- [x] Todos los valores definidos del enum `DiaSemana`.

---

### Flags

56) En un enum con `[Flags]`, ¿por qué los miembros principales deben usar potencias de 2?

- [x] Para que cada opción ocupe un bit distinto y las combinaciones no se superpongan.
- [ ] Para que el enum siempre se serialice como texto en JSON.
- [ ] Para que `Enum.Parse` ignore mayúsculas automáticamente.

---

### Operaciones con flags

57) Si `editor` contiene `Permiso.Leer | Permiso.Escribir`, ¿Qué resultado produce esta expresión?

```csharp
bool puedeEscribir = (editor & Permiso.Escribir) != 0;
```

- [ ] `false`, porque `&` quita el permiso indicado.
- [x] `true`, porque `editor` incluye el permiso `Escribir`.
- [ ] Da error, porque los enums no pueden combinarse con operadores.

---

### Serialización JSON

58) ¿Qué efecto tiene usar `JsonStringEnumConverter` al serializar un enum con `System.Text.Json`?

- [ ] Hace que el enum se guarde siempre como número.
- [ ] Impide deserializar el valor nuevamente.
- [x] Permite serializar el enum como texto, por ejemplo `"Pasaporte"`.

---

### Buenas prácticas

59) ¿Por qué conviene definir un valor `0` significativo en un enum?

- [x] Porque `default` produce `0`, y es mejor que ese valor tenga un nombre explícito.
- [ ] Porque C# no permite enums cuyo primer valor sea distinto de `0`.
- [ ] Porque los enums con valor `0` se convierten automáticamente en `[Flags]`.

---

### Descripciones amigables

60) ¿Para qué se usa `[Description]` en miembros de un enum?

- [ ] Para cambiar el valor entero subyacente del miembro.
- [x] Para asociar un texto más amigable que el nombre del miembro.
- [ ] Para convertir automáticamente el enum en un conjunto abierto.

---

### Pattern matching

61) En este `switch`, ¿Qué color devuelve `ColorIndicador(Prioridad.Alta)`?

```csharp
static string ColorIndicador(Prioridad p) => p switch {
    Prioridad.Critica or Prioridad.Alta => "rojo",
    Prioridad.Media                     => "amarillo",
    Prioridad.Baja                      => "verde",
    _                                   => "gris"
};
```

- [ ] `"amarillo"`
- [ ] `"gris"`
- [x] `"rojo"`

---

### Enums de .NET

62) ¿Qué enum de .NET se usa para indicar códigos HTTP como `OK`, `NotFound` o `InternalServerError`?

- [x] `HttpStatusCode`
- [ ] `TaskStatus`
- [ ] `SeekOrigin`

---

### Máquinas de estado

63) ¿Por qué un enum resulta útil para modelar una máquina de estados?

- [ ] Porque permite agregar estados nuevos desde datos externos sin cambiar el código.
- [ ] Porque evita tener que definir transiciones válidas.
- [x] Porque permite representar estados posibles con nombre y controlar transiciones entre ellos.

---

### Conjuntos abiertos

64) ¿Por qué no conviene usar un enum para una lista de países que cambia constantemente?

- [ ] Porque los enums no pueden tener nombres como `Argentina` o `Brasil`.
- [x] Porque el conjunto de valores es abierto y el enum se vuelve difícil de mantener.
- [ ] Porque un enum solo puede tener dos valores posibles.

---

# Examen de strings en C#

## Strings en C#

--- 

### Tipo `string`

65) ¿Qué representa un `string` en C#?

- [ ] Un número entero usado para almacenar códigos Unicode.
- [x] Texto, aunque internamente sea un tipo de referencia con comportamiento especial.
- [ ] Una lista mutable de caracteres que se modifica siempre en el mismo objeto.

---

### Interpolación

66) ¿Qué valor queda en `mensaje`?

```csharp
string nombre = "Ada";
int edad = 20;
string mensaje = $"{nombre} tiene {edad} años";
```

- [ ] `"{nombre} tiene {edad} años"`
- [ ] `"Ada tiene edad años"`
- [x] `"Ada tiene 20 años"`

---

### Verbatim strings

67) ¿Para qué sirve el prefijo `@` en este string?

```csharp
string ruta = @"C:\Users\Ada\Documentos";
```

- [x] Para escribir barras invertidas sin escaparlas.
- [ ] Para convertir la ruta en una interpolación automática.
- [ ] Para hacer que el string sea mutable.

---

### Raw string literals

68) ¿Cuál es una ventaja de usar `"""` para escribir JSON en C#?

- [ ] Obliga a escribir todas las comillas dobles con `\"`.
- [x] Permite escribir JSON con saltos de línea y comillas dobles sin escaparlas.
- [ ] Convierte automáticamente el JSON en un objeto.

---

### Inmutabilidad

69) ¿Qué ocurre en este código?

```csharp
string nombre = "Ana";
nombre = nombre + " María";
```

- [ ] Se modifica el objeto original `"Ana"` carácter por carácter.
- [ ] C# prohíbe concatenar strings porque son inmutables.
- [x] Se crea un nuevo string y la variable `nombre` pasa a apuntar a ese nuevo valor.

---

### `StringBuilder`

70) ¿Cuándo conviene usar `StringBuilder`?

- [x] Cuando se construye mucho texto con muchas concatenaciones, por ejemplo dentro de un bucle.
- [ ] Siempre que haya que comparar dos strings.
- [ ] Cuando se necesita convertir un número a texto una sola vez.

---

### Conversión a texto

71) En una interpolación como `$"El punto es {p}"`, ¿Qué permite que un objeto propio tenga una representación textual personalizada?

- [ ] Definir una propiedad llamada `Text`.
- [x] Sobrescribir el método `ToString()`.
- [ ] Convertir el objeto a `char`.

---

### Igualdad

72) ¿Qué imprime este código?

```csharp
string a = "hola";
string b = "hola";

Console.WriteLine(a == b);
```

- [ ] `false`, porque `string` siempre compara referencias con `==`.
- [ ] Da error, porque los strings no se comparan con `==`.
- [x] `true`, porque en `string` `==` compara el contenido.

---

### Comparación sin mayúsculas

73) ¿Qué opción es adecuada para comparar textos ignorando mayúsculas en un caso técnico como claves o comandos?

- [x] `StringComparison.OrdinalIgnoreCase`
- [ ] `StringComparison.CurrentCulture`
- [ ] `CompareTo` sin parámetros

---

### Null y vacío

74) ¿Qué método devuelve `true` para `null`, `""` y `"   "`?

- [ ] `string.IsNullOrEmpty`
- [x] `string.IsNullOrWhiteSpace`
- [ ] `TrimStart`

---

### Métodos comunes

75) ¿Qué devuelve `IndexOf` cuando no encuentra el texto buscado?

- [ ] `0`
- [ ] `null`
- [x] `-1`

---

### Unicode y emojis

76) ¿Por qué `"😀".Length` devuelve `2` en C#?

- [x] Porque `Length` cuenta unidades `char` de 16 bits, y ese emoji usa un par sustituto.
- [ ] Porque el emoji contiene dos caracteres visibles.
- [ ] Porque todos los strings en C# duplican su longitud.

---

### Recorrido Unicode

77) ¿Qué herramienta permite recorrer code points Unicode completos, uniendo correctamente los pares sustitutos?

- [ ] `foreach (char c in texto)`
- [x] `texto.EnumerateRunes()`
- [ ] `texto.Trim()`

---

### Longitud visible

78) ¿Qué permite obtener `new StringInfo(texto).LengthInTextElements`?

- [ ] La cantidad de bytes ocupados por el string.
- [ ] La cantidad de líneas del string.
- [x] La cantidad de caracteres visibles reales.

---

### `Trim`

79) ¿Qué imprime este código?

```csharp
string texto = "  hola  ";
Console.WriteLine(texto.Trim());
```

- [x] `"hola"`
- [ ] `"hola  "`
- [ ] `"  hola"`

---

### `Split`

80) ¿Qué resultado produce `datos.Split(',')`?

```csharp
string datos = "Ana,Luis,Pedro";
string[] nombres = datos.Split(',');
```

- [ ] Un único string: `"Ana Luis Pedro"`.
- [x] Un array con `"Ana"`, `"Luis"` y `"Pedro"`.
- [ ] Un número con la cantidad de comas encontradas.

---

### `string.Join`

81) ¿Qué valor queda en `resultado`?

```csharp
string[] nombres = { "Ana", "Luis", "Pedro" };
string resultado = string.Join(", ", nombres);
```

- [ ] `"AnaLuisPedro"`
- [ ] `"Ana,Luis,Pedro"`
- [x] `"Ana, Luis, Pedro"`

---

### Rangos

82) ¿Qué imprime este código?

```csharp
string texto = "Programación III";
Console.WriteLine(texto[13..]);
```

- [ ] `"Programación"`
- [x] `"III"`
- [ ] `"n III"`

---

### Normalización Unicode

83) ¿Para qué puede servir `Normalize()` al comparar strings?

- [ ] Para quitar todos los acentos del texto.
- [ ] Para convertir siempre el texto a mayúsculas.
- [x] Para unificar representaciones Unicode distintas que se ven igual.

---

# Examen de null, archivos, CLI y colecciones en C#

## Archivos de texto, rutas y encoding en C#

### Lectura por defecto

84) ¿Qué encoding usa por defecto `File.ReadAllText("datos.txt")`?
- [ ] ASCII
- [ ] Unicode UTF-16
- [x] UTF-8

---

### Escritura al final

85) Si querés agregar texto al final de un archivo sin reemplazar su contenido, ¿Qué método conviene usar?
- [x] `File.AppendAllText(...)`
- [ ] `File.ReadAllText(...)`
- [ ] `Directory.GetFiles(...)`

---

### Existencia de archivos

86) ¿Qué devuelve `File.Exists("entrada.txt")`?
- [ ] El contenido del archivo si existe.
- [x] Un `bool` indicando si el archivo existe o no.
- [ ] Una excepción cuando el archivo no existe.

---

### Listado de archivos

87) ¿Para qué sirve `Directory.GetFiles("mis-archivos", "*.txt")`?
- [ ] Para borrar todos los `.txt` de la carpeta.
- [ ] Para crear archivos `.txt` nuevos.
- [x] Para obtener un array con las rutas de los archivos `.txt` de esa carpeta.

---

### Crear carpetas

88) ¿Qué comportamiento destaca el apunte sobre `Directory.CreateDirectory("datos/salidas/2026")`?
- [ ] Sólo funciona si la carpeta padre ya existe.
- [ ] Borra la carpeta anterior y la crea de nuevo.
- [x] Puede crear una ruta completa y no falla si la carpeta ya existe.

---

## Tutorial de CLI en C#: `sumx` en un solo archivo

### Hoja de ruta

89) En la hoja de ruta de `sumx`, ¿Qué se hace antes de construir el reporte?
- [ ] Escribir el output final.
- [ ] Mostrar la ayuda del programa.
- [x] Calcular las sumas.

---

### Modelo de datos

90) ¿Por qué el tutorial usa un `record AppConfig(...)`?
- [x] Porque es una forma compacta e inmutable de representar la configuración del comando.
- [ ] Porque un `record` permite heredar de múltiples clases.
- [ ] Porque un `record` sólo puede contener números y strings.

---

### Parseo de argumentos

91) ¿Para qué se pasa `ref int i` a la función `Next`?
- [ ] Para que `Next` convierta el argumento en `int`.
- [x] Para que `Next` pueda avanzar el índice del recorrido de argumentos.
- [ ] Para que `Next` detecte automáticamente `--help`.

---

### Entrada y salida

92) ¿Qué hace `ReadInput` cuando `filePath == null`?
- [ ] Lanza siempre una excepción.
- [ ] Crea un archivo temporal vacío.
- [x] Lee desde `Console.In`, lo que permite usar stdin y redirección.

---

### Parseo de CSV

93) ¿Qué devuelve `ParseCsv(string content)` en el tutorial?
- [x] Una tupla con los encabezados y una lista de filas representadas como diccionarios.
- [ ] Un único string ya formateado como reporte.
- [ ] Sólo un `Dictionary<string, double>` con las sumas.

---

## Tipos compuestos y colecciones en C# (copia de trabajo)

### Inmutabilidad de string

94) ¿Qué pasa cuando se ejecuta `ToUpper()` sobre un `string`?
- [ ] El string original se modifica en el mismo objeto.
- [x] Se crea un nuevo string y el original permanece igual.
- [ ] Sólo funciona si el string fue declarado con `var`.

---

### Tuplas

95) ¿En qué caso recomienda el apunte usar tuplas?
- [ ] Cuando el dato va a circular por muchas capas del sistema.
- [x] Cuando querés agrupar datos temporalmente o devolver múltiples valores de un método.
- [ ] Cuando necesitás comportamiento complejo y métodos propios.

---

### Arrays

96) ¿Cuál es una característica clave de un array en C#?
- [x] Tiene tamaño fijo definido al momento de crearlo.
- [ ] Puede crecer y reducirse automáticamente como `List<T>`.
- [ ] Sólo puede contener `string`.

---

### List<T>

97) ¿Qué ventaja principal tiene `List<T>` frente a un array?
- [ ] Guarda pares clave → valor.
- [ ] Es siempre inmutable.
- [x] Puede crecer o reducirse en tiempo de ejecución.

---

### Record

98) ¿Qué resalta el apunte sobre `record` frente a `class` en el ejemplo dado?
- [ ] `record` no puede tener propiedades calculadas.
- [ ] `record` compara por referencia igual que `class`.
- [x] `record` ofrece igualdad por valor, mientras que la `class` del ejemplo compara por referencia.

---

# Examen de tipos compuestos y colecciones en C#

## Tipos compuestos y colecciones en C#

---

### Tipos compuestos

99) ¿Para qué sirven los tipos compuestos en C#?

- [ ] Para guardar únicamente números enteros.
- [x] Para agrupar o coleccionar datos que van más allá de un único valor simple.
- [ ] Para reemplazar todos los métodos por variables globales.

---

### Arrays

100) ¿Cuál es una característica de un array `T[]`?

- [ ] Puede cambiar de tamaño automáticamente al agregar elementos.
- [ ] Permite guardar valores de cualquier tipo mezclados sin restricciones.
- [x] Guarda elementos del mismo tipo y su tamaño queda fijo al crearlo.

---

### Índices de arrays

101) Si un array tiene 5 elementos, ¿cuál es su última posición válida?

- [x] `4`
- [ ] `5`
- [ ] `-1`

---

### Índice desde el final

102) ¿Qué valor queda en `penultimo`?

```csharp
int[] numeros = [10, 20, 30, 40, 50];
int penultimo = numeros[^2];
```

- [ ] `20`
- [x] `40`
- [ ] `50`

---

### Rangos en arrays

103) ¿Qué contiene `primerosTres`?

```csharp
int[] numeros = [10, 20, 30, 40, 50, 60];
var primerosTres = numeros[0..3];
```

- [ ] `[10, 20]`
- [ ] `[10, 20, 30, 40]`
- [x] `[10, 20, 30]`

---

### Recorrido

104) ¿Cuándo conviene usar un `for` en lugar de `foreach` al recorrer una colección?

- [x] Cuando hace falta trabajar con la posición o índice del elemento.
- [ ] Cuando la colección tiene elementos repetidos.
- [ ] Cuando se quiere impedir que el compilador conozca el tipo.

---

### `List<T>`

105) ¿Cuál es una diferencia clave entre `List<T>` y un array?

- [ ] `List<T>` usa `Length` y el array usa `Count`.
- [x] `List<T>` puede crecer o reducirse en ejecución; el array tiene tamaño fijo.
- [ ] `List<T>` no permite acceder por índice.

---

### Métodos de lista

106) ¿Qué hace `items.Insert(0, "Omega")` en una lista?

- [ ] Elimina el elemento de la posición `0`.
- [ ] Reemplaza todos los elementos por `"Omega"`.
- [x] Inserta `"Omega"` en la posición `0`.

---

### LINQ

107) ¿Qué significa la evaluación diferida en una consulta LINQ?

- [x] Que la consulta no se ejecuta al definirla, sino al iterar el resultado o pedir valores como `ToList()` o `Count()`.
- [ ] Que la consulta se ejecuta dos veces automáticamente.
- [ ] Que LINQ solo puede usarse con arrays, no con listas.

---

### Tipos genéricos

108) En `List<string>`, ¿Qué representa `string`?

- [ ] El nombre interno de la lista.
- [x] El parámetro de tipo que indica que la lista contiene strings.
- [ ] El valor inicial de todos los elementos.

---

### Tuplas

109) ¿Para qué sirve una tupla como `(Nombre: "Ada", Edad: 20)`?

- [ ] Para definir una clase pública reutilizable entre muchas capas.
- [ ] Para crear una colección dinámica con tamaño variable.
- [x] Para agrupar varios valores rápidamente sin definir una clase.

---

### Deconstrucción

110) ¿Qué valor queda en `soloY`?

```csharp
var punto = (X: 10.5, Y: 3.2);
var (_, soloY) = punto;
```

- [x] `3.2`
- [ ] `10.5`
- [ ] `_`

---

### Tipos anónimos

111) ¿Por qué una variable con tipo anónimo debe declararse con `var`?

- [ ] Porque sus propiedades son modificables después de creado.
- [x] Porque el compilador genera internamente el tipo y el código fuente no ve su nombre.
- [ ] Porque los tipos anónimos solo pueden guardar strings.

---

### Records

112) ¿Cuál es una diferencia clave entre `record` y `class` según el ejemplo del apunte?

- [ ] `record` compara siempre por referencia y `class` por valor.
- [ ] `record` no puede tener propiedades.
- [x] `record` compara por valor, mientras que una `class` común compara por referencia.

---

### Expresión `with`

113) ¿Qué ocurre con `original` en este código?

```csharp
var original = new Persona("Ana", 25);
var cumpleaños = original with { Edad = 26 };
```

- [x] `original` conserva `Edad = 25` y se crea una copia con `Edad = 26`.
- [ ] `original` cambia su edad a `26`.
- [ ] El código es inválido porque los records no admiten copias.

---

### Diccionarios

114) ¿Qué almacena un `Dictionary<TKey, TValue>`?

- [ ] Una secuencia de valores sin orden y sin claves.
- [x] Pares clave → valor, donde cada clave es única.
- [ ] Solo valores numéricos ordenados por índice.

---

### Acceso seguro en diccionarios

115) ¿Qué ventaja tiene `TryGetValue` frente al acceso directo con `telefonos["Pedro"]`?

- [ ] Ordena automáticamente el diccionario por clave.
- [ ] Elimina la clave si no existe.
- [x] Permite consultar sin lanzar excepción cuando la clave no existe.

---

### `HashSet<T>`

116) ¿Qué caracteriza a un `HashSet<T>`?

- [x] Almacena elementos únicos y permite verificar pertenencia de forma eficiente.
- [ ] Guarda pares clave → valor.
- [ ] Mantiene siempre los elementos ordenados por inserción.

---

### Operaciones de conjuntos

117) ¿Qué resultado produce `IntersectWith` entre `{ 1, 2, 3, 4 }` y `{ 3, 4, 5, 6 }`?

- [ ] `{ 1, 2, 5, 6 }`
- [x] `{ 3, 4 }`
- [ ] `{ 1, 2, 3, 4, 5, 6 }`

---

### Métodos de `Array`

118) ¿Por qué se escribe `Array.Sort(numeros)` en lugar de `numeros.Sort()`?

- [ ] Porque los arrays no pueden ordenarse en C#.
- [x] Porque muchas operaciones sobre arrays están concentradas como métodos estáticos de `Array`.
- [ ] Porque `Sort` solo funciona con `List<T>`.

---

### Arrays multidimensionales

119) ¿Qué imprime este código?

```csharp
int[,] matriz =
{
    { 1, 2, 3 },
    { 4, 5, 6 },
    { 7, 8, 9 }
};

Console.WriteLine(matriz[1, 2]);
```

- [ ] `5`
- [ ] `8`
- [x] `6`

---

### Jagged arrays

120) ¿Qué caracteriza a un jagged array como `int[][] triangulo`?

- [x] Es un array de arrays, donde cada fila puede tener distinto largo.
- [ ] Es un array rectangular donde todas las filas deben tener el mismo largo.
- [ ] Es un diccionario que usa enteros como claves.

---

### Igualdad en tipos anónimos

121) ¿Qué imprime este código?

```csharp
var a = new { Nombre = "Ana", Edad = 25 };
var b = new { Nombre = "Ana", Edad = 25 };

Console.WriteLine(a.Equals(b));
```

- [ ] `False`, porque los tipos anónimos siempre comparan por referencia.
- [x] `True`, porque tienen las mismas propiedades con el mismo nombre, tipo y orden.
- [ ] Da error, porque los tipos anónimos no tienen `Equals`.

---

### Variantes de diccionario

122) ¿Qué variante de diccionario conviene cuando se necesitan claves ordenadas?

- [ ] `ConcurrentDictionary<K,V>`
- [x] `SortedDictionary<K,V>`
- [ ] `OrderedDictionary<K,V>`

---

### Modificación de arrays

123) ¿Qué ocurre al ejecutar este código?

```csharp
int[] numeros = { 10, 20, 30 };
numeros[1] = 99;
```

- [ ] Da error porque los arrays son inmutables como `string`.
- [ ] Cambia el tamaño del array y agrega `99` al final.
- [x] Modifica el segundo elemento y el array queda `{ 10, 99, 30 }`.

---

### Rangos desde el final

124) ¿Qué contiene `ultimosDos`?

```csharp
int[] numeros = [10, 20, 30, 40, 50, 60];
var ultimosDos = numeros[^2..];
```

- [x] `[50, 60]`
- [ ] `[40, 50]`
- [ ] `[10, 20]`

---

### Métodos de `Array`

125) ¿Qué hace `Array.Clear(numeros)` sobre un array?

- [ ] Elimina el array de memoria y deja la variable sin valor.
- [x] Reemplaza todos los elementos por el valor por defecto del tipo.
- [ ] Ordena el array de menor a mayor.

---

### `AddRange`

126) ¿Para qué sirve `items.AddRange(["Epsilon", "Zeta"])` en una `List<string>`?

- [ ] Para reemplazar toda la lista por esos dos valores.
- [ ] Para insertar un solo string que contiene corchetes y comas.
- [x] Para agregar varios elementos a la lista en una sola operación.

---

### `RemoveAll`

127) ¿Qué hace `items.RemoveAll(x => x.Length > 4)`?

- [x] Elimina todos los elementos cuya longitud sea mayor que 4.
- [ ] Devuelve una lista nueva y deja `items` sin cambios.
- [ ] Elimina únicamente el primer elemento de longitud mayor que 4.

---

### Restricciones genéricas

128) ¿Para qué sirve una restricción como `where T : INumber<T>` en un método genérico?

- [ ] Para indicar que `T` debe ser siempre `string`.
- [x] Para decirle al compilador que `T` es numérico y habilitar operaciones aritméticas.
- [ ] Para impedir que el método reciba arrays.

---

### Pattern matching con tuplas

129) En una expresión `switch` sobre una tupla `(Edad, EsVip)`, ¿qué representa el patrón `(< 18, _)`?

- [ ] Un cliente adulto que siempre es VIP.
- [ ] Un cliente con edad desconocida.
- [x] Cualquier menor de edad, sin importar el valor de `EsVip`.

---

### Acceso directo en diccionarios

130) ¿Qué puede ocurrir al usar `telefonos["Pedro"]` si la clave `"Pedro"` no existe?

- [x] Se lanza una `KeyNotFoundException`.
- [ ] Se devuelve automáticamente un string vacío.
- [ ] Se crea la clave `"Pedro"` con valor `null`.

---

### Unión de conjuntos

131) ¿Qué resultado produce `UnionWith` entre `{ 1, 2, 3, 4 }` y `{ 3, 4, 5, 6 }`?

- [ ] `{ 3, 4 }`
- [x] `{ 1, 2, 3, 4, 5, 6 }`
- [ ] `{ 1, 2 }`

---

# Examen de clases y objetos en C#

## Clases y objetos en C#

---

### Concepto de clase

132) ¿Qué describe una clase en C#?

- [ ] Solo una lista de valores numéricos consecutivos.
- [x] La estructura y el comportamiento de un objeto: qué datos guarda y qué operaciones realiza.
- [ ] Un archivo que no puede contener métodos.

---

### Orden de miembros

133) ¿Cuál es un orden convencional para organizar los bloques dentro de una clase?

- [ ] Métodos privados, propiedades, constructores, campos privados, métodos públicos.
- [ ] Propiedades, métodos públicos, campos privados, métodos privados, constructores.
- [x] Campos privados, constructores, propiedades, métodos públicos, métodos privados.

---

### Constructores

134) ¿Qué caracteriza a un constructor?

- [x] Se invoca al crear un objeto con `new`, tiene el mismo nombre que la clase y no tiene tipo de retorno.
- [ ] Se ejecuta cada vez que se lee una propiedad.
- [ ] Siempre debe devolver una instancia con `return`.

---

### Constructor por defecto

135) ¿Qué ocurre con el constructor por defecto cuando una clase declara al menos un constructor propio?

- [ ] El compilador genera dos constructores por defecto.
- [x] El constructor por defecto implícito desaparece y hay que declararlo a mano si se necesita.
- [ ] La clase deja de poder instanciarse con `new`.

---

### Constructor delegado

136) ¿Para qué se usa `: this(...)` en un constructor?

- [ ] Para llamar al constructor de la clase base.
- [ ] Para convertir una clase en estática.
- [x] Para llamar a otro constructor de la misma clase y reutilizar lógica de inicialización.

---

### Primary constructor

137) En una clase con primary constructor, ¿Qué son sus parámetros?

```csharp
public class Punto(double x, double y) {
    public double X => x;
    public double Y => y;
}
```

- [x] Variables disponibles en todo el cuerpo de la clase.
- [ ] Propiedades públicas creadas automáticamente, igual que en un `record`.
- [ ] Campos estáticos compartidos por todas las instancias.

---

### Inicializador de objeto

138) ¿Qué permite hacer un inicializador de objeto?

- [ ] Crear una clase sin constructor.
- [x] Asignar propiedades después de construir el objeto, de forma concisa y legible.
- [ ] Ejecutar un método privado desde fuera de la clase.

---

### Propiedad completa

139) ¿Qué ventaja ofrece una propiedad con `get` y `set` explícitos?

- [ ] Hace que el campo sea público automáticamente.
- [ ] Impide cualquier validación al asignar valores.
- [x] Permite agregar lógica, como validar antes de guardar el valor.

---

### Auto-propiedad

140) ¿Qué significa esta propiedad?

```csharp
public int Stock { get; private set; }
```

- [x] Se puede leer desde fuera, pero solo se puede escribir desde dentro de la clase.
- [ ] Se puede escribir libremente desde cualquier parte.
- [ ] Solo se puede asignar en un inicializador `new { }`.

---

### `init`

141) ¿Qué permite una propiedad `{ get; init; }`?

- [ ] Modificar la propiedad en cualquier momento después de construido el objeto.
- [x] Asignar la propiedad durante la creación del objeto, pero no modificarla después.
- [ ] Convertir la propiedad en un método estático.

---

### `required`

142) ¿Qué efecto tiene `required` en una propiedad?

- [ ] Hace que la propiedad sea opcional si tiene valor `null`.
- [ ] Permite omitirla siempre que exista un constructor.
- [x] Obliga a asignarla en el inicializador y el compilador lo verifica.

---

### Indexadores

143) ¿Para qué sirve un indexador como `public string this[int index]`?

- [x] Para permitir acceso con sintaxis tipo `objeto[indice]`.
- [ ] Para hacer que una clase herede de `string`.
- [ ] Para ejecutar un constructor estático.

---

### Parámetros opcionales

144) ¿Qué valor usa `exp` en esta llamada?

```csharp
public double Potencia(double baseValor, double exp = 2) => Math.Pow(baseValor, exp);

calc.Potencia(2);
```

- [ ] `0`
- [x] `2`
- [ ] `null`

---

### Sobrecarga

145) ¿Qué es la sobrecarga de métodos?

- [ ] Reemplazar un método virtual en una clase derivada.
- [x] Definir varios métodos con el mismo nombre pero distintos parámetros.
- [ ] Ocultar un método base usando `new`.

---

### Miembros estáticos

146) ¿A qué pertenece un miembro `static`?

- [x] A la clase, no a una instancia particular.
- [ ] A cada objeto creado con `new`.
- [ ] Solo a las clases abstractas.

---

### Clase estática

147) ¿Qué caracteriza a una clase marcada como `static`?

- [ ] Puede instanciarse con `new`, pero solo una vez.
- [ ] Puede contener campos de instancia y métodos estáticos.
- [x] No puede instanciarse y solo puede contener miembros estáticos.

---

### Constructor estático

148) ¿Cuándo se ejecuta un constructor estático?

- [ ] Cada vez que se crea una instancia.
- [x] Una sola vez, antes del primer uso de la clase.
- [ ] Cada vez que se llama a cualquier método de instancia.

---

### Operadores

149) Si una clase sobrecarga `==`, ¿Qué más debería sobrecargar?

- [x] `!=`, `Equals` y `GetHashCode`.
- [ ] Solo `ToString`.
- [ ] Todos los operadores aritméticos.

---

### Conversiones

150) ¿Cuándo conviene usar una conversión `explicit`?

- [ ] Cuando la conversión es siempre segura y natural.
- [ ] Cuando no se quiere escribir ningún cast.
- [x] Cuando la conversión puede perder información o fallar.

---

### Herencia

151) ¿Qué relación debería modelar la herencia entre una clase derivada y una clase base?

- [x] Una relación "es un".
- [ ] Una relación "tiene muchos".
- [ ] Una relación "usa temporalmente".

---

### `base(...)`

152) ¿Para qué se usa `base(...)` en el constructor de una clase derivada?

- [ ] Para llamar a otro constructor de la misma clase.
- [x] Para inicializar la clase base.
- [ ] Para impedir que la clase sea heredada.

---

### `protected`

153) ¿Qué permite el modificador `protected`?

- [ ] Acceso desde cualquier parte del programa.
- [ ] Acceso solo desde el mismo método.
- [x] Acceso dentro de la clase y desde sus clases derivadas.

---

### `sealed`

154) ¿Qué efecto tiene `sealed` aplicado a una clase?

- [x] Impide que otras clases hereden de ella.
- [ ] Obliga a que todos sus métodos sean abstractos.
- [ ] Permite herencia múltiple.

---

### Polimorfismo

155) En este código, ¿Qué se imprime al llamar `obj.A()`?

```csharp
public class Base {
    public virtual void A() => Console.WriteLine("Base.A");
}

public class Derivada : Base {
    public override void A() => Console.WriteLine("Derivada.A");
}

Base obj = new Derivada();
obj.A();
```

- [ ] `Base.A`, porque importa el tipo declarado de la variable.
- [x] `Derivada.A`, porque `override` usa despacho dinámico según el tipo real.
- [ ] Da error, porque una variable `Base` no puede apuntar a `Derivada`.

---

### `new` en métodos

156) ¿Qué diferencia tiene `new` frente a `override` en un método derivado?

- [ ] `new` participa del despacho dinámico igual que `override`.
- [x] `new` oculta el miembro base y la versión ejecutada depende del tipo declarado de la variable.
- [ ] `new` solo puede usarse en constructores.

---

### Clase abstracta

157) ¿Qué caracteriza a una clase `abstract`?

- [x] No puede instanciarse directamente y puede obligar a subclases a implementar métodos abstractos.
- [ ] Debe ser siempre `static`.
- [ ] No puede tener métodos concretos.

---

### Abstracta vs. interfaz

158) Según la regla práctica del apunte, ¿cuándo conviene usar una clase abstracta?

- [ ] Cuando solo se comparte un contrato de comportamiento sin estado.
- [x] Cuando los tipos comparten estado y comportamiento base.
- [ ] Cuando se necesita herencia múltiple de clases.

---

### Inmutabilidad

159) ¿Qué hace un método mutador en una clase inmutable bien diseñada?

- [ ] Modifica directamente el estado interno del objeto actual.
- [ ] Convierte el objeto en `static`.
- [x] Retorna un nuevo objeto en lugar de modificar el actual.

---

### DTO

160) ¿Qué es un DTO?

- [x] Un objeto cuyo propósito es transportar datos entre capas, sin comportamiento de negocio.
- [ ] Una clase abstracta que define operadores aritméticos.
- [ ] Un método de extensión para `string`.

---

### Extension methods

161) ¿Cómo se declaran los métodos de extensión clásicos antes de C# 14?

- [ ] En cualquier clase de instancia, usando `base` en el primer parámetro.
- [x] En clases estáticas, usando `this` en el primer parámetro.
- [ ] Únicamente dentro de una clase abstracta.

---

### Parámetros nombrados

162) ¿Qué permite una llamada como `Formatear(texto, trim: true, mayus: true)`?

- [ ] Crear una sobrecarga nueva en tiempo de ejecución.
- [ ] Convertir los argumentos opcionales en propiedades obligatorias.
- [x] Indicar explícitamente qué parámetro recibe cada valor y hacer la llamada más legible.

---

### Modificador `internal`

163) ¿Dónde es visible un miembro marcado como `internal`?

- [x] Dentro del mismo ensamblado o proyecto.
- [ ] Sólo dentro de la misma clase.
- [ ] Sólo en subclases de otro ensamblado.

---

### Modificador `private protected`

164) ¿Dónde es visible un miembro `private protected`?

- [ ] En cualquier código que use el mismo namespace.
- [x] En subclases dentro del mismo ensamblado.
- [ ] En cualquier clase derivada, sin importar el ensamblado.

---

### Métodos estáticos como factorías

165) ¿Qué expresa un método estático como `Temperatura.DesdeFahrenheit(212)`?

- [ ] Que el método modifica una instancia existente de `Temperatura`.
- [ ] Que sólo puede llamarse desde un constructor.
- [x] Que crea una instancia desde una representación alternativa sin necesitar un objeto previo.

---

### Conversión implícita

166) ¿Cuándo conviene definir una conversión `implicit`?

- [x] Cuando la conversión es segura y natural.
- [ ] Cuando la conversión puede perder información y debe ser explícita.
- [ ] Cuando se quiere impedir toda conversión entre tipos.

---

### `base` en métodos

167) ¿Para qué puede usarse `base.Descripcion()` dentro de un método sobreescrito?

- [ ] Para crear una instancia nueva de la clase base.
- [x] Para reutilizar la implementación del padre y agregar comportamiento.
- [ ] Para ocultar el método base sin polimorfismo.

---

### `sealed override`

168) ¿Qué efecto tiene `sealed override` sobre un método?

- [ ] Lo convierte en un método estático.
- [ ] Permite que cualquier subclase lo vuelva a sobreescribir.
- [x] Deja esa sobreescritura como final e impide nuevos overrides en subclases.

---

### `record`

169) ¿Por qué `record` suele ser una buena opción para DTOs simples?

- [x] Reduce boilerplate y aporta igualdad por valor, `ToString` automático y constructor primario.
- [ ] Permite agregar comportamiento de negocio complejo por defecto.
- [ ] Obliga a que el DTO sea mutable y compartido por referencia.

---

### `struct`

170) ¿Cuándo conviene considerar un `struct`?

- [ ] Cuando el objeto tiene muchas propiedades mutables y vida larga compartida.
- [x] Cuando el dato es pequeño, simple, inmutable y se entiende mejor como valor.
- [ ] Cuando se necesita herencia de clases.

---

### Extension types

171) ¿Qué agrega la sintaxis `extension ... for ...` de C# 14 frente al método de extensión clásico?

- [ ] Elimina la posibilidad de extender tipos de bibliotecas externas.
- [ ] Sólo permite agregar métodos, igual que el enfoque clásico.
- [x] Permite agregar también propiedades, propiedades estáticas y operadores.

---

# Examen de null y tipos anulables en C#

## Null y tipos anulables en C#

---

### Significado de `null`

172) ¿Qué representa `null` en C#?

- [ ] El número cero.
- [x] La ausencia de valor o que una variable no apunta a ningún objeto.
- [ ] Una cadena vacía.

---

### Error común

173) ¿Qué error puede producirse al usar una referencia `null` como si apuntara a un objeto?

- [ ] `InvalidCastException`
- [ ] `DivideByZeroException`
- [x] `NullReferenceException`

---

### Tipos por referencia

174) En una variable de tipo por referencia, ¿Qué significa `null`?

- [x] Que la variable no apunta a ningún objeto.
- [ ] Que la variable contiene el valor entero `0`.
- [ ] Que la variable contiene un objeto vacío creado automáticamente.

---

### Tipos por valor

175) ¿Qué ocurre con este código?

```csharp
int edad = null;
```

- [ ] `edad` queda con valor `0`.
- [x] Da error de compilación porque `int` no acepta `null` por defecto.
- [ ] `edad` se convierte automáticamente en `int?`.

---

### Nullable value types

176) ¿Qué permite la sintaxis `int?`?

- [ ] Declarar un `int` que solo puede valer `0`.
- [ ] Declarar un `int` que nunca puede ser `null`.
- [x] Declarar un valor que puede contener un `int` o `null`.

---

### `HasValue`

177) ¿Qué indica `edad.HasValue` si `edad` es `int?`?

- [x] Si `edad` contiene un valor distinto de `null`.
- [ ] Si `edad` es mayor que cero.
- [ ] Si `edad` fue inicializada con `new`.

---

### `.Value`

178) ¿Qué riesgo tiene usar `edad.Value` cuando `edad` es `int?`?

- [ ] Siempre devuelve `0` si `edad` es `null`.
- [x] Lanza `InvalidOperationException` si `edad` es `null`.
- [ ] Convierte `edad` en `string`.

---

### Comparaciones con null

179) ¿Qué resultado produce una comparación como `b < 10` si `b` es `int?` y vale `null`?

- [ ] `true`
- [ ] Lanza `NullReferenceException`.
- [x] `false`

---

### Nullable reference types

180) En C# con nullable reference types, ¿Qué diferencia expresa `string` frente a `string?`?

- [x] `string` se asume no nulo; `string?` puede ser `null`.
- [ ] `string` puede ser `null`; `string?` solo puede ser cadena vacía.
- [ ] No hay diferencia para el compilador.

---

### Análisis estático

181) ¿Por qué el compilador advierte en `texto.Length` si `texto` es `string?`?

```csharp
string? texto = ObtenerTexto();
Console.WriteLine(texto.Length);
```

- [ ] Porque `Length` no existe en `string`.
- [x] Porque `texto` podría ser `null` en ese punto.
- [ ] Porque `ObtenerTexto()` siempre devuelve una cadena vacía.

---

### Operador `?.`

182) ¿Qué hace el operador `?.`?

- [ ] Lanza una excepción si el objeto es `null`.
- [ ] Convierte cualquier valor en non-nullable.
- [x] Accede al miembro solo si el objeto no es `null`; si es `null`, devuelve `null`.

---

### Operador `??`

183) ¿Qué valor queda en `display`?

```csharp
string? nombre = null;
string display = nombre ?? "Anónimo";
```

- [x] `"Anónimo"`
- [ ] `null`
- [ ] `""`

---

### Operador `??=`

184) ¿Qué hace `cache ??= "valor por defecto";`?

- [ ] Asigna siempre `"valor por defecto"`, aunque `cache` ya tenga valor.
- [x] Asigna `"valor por defecto"` solo si `cache` es `null`.
- [ ] Lanza una excepción si `cache` es `null`.

---

### Null-forgiving

185) ¿Qué hace el operador `!` en `texto!.Length`?

- [ ] Evita cualquier excepción en tiempo de ejecución.
- [ ] Verifica que `texto` no sea `null`.
- [x] Suprime el warning del compilador, pero no cambia el comportamiento en runtime.

---

### Pattern matching con null

186) ¿Cuál es la forma recomendada en el apunte para verificar si una referencia es `null`?

- [x] `objeto is null`
- [ ] `objeto = null`
- [ ] `objeto.Equals(null)`

---

### Switch con null

187) En este `switch`, ¿Qué respuesta se devuelve si `input` es `""`?

```csharp
string respuesta = input switch
{
    null             => "No ingresaste nada",
    ""               => "Ingresaste una cadena vacía",
    { Length: > 20 } => "Texto demasiado largo",
    _                => $"Ingresaste: {input}"
};
```

- [ ] `"No ingresaste nada"`
- [x] `"Ingresaste una cadena vacía"`
- [ ] `"Texto demasiado largo"`

---

### Acceso profundo seguro

188) ¿Qué valor obtiene `display` si `pedido`, `Cliente`, `Direccion` o `Ciudad` son `null`?

```csharp
string display = pedido?.Cliente?.Direccion?.Ciudad ?? "Ciudad desconocida";
```

- [ ] `null`
- [ ] Lanza `NullReferenceException`.
- [x] `"Ciudad desconocida"`

---

### Validación de parámetros

189) ¿Para qué se usa `ArgumentNullException.ThrowIfNull(nombre)` al inicio de un método?

- [x] Para validar que el parámetro no sea `null` y que el compilador lo sepa luego.
- [ ] Para convertir `nombre` en cadena vacía.
- [ ] Para ignorar todos los warnings de nullable del método.

---

### Retornar null

190) ¿Cuál es una buena práctica al devolver resultados de búsqueda?

- [ ] Devolver `null` para representar siempre lista vacía, error y dato no encontrado.
- [x] Devolver lista vacía si no hay resultados y reservar `null` para casos con sentido semántico.
- [ ] Devolver `null` aunque el método prometa `List<Producto>`.

---

### Strings vacíos o blancos

191) ¿Qué método cubre `null`, `""` y strings con solo espacios?

- [ ] `string.IsNullOrEmpty`
- [ ] `GetValueOrDefault`
- [x] `string.IsNullOrWhiteSpace`

---

### Nullable en colecciones

192) ¿Qué significa `List<string?> nombres`?

- [x] Una lista no nullable cuyos elementos pueden ser `null`.
- [ ] Una lista que puede ser `null`, pero cuyos elementos nunca pueden serlo.
- [ ] Una lista de enteros anulables.

---

### Filtrar nulls

193) ¿Qué hace `nombres.OfType<string>().ToList()` si `nombres` es una colección con strings y `null`?

- [ ] Conserva solo los valores `null`.
- [x] Filtra y castea a `string`, descartando automáticamente los `null`.
- [ ] Convierte todos los `null` en `string.Empty`.

---

# Examen de funciones, delegados y eventos en C#

## Funciones, Delegados y Eventos en C#

---

### Funciones

194) ¿Qué es una función o método en C#?

- [ ] Una variable que solo puede guardar números.
- [x] Un bloque de código con nombre que realiza una tarea, puede recibir datos y devolver un resultado.
- [ ] Un tipo especial que no puede reutilizarse.

---

### Expresión de cuerpo

195) ¿Cuál de estas declaraciones usa expresión de cuerpo para una función de una sola expresión?

- [ ] `static int Sumar(int a, int b) { return a + b; }`
- [ ] `static void Sumar = a + b;`
- [x] `static int Sumar(int a, int b) => a + b;`

---

### Parámetros por valor

196) ¿Qué imprime la última línea?

```csharp
static void Duplicar(int n) {
    n *= 2;
}

int x = 10;
Duplicar(x);
Console.WriteLine(x);
```

- [x] `10`, porque el parámetro recibió una copia del valor.
- [ ] `20`, porque todos los parámetros se pasan por referencia.
- [ ] Da error, porque `int` no puede pasarse a una función.

---

### Referencias copiadas

197) En este código, ¿Qué imprime `nums.Count`?

```csharp
static void Modificar(List<int> lista) {
    lista.Add(99);
    lista = new List<int>();
}

var nums = new List<int> { 1, 2, 3 };
Modificar(nums);
Console.WriteLine(nums.Count);
```

- [ ] `0`, porque la reasignación local reemplaza la lista original.
- [x] `4`, porque se modificó el objeto original al agregar `99`.
- [ ] `3`, porque ninguna operación dentro del método afecta a la lista.

---

### `ref`

198) ¿Qué permite `ref` en un parámetro?

- [ ] Pasar una copia de solo lectura.
- [ ] Declarar una variable de salida sin inicializar.
- [x] Hacer que el parámetro sea un alias de la variable original.

---

### `out`

199) ¿Qué caracteriza a un parámetro `out`?

- [x] No necesita estar inicializado antes de la llamada y el método debe asignarlo antes de retornar.
- [ ] Siempre se pasa por valor y no puede modificarse.
- [ ] Solo puede usarse con strings.

---

### Patrón `TryXxx`

200) ¿Qué representa el patrón `TryXxx(out T resultado)` en .NET?

- [ ] Una forma de lanzar excepciones obligatoriamente cuando falla una operación.
- [x] Una forma estándar de intentar una operación que puede fallar sin lanzar excepción.
- [ ] Una forma de declarar constructores opcionales.

---

### `in`

201) ¿Para qué se usa `in` en un parámetro?

- [ ] Para modificar obligatoriamente el valor original.
- [ ] Para devolver dos resultados desde una función.
- [x] Para pasar por referencia de solo lectura, evitando copias en casos útiles.

---

### `params`

202) ¿Qué permite `params` en una función?

- [x] Recibir un número variable de argumentos como un array.
- [ ] Obligar a que todos los argumentos sean nombrados.
- [ ] Evitar que la función tenga retorno.

---

### Sobrecarga

203) ¿Cómo elige el compilador qué sobrecarga llamar?

- [ ] Por el nombre de la variable que recibe el resultado.
- [x] Por los tipos y la cantidad de argumentos.
- [ ] Siempre llama a la primera sobrecarga escrita en el archivo.

---

### Funciones locales

204) ¿Qué caracteriza a una función local?

- [ ] Debe declararse fuera de cualquier clase.
- [ ] Es visible desde todo el proyecto.
- [x] Se declara dentro de otro método y solo es visible en ese método.

---

### Captura de contexto

205) ¿Qué puede hacer una función local no estática?

- [x] Capturar variables del método donde está declarada.
- [ ] Ejecutarse antes de que exista el método que la contiene.
- [ ] Convertirse automáticamente en evento.

---

### Función local `static`

206) ¿Cuál es una ventaja de declarar una función local como `static` cuando no necesita variables externas?

- [ ] Permite capturar todas las variables del contexto.
- [x] Previene capturas accidentales y puede ser más eficiente.
- [ ] Hace que la función sea visible desde cualquier clase.

---

### Recursión

207) ¿Qué necesita siempre una función recursiva?

- [ ] Un parámetro `out`.
- [ ] Un delegado multicast.
- [x] Un caso base para evitar recursión infinita.

---

### Memoización

208) ¿Para qué sirve la memoización en una función recursiva costosa?

- [x] Para almacenar resultados previos y evitar recalcular los mismos valores.
- [ ] Para forzar que la función lance excepción en cada llamada.
- [ ] Para convertir la función en `void`.

---

### Delegados

209) ¿Qué es un delegado en C#?

- [ ] Una clase que solo puede tener campos estáticos.
- [x] Un tipo que representa una referencia a un método con una firma determinada.
- [ ] Un operador para comparar strings.

---

### Delegados multicast

210) ¿Qué permite hacer `+=` sobre un delegado compatible?

- [ ] Borrar todas las funciones asociadas al delegado.
- [ ] Convertir el delegado en `null`.
- [x] Agregar otro método a la lista de invocación del delegado.

---

### `Func<>`

211) En `Func<int, int, int> sumar`, ¿Qué indica el último `int`?

- [x] El tipo de retorno.
- [ ] El nombre del método.
- [ ] La cantidad máxima de llamadas.

---

### `Action<>`

212) ¿Cuándo corresponde usar `Action<string>`?

- [ ] Cuando se necesita una función que recibe `string` y retorna `bool`.
- [x] Cuando se necesita una función que recibe `string` y no retorna valor.
- [ ] Cuando se necesita una función sin parámetros que retorna `string`.

---

### `Predicate<T>`

213) ¿A qué equivale conceptualmente `Predicate<int>`?

- [ ] `Action<int>`
- [ ] `Func<int, string>`
- [x] `Func<int, bool>`

---

### Lambdas

214) ¿Qué es una lambda?

- [x] Una función anónima escrita de forma compacta.
- [ ] Un constructor que siempre recibe `params`.
- [ ] Un evento que no admite suscriptores.

---

### Captura en lambdas

215) ¿Qué significa que una lambda captura la variable y no el valor?

- [ ] Que la lambda no puede ver cambios posteriores en esa variable.
- [x] Que si la variable cambia después, la lambda puede ver el nuevo valor.
- [ ] Que la variable capturada se vuelve automáticamente `readonly`.

---

### Funciones de orden superior

216) ¿Qué es una función de orden superior?

- [ ] Una función que solo puede estar en una clase abstracta.
- [ ] Una función que tiene más de diez parámetros.
- [x] Una función que recibe funciones como parámetros o devuelve una función como resultado.

---

### Callback

217) ¿Qué es un callback?

- [x] Una función pasada a otra función para que sea llamada en el momento apropiado.
- [ ] Un método privado que solo se ejecuta al compilar.
- [ ] Una variable que guarda exclusivamente números enteros.

---

### Eventos

218) ¿Qué permite hacer un evento?

- [ ] Reemplazar todas las funciones por lambdas.
- [x] Permitir que un objeto notifique a otros cuando algo ocurre.
- [ ] Invocar cualquier método privado desde fuera de la clase.

---

### Disparo de eventos

219) ¿Por qué se usa `Tick?.Invoke(this, segundos)` al disparar un evento?

- [ ] Para lanzar una excepción si no hay suscriptores.
- [ ] Para borrar todos los suscriptores antes de invocar.
- [x] Para invocar el evento solo si no es `null`.

---

### Evento vs delegado

220) ¿Cuál es una diferencia clave entre un evento y un delegado público?

- [x] Un evento solo puede ser invocado por la clase que lo declara.
- [ ] Un evento no permite `+=` ni `-=`.
- [ ] Un delegado nunca puede ser `null`.

---

# Examen de interfaces y contratos en C#

## Interfaces y contratos en C#

---

### Concepto de interfaz

221) ¿Qué define una interfaz en C#?

- [ ] El estado interno privado que todas las clases deben compartir.
- [x] Un contrato que indica qué puede hacer un tipo, sin decir necesariamente cómo lo hace.
- [ ] Un constructor común para varias clases.

---

### Interfaz vs. clase abstracta

222) ¿Qué expresa principalmente una interfaz?

- [ ] "Es un tipo de..."
- [ ] "Tiene los mismos campos que..."
- [x] "Puede hacer..." o "se comporta como..."

---

### Miembros de interfaz

223) ¿Cuál de estos miembros no puede tener una interfaz?

- [x] Campos o variables de instancia.
- [ ] Métodos sin implementación.
- [ ] Eventos.

---

### Implementación

224) Si una clase implementa `ILogger`, ¿Qué garantiza?

```csharp
public interface ILogger {
    void Log(string mensaje);
    void LogError(string mensaje, Exception? ex = null);
    bool EstaActivo { get; }
}
```

- [ ] Que hereda automáticamente de una clase base llamada `Logger`.
- [x] Que provee los miembros exigidos por el contrato `ILogger`.
- [ ] Que no puede tener otros métodos propios.

---

### Uso polimórfico

225) ¿Qué ventaja tiene escribir código contra `ILogger` en lugar de contra `ConsoleLogger`?

- [ ] Obliga a que solo exista una implementación posible.
- [ ] Impide cambiar el comportamiento en tiempo de ejecución.
- [x] Permite trabajar con distintas implementaciones que cumplen el mismo contrato.

---

### Implementación múltiple

226) ¿Qué ventaja clave tienen las interfaces frente a la herencia de clases?

- [x] Una clase puede implementar múltiples interfaces.
- [ ] Una clase puede heredar de muchas clases base.
- [ ] Una interfaz puede guardar estado privado de instancia.

---

### Métodos por defecto

227) ¿Qué ocurre con un método con implementación por defecto en una interfaz?

- [ ] La clase que implementa la interfaz siempre está obligada a reescribirlo.
- [x] La clase puede usar esa implementación o sobreescribirla.
- [ ] El método se convierte automáticamente en constructor.

---

### Acceso a métodos por defecto

228) ¿desde dónde se acceden los métodos por defecto de una interfaz?

- [ ] Solo desde el constructor de la clase concreta.
- [ ] Desde cualquier variable del tipo concreto aunque la clase no declare el método.
- [x] A través de una referencia del tipo de la interfaz.

---

### Cuándo usar interfaz

229) ¿Cuándo conviene usar una interfaz según la regla práctica?

- [x] Cuando los tipos comparten solo un contrato de comportamiento.
- [ ] Cuando los tipos comparten campos de instancia y lógica base.
- [ ] Cuando se necesita un constructor común obligatorio.

---

### Cuándo usar clase abstracta

230) ¿Cuándo conviene una clase abstracta en lugar de una interfaz?

- [ ] Cuando se necesitan múltiples contratos independientes.
- [x] Cuando los tipos comparten estado y lógica base.
- [ ] Cuando no se quiere permitir ningún método concreto.

---

### Interfaz genérica

231) ¿Qué permite una interfaz como `IRepositorio<T>`?

- [ ] Escribir un contrato que solo sirve para `int`.
- [ ] Crear campos de instancia dentro de la interfaz.
- [x] Definir un contrato reutilizable para distintos tipos de entidad.

---

### Restricciones `where`

232) ¿Qué significa esta restricción?

```csharp
public static T Maximo<T>(T a, T b) where T : IComparable<T>
```

- [x] Que `T` debe implementar `IComparable<T>`.
- [ ] Que `T` debe ser siempre `string`.
- [ ] Que `T` no puede tener métodos.

---

### Múltiples restricciones

233) ¿Qué exige `where T : IPersistible, IValidable`?

- [ ] Que `T` herede de dos clases base.
- [x] Que `T` implemente ambos contratos.
- [ ] Que `T` sea necesariamente un tipo por valor.

---

### Covarianza

234) ¿Qué permite la covarianza con `out T` en un productor?

- [ ] Usar el tipo genérico solo como entrada.
- [ ] Convertir cualquier interfaz en una clase abstracta.
- [x] Tratar, por ejemplo, un `IEnumerable<string>` como `IEnumerable<object>`.

---

### Contravarianza

235) ¿Qué describe `in T` en una interfaz consumidora?

- [x] El tipo entra o se consume, permitiendo ciertas conversiones hacia tipos más específicos.
- [ ] El tipo solo puede salir como resultado.
- [ ] El tipo debe ser siempre nullable.

---

### `IEnumerable<T>`

236) ¿Qué garantiza `IEnumerable<T>`?

- [ ] Acceso por índice y modificación.
- [x] Que el tipo puede recorrerse, por ejemplo con `foreach`.
- [ ] Que el tipo tiene claves y valores.

---

### `ICollection<T>`

237) ¿Qué agrega `ICollection<T>` sobre `IEnumerable<T>`?

- [ ] Solo formato con interpolación.
- [ ] Herencia múltiple de clases.
- [x] Tamaño y operaciones como `Add`, `Remove`, `Contains` y `Clear`.

---

### `IList<T>`

238) ¿Qué permite `IList<T>`?

- [x] Acceso por índice, `IndexOf`, `Insert` y `RemoveAt`.
- [ ] Liberar recursos externos con `Dispose`.
- [ ] Comparar objetos con `GetHashCode`.

---

### Colecciones de solo lectura

239) ¿Para qué sirve exponer una colección como `IReadOnlyList<T>`?

- [ ] Para permitir que el cliente llame `Add` y `Remove`.
- [x] Para permitir lectura sin modificación externa.
- [ ] Para convertir la lista en un diccionario.

---

### `ISet<T>`

240) ¿Qué tipo de operaciones modela `ISet<T>`?

- [ ] Formatos de texto con `ToString`.
- [ ] Conversión desde `string`.
- [x] Operaciones de conjuntos como diferencia, unión o intersección.

---

### `foreach` por dentro

241) ¿Qué método usa el enumerador para avanzar al siguiente elemento?

- [x] `MoveNext()`
- [ ] `Add()`
- [ ] `DisposeNow()`

---

### `yield return`

242) ¿Qué hace `yield return`?

- [ ] Ejecuta toda la secuencia de inmediato y la guarda completa.
- [x] Convierte un método en un generador y produce elementos de forma lazy.
- [ ] Obliga a implementar manualmente `IEnumerator<T>`.

---

### `yield break`

243) ¿Para qué sirve `yield break`?

- [ ] Para reiniciar la secuencia desde el comienzo.
- [x] Para terminar la secuencia condicionalmente.
- [ ] Para convertir una secuencia sincrónica en asíncrona.

---

### `IAsyncEnumerable<T>`

244) ¿Cuándo es útil `IAsyncEnumerable<T>`?

- [x] Para enumerar fuentes lentas como red, base de datos o archivos grandes con `await foreach`.
- [ ] Para ordenar listas por nombre.
- [ ] Para implementar igualdad por valor.

---

### `IComparable<T>`

245) ¿Para qué sirve implementar `IComparable<T>`?

- [ ] Para que el tipo sea descartado automáticamente por el GC.
- [ ] Para definir múltiples criterios externos de orden.
- [x] Para darle al tipo un orden natural usado por `Sort`, `Min`, `Max` u `OrderBy`.

---

### `IComparer<T>`

246) ¿Cuándo conviene usar `IComparer<T>`?

- [x] Cuando se necesita un criterio de orden externo, por ejemplo ordenar productos por precio o por nombre.
- [ ] Cuando se quiere que un objeto se use con `using`.
- [ ] Cuando el tipo no debe poder recorrerse.

---

### `IEquatable<T>`

247) ¿Qué piezas deben mantenerse consistentes al implementar igualdad por valor?

- [ ] Solo `ToString`.
- [x] `IEquatable<T>`, `object.Equals`, `GetHashCode` y los operadores `==` / `!=`.
- [ ] Solo `CompareTo` y `Sort`.

---

### `IDisposable`

248) ¿Para qué existe `IDisposable`?

- [ ] Para que el GC libere memoria más rápido.
- [x] Para liberar recursos externos como archivos, conexiones o sockets cuando se termina de usarlos.
- [ ] Para comparar dos instancias por valor.

---

### `IFormattable`

249) ¿Qué permite implementar `IFormattable`?

- [x] Responder a especificadores de formato como `$"{valor:F}"`.
- [ ] Hacer que un tipo sea recorrible con `foreach`.
- [ ] Permitir herencia múltiple de clases.

---

### `INumber<T>`

250) ¿Para qué se usa una restricción como `where T : INumber<T>`?

- [ ] Para aceptar solamente strings parseables.
- [ ] Para impedir operaciones aritméticas sobre `T`.
- [x] Para escribir algoritmos genéricos que funcionen con tipos numéricos.

---

### Diseño con interfaces

251) En el ejemplo de notificaciones, ¿por qué `ServicioNotificacion` recibe `IEnumerable<INotificador>`?

- [x] Para trabajar con cualquier conjunto de notificadores que implementen el contrato, sin depender de clases concretas.
- [ ] Para impedir que haya más de un canal de notificación.
- [ ] Para obligar a que todos los notificadores hereden de la misma clase base.

---

# Examen de control de flujo y manejo de excepciones en C#

## Control de flujo y manejo de excepciones en C#

---

### Control de flujo

252) ¿Qué determina el control de flujo en un programa?

- [ ] El tamaño final del ejecutable.
- [x] El orden en que se ejecutan las instrucciones.
- [ ] El tipo de dato de todas las variables.

---

### Familias de estructuras

253) ¿Qué familia de estructuras elige qué ejecutar según una condición?

- [ ] Iterativas.
- [ ] De salto.
- [x] Condicionales.

---

### `if` / `else if` / `else`

254) En una cadena `if / else if / else`, ¿Qué ocurre cuando una condición verdadera se encuentra primero?

- [x] Se ejecuta ese bloque y no se siguen evaluando los siguientes `else if`.
- [ ] Se ejecutan todos los bloques aunque sus condiciones sean falsas.
- [ ] El programa siempre entra en el `else`.

---

### Llaves en `if`

255) ¿Por qué el apunte recomienda usar llaves incluso cuando el cuerpo del `if` tiene una sola instrucción?

- [ ] Porque C# no permite `if` sin llaves.
- [x] Porque evita errores al agregar líneas y mantiene una convención más segura.
- [ ] Porque hace que la condición se evalúe dos veces.

---

### Cortocircuito

256) ¿Por qué esta condición es segura si `texto` vale `null`?

```csharp
if (texto != null && texto.Length > 0)
    Console.WriteLine(texto.ToUpper());
```

- [ ] Porque `Length` devuelve `0` automáticamente cuando el string es `null`.
- [ ] Porque `&&` evalúa siempre ambas partes.
- [x] Porque si la primera parte de `&&` es falsa, la segunda no se evalúa.

---

### `else` colgado

257) En `if` anidados sin llaves, ¿a qué `if` corresponde un `else`?

- [x] Al `if` interior más cercano, sin importar la indentación visual.
- [ ] Siempre al primer `if` del bloque.
- [ ] A todos los `if` anteriores al mismo tiempo.

---

### Pattern matching en `if`

258) ¿Qué hace esta condición?

```csharp
if (valor is int numero)
    Console.WriteLine(numero * 2);
```

- [ ] Convierte cualquier objeto a `int`, aunque no sea compatible.
- [x] Verifica si `valor` es `int` y declara `numero` si la verificación tiene éxito.
- [ ] Declara `numero` aunque `valor` sea `null` o de otro tipo.

---

### Operador ternario

259) ¿Qué valor queda en `categoria` si `edad` es `20`?

```csharp
string categoria = edad >= 18 ? "adulto" : "menor";
```

- [ ] `"menor"`
- [ ] `true`
- [x] `"adulto"`

---

### Ternarios anidados

260) ¿Por qué conviene evitar ternarios con muchos niveles anidados?

- [x] Porque son técnicamente válidos, pero dificultan la lectura.
- [ ] Porque C# los ejecuta siempre de derecha a izquierda y da error.
- [ ] Porque solo funcionan con números enteros.

---

### `switch` instrucción

261) En un `switch` tradicional, ¿para qué se usa `break` al final de un `case`?

- [ ] Para repetir el mismo `case`.
- [x] Para terminar ese caso y salir del `switch`.
- [ ] Para lanzar una excepción automáticamente.

---

### `switch` expression

262) ¿Qué caracteriza a un `switch expression`?

- [ ] No puede producir valores.
- [ ] Siempre necesita `break` en cada rama.
- [x] Es una expresión que produce un valor y no necesita `break`.

---

### Caso por defecto

263) En un `switch expression`, ¿Qué representa `_`?

- [x] El caso por defecto o wildcard.
- [ ] Un error de compilación obligatorio.
- [ ] Un alias para `null` únicamente.

---

### Pattern matching en `switch`

264) ¿Qué permite un pattern de propiedad como `{ Total: > 10_000, EsUrgente: false }`?

- [ ] Comparar solo el tipo del objeto, ignorando sus propiedades.
- [x] Ramificar según valores de propiedades del objeto.
- [ ] Modificar el objeto dentro del patrón.

---

### Guardia `when`

265) ¿Para qué sirve `when` en un patrón de `switch`?

- [ ] Para repetir una rama varias veces.
- [ ] Para reemplazar todos los `case` por `if`.
- [x] Para agregar una condición adicional al patrón.

---

### `while`

266) ¿Qué caracteriza a un bucle `while`?

- [x] Evalúa la condición antes de ejecutar el cuerpo, por lo que puede no ejecutarse nunca.
- [ ] Ejecuta el cuerpo siempre al menos una vez.
- [ ] Solo sirve para recorrer diccionarios.

---

### `do while`

267) ¿Cuándo conviene usar `do while`?

- [ ] Cuando el cuerpo podría no ejecutarse nunca.
- [x] Cuando el cuerpo debe ejecutarse al menos una vez, como en validación de entrada interactiva.
- [ ] Cuando se necesita salir del método con `return`.

---

### `for`

268) ¿Cuándo es especialmente útil un `for`?

- [ ] Cuando no existe ninguna condición de repetición.
- [ ] Cuando se quiere recorrer una colección sin índice y sin contador.
- [x] Cuando se conoce la cantidad de iteraciones o se necesita trabajar con el índice.

---

### `foreach`

269) ¿Qué recorre idiomáticamente un `foreach` en C#?

- [x] Cualquier colección o secuencia que pueda enumerarse como `IEnumerable<T>`.
- [ ] Solo arrays de enteros.
- [ ] Solo valores `null`.

---

### Modificación durante `foreach`

270) ¿Qué indica el apunte sobre modificar una colección mientras se itera con `foreach`?

- [ ] Es la forma recomendada de eliminar elementos.
- [x] No se debe modificar la colección mientras se itera; si hay que eliminar, usar copia o `RemoveAll`.
- [ ] Solo está prohibido en diccionarios, pero no en listas.

---

### `await foreach`

271) ¿Para qué se usa `await foreach`?

- [ ] Para ejecutar un `switch expression` sin `break`.
- [ ] Para recorrer solamente arrays multidimensionales.
- [x] Para recorrer colecciones asíncronas.

---

### `break`

272) ¿Qué hace `break` dentro de un bucle?

- [x] Sale del bucle.
- [ ] Salta solo a la siguiente iteración.
- [ ] Sale siempre de todo el programa.

---

### `continue`

273) ¿Qué hace `continue` dentro de un bucle?

- [ ] Termina definitivamente el método.
- [x] Salta el resto del cuerpo actual y continúa con la siguiente iteración.
- [ ] Ejecuta el bloque `catch`.

---

### `return`

274) ¿Qué efecto tiene `return` dentro de un método?

- [ ] Sale solo del `if`, pero no del método.
- [ ] Salta a la siguiente iteración de un `foreach`.
- [x] Sale del método, y por lo tanto también de cualquier bucle donde esté.

---

### Bucles anidados

275) En bucles anidados, ¿a qué bucle afecta un `break`?

- [x] Solo al bucle más interno donde aparece.
- [ ] A todos los bucles externos automáticamente.
- [ ] Solo al primer bucle escrito en el método.

---

### Guard clauses

276) ¿Qué ventaja tienen las guard clauses al inicio de un método?

- [ ] Aumentan el anidamiento del código.
- [x] Resuelven casos inválidos temprano y evitan anidamiento excesivo.
- [ ] Impiden usar `return`.

---

---

# Examen de switch expression y pattern matching en C#

## Switch Expression y Pattern Matching en C#

---

### Switch expression

277) ¿Cuál es una diferencia central entre una instrucción `switch` clásica y un `switch expression`?

- [ ] El `switch expression` requiere `break` en cada brazo.
- [x] El `switch expression` produce un valor directamente.
- [ ] El `switch expression` usa `default` en lugar de `_`.

---

### Type pattern

278) ¿Qué permite hacer un type pattern como `string s` dentro de un `switch`?

- [ ] Convertir cualquier valor a `string` aunque no sea compatible.
- [ ] Comparar el valor únicamente contra un texto literal.
- [x] Verificar que el valor sea `string` y declararlo en la variable `s`.

---

### Orden de patrones

279) ¿Por qué los patrones más específicos deben escribirse antes que los más generales?

- [x] Porque un patrón general anterior puede capturar el caso y hacer inalcanzable al específico.
- [ ] Porque C# ejecuta siempre primero el último brazo del `switch`.
- [ ] Porque los patrones específicos solo funcionan después del wildcard `_`.

---

### Patrones lógicos y guardias

280) ¿Qué agrega una guardia `when` en un brazo de `switch expression`?

- [ ] Un valor por defecto que se ejecuta antes de todos los patrones.
- [x] Una condición booleana adicional que se evalúa solo si el patrón coincide.
- [ ] Una forma de evitar que el `switch expression` devuelva un valor.

---

### List pattern

281) En un list pattern, ¿Qué representa `..`?

- [ ] Un elemento obligatorio que debe valer cero.
- [ ] Una comparación relacional entre dos elementos consecutivos.
- [x] Un segmento con cualquier cantidad de elementos.

---

# Examen de manejo de errores con try, catch y finally en C#

## Manejo de errores — `try / catch / finally`

---

### Excepciones

282) ¿Qué representan las excepciones en C#?

- [ ] Una forma de repetir un bloque mientras se cumpla una condición.
- [x] La forma de reportar fallos como archivos inexistentes, cortes de red o datos inválidos.
- [ ] Una conversión automática entre tipos numéricos.

---

### `try`

283) ¿Qué se coloca dentro de un bloque `try`?

- [ ] Solo código que nunca puede fallar.
- [ ] El código que se ejecuta después de todos los `catch`.
- [x] Código que podría lanzar una excepción.

---

### Orden de `catch`

284) ¿Por qué `catch (Exception ex)` debe ir al final?

- [x] Porque `Exception` es la más general y capturaría antes excepciones más específicas.
- [ ] Porque C# solo permite un `catch` por cada `try`.
- [ ] Porque `Exception` solo puede capturarse dentro de `finally`.

---

### Captura específica

285) ¿Qué bloque captura un archivo inexistente en el ejemplo del apunte?

```csharp
try {
    string contenido = File.ReadAllText("datos.txt");
} catch (FileNotFoundException ex) {
    Console.WriteLine($"Archivo no encontrado: {ex.FileName}");
}
```

- [ ] `try`
- [x] `catch (FileNotFoundException ex)`
- [ ] `finally`

---

### `finally`

286) ¿Cuándo se ejecuta un bloque `finally`?

- [ ] Solo cuando el `try` termina sin errores.
- [ ] Solo cuando se captura `Exception`.
- [x] Siempre, tanto si el `try` tuvo éxito como si lanzó una excepción.

---

### Liberación de recursos

287) ¿Para qué se usa comúnmente `finally`?

- [x] Para liberar recursos o ejecutar limpieza obligatoria.
- [ ] Para declarar una excepción personalizada.
- [ ] Para evitar que cualquier excepción exista.

---

### `using`

288) ¿Qué reemplaza normalmente `using` cuando se trabaja con recursos `IDisposable`?

- [ ] El patrón `if / else`.
- [x] El patrón `try / finally` usado para liberar recursos.
- [ ] La necesidad de capturar excepciones específicas.

---

### `throw`

289) ¿Qué hace esta línea?

```csharp
throw new ArgumentOutOfRangeException(nameof(n), "No se puede calcular la raíz de un número negativo.");
```

- [ ] Captura una excepción existente.
- [ ] Ignora una excepción y continúa.
- [x] Lanza una excepción porque el argumento no cumple una regla.

---

### Relanzar

290) ¿Por qué se usa `throw;` sin argumentos dentro de un `catch`?

- [x] Para relanzar la excepción original preservando su stack trace.
- [ ] Para crear una excepción nueva sin mensaje.
- [ ] Para finalizar el programa sin pasar por otros bloques.

---

### `throw` como expresión

291) ¿En cuál de estas situaciones el apunte muestra que `throw` puede usarse como expresión?

- [ ] Solo dentro de un `for`.
- [x] En ternarios, operadores `??` y switch expressions.
- [ ] Únicamente como primera línea de un método.

---

### Operador `??` con `throw`

292) ¿Qué ocurre si `ObtenerNombre()` devuelve `null`?

```csharp
string nombre = ObtenerNombre() ?? throw new InvalidOperationException("Nombre requerido.");
```

- [ ] `nombre` queda como cadena vacía.
- [ ] Se asigna la palabra `"null"`.
- [x] Se lanza `InvalidOperationException`.

---

### Excepciones personalizadas

293) ¿Cuándo conviene crear una excepción personalizada?

- [x] Cuando el error tiene un significado específico del dominio del programa.
- [ ] Cuando se quiere reemplazar cualquier `if` por `try/catch`.
- [ ] Cuando el error siempre debe ignorarse.

---

### Herencia de excepciones

294) ¿De qué debe heredar una excepción personalizada?

- [ ] De `List<T>`.
- [x] De `Exception` o de una subclase de `Exception`.
- [ ] De `IEnumerable<T>`.

---

### Datos de dominio

295) ¿Qué ventaja tiene `SaldoInsuficienteException` en el ejemplo?

- [ ] Solo guarda un texto fijo sin más información.
- [ ] Evita que el método `Extraer` valide el saldo.
- [x] Puede transportar datos específicos como saldo actual y monto solicitado.

---

### Filtro `when`

296) ¿Para qué sirve `when` en un `catch`?

- [x] Para capturar una excepción solo si además se cumple una condición.
- [ ] Para ejecutar siempre el bloque `finally`.
- [ ] Para convertir cualquier excepción en `IOException`.

---

### `when` vs. `if`

297) ¿Qué pasa si la condición de un `catch (...) when (...)` es falsa?

- [ ] La excepción queda capturada y se ignora.
- [x] La excepción sigue propagándose al siguiente `catch` o hacia arriba.
- [ ] Se ejecuta automáticamente el mismo `catch` de nuevo.

---

### Jerarquía de excepciones

298) Según la jerarquía del apunte, ¿cuál de estas excepciones deriva de `IOException`?

- [ ] `ArgumentNullException`
- [ ] `DivideByZeroException`
- [x] `FileNotFoundException`

---

### `NullReferenceException`

299) ¿Cómo presenta el apunte a `NullReferenceException`?

- [x] Como una señal de null no manejado que conviene evitar.
- [ ] Como la excepción recomendada para validar parámetros.
- [ ] Como una excepción obsoleta igual que `ApplicationException`.

---

### Capturar `Exception`

300) ¿Por qué es peligroso capturar `Exception` genérica sin relanzar?

- [ ] Porque siempre impide compilar el programa.
- [x] Porque puede silenciar errores importantes.
- [ ] Porque solo captura errores de archivo.

---

### Validar parámetros

301) ¿Qué método muestra el apunte para validar que un parámetro no sea `null`?

- [ ] `File.ReadAllText`
- [x] `ArgumentNullException.ThrowIfNull`
- [ ] `GC.SuppressFinalize`

---

### Conversiones esperadas

302) ¿Qué recomienda el apunte para conversiones esperadas como texto a número?

- [x] Usar `TryParse` en lugar de `try/catch`.
- [ ] Usar siempre `catch (Exception) { }`.
- [ ] Lanzar `NullReferenceException`.

---

### Búsqueda en diccionarios

303) Si una clave puede no existir en un diccionario, ¿Qué práctica recomienda el apunte?

- [ ] Acceder con `diccionario["clave"]` y capturar `KeyNotFoundException` como flujo normal.
- [ ] Usar `finally` para inventar la clave faltante.
- [x] Usar `TryGetValue` para manejar el caso esperado sin excepción.

---

# Examen de iteradores en C#

## Iteradores en C#: `GetEnumerator`, `IEnumerable`, `IEnumerator` y `yield`

---

### Motivación

304) ¿Por qué no alcanza siempre con recorrer una colección usando `for` con índice?

- [ ] Porque `for` solo puede usarse con strings.
- [x] Porque muchas fuentes de datos no tienen acceso aleatorio indexado eficiente.
- [ ] Porque `for` no puede imprimir valores por consola.

---

### Encapsulamiento

305) ¿Qué problema tiene exponer directamente el arreglo interno de una clase como `Baraja.Cartas`?

- [ ] Hace imposible recorrer las cartas.
- [ ] Obliga a usar `foreach` siempre.
- [x] Rompe el encapsulamiento y acopla al consumidor con la implementación interna.

---

### Colección e iterador

306) ¿Por qué conviene separar la colección del iterador?

- [x] Porque cada recorrido necesita su propio estado y pueden existir recorridos simultáneos.
- [ ] Porque la colección no puede tener métodos.
- [ ] Porque el iterador debe guardar todos los elementos duplicados.

---

### `GetEnumerator`

307) ¿Qué debe devolver `GetEnumerator()`?

- [ ] El primer elemento de la colección.
- [x] Un iterador nuevo capaz de recorrer la colección.
- [ ] La cantidad total de elementos.

---

### `IEnumerable`

308) ¿Qué representa `IEnumerable`?

- [ ] El objeto que lleva la posición actual del recorrido.
- [ ] Un método que ordena automáticamente los datos.
- [x] Una colección enumerable, es decir, algo que puede recorrerse.

---

### `IEnumerator`

309) ¿Qué representa `IEnumerator`?

- [x] El iterador que lleva la cuenta del recorrido y sabe avanzar.
- [ ] La colección completa con todos sus datos públicos.
- [ ] Un tipo que solo sirve para arrays.

---

### `foreach` por dentro

310) ¿Qué hace `foreach` de forma aproximada?

- [ ] Accede siempre por índice desde `0` hasta `Length - 1`.
- [x] Obtiene un enumerador, llama a `MoveNext()` y lee `Current`.
- [ ] Convierte cualquier colección en `List<T>` antes de recorrerla.

---

### `MoveNext`

311) ¿Qué dos tareas combina `MoveNext()`?

- [ ] Ordenar la colección y eliminar duplicados.
- [ ] Crear la colección y liberar memoria.
- [x] Avanzar el iterador e indicar si todavía hay un elemento disponible.

---

### `Current`

312) ¿Cuándo es válido leer `Current`?

- [x] Después de que `MoveNext()` devuelve `true`.
- [ ] Antes de llamar por primera vez a `MoveNext()`.
- [ ] Después de que `MoveNext()` devuelve `false`.

---

### Enumerador nuevo

313) ¿Por qué `GetEnumerator()` debe crear un enumerador nuevo cada vez?

- [ ] Para que la colección cambie de tipo en cada recorrido.
- [x] Para permitir recorridos independientes sobre la misma colección.
- [ ] Para que `Current` sea siempre `null`.

---

### Interfaces genéricas

314) ¿Qué ventaja tienen `IEnumerable<T>` e `IEnumerator<T>` frente a las versiones no genéricas?

- [ ] Eliminan la necesidad de `foreach`.
- [ ] Hacen que `Current` sea siempre `object`.
- [x] Dan seguridad de tipos y evitan casts innecesarios.

---

### `IDisposable`

315) ¿Por qué `IEnumerator<T>` hereda de `IDisposable`?

- [x] Porque un iterador puede tener recursos que liberar, como archivos o conexiones.
- [ ] Porque todos los iteradores deben escribir en disco.
- [ ] Porque `Dispose()` reemplaza a `MoveNext()`.

---

### Implementación explícita

316) ¿Por qué al implementar `IEnumerable<T>` también aparece una implementación de `IEnumerable.GetEnumerator()` no genérica?

- [ ] Porque `IEnumerable<T>` no permite `foreach`.
- [ ] Porque `IEnumerator<T>` no tiene `Current`.
- [x] Porque `IEnumerable<T>` hereda de la interfaz no genérica.

---

### `yield return`

317) ¿Qué logra `yield return`?

- [x] Permite escribir un método iterador y deja que el compilador genere el enumerador.
- [ ] Ejecuta toda la secuencia inmediatamente y la guarda en memoria.
- [ ] Convierte cualquier método en `void`.

---

### Máquina de estados

318) ¿Qué genera internamente el compilador cuando encuentra `yield return`?

- [ ] Un array con todos los valores posibles.
- [x] Una máquina de estados que recuerda dónde quedó la ejecución.
- [ ] Un método `Main` nuevo.

---

### Pausa y reanudación

319) ¿Qué ocurre cuando un método iterador llega a `yield return X`?

- [ ] Termina definitivamente el método y no puede continuar.
- [ ] Ignora `X` y sigue hasta el final.
- [x] Guarda `X` como `Current`, pausa el método y devuelve `true` desde `MoveNext()`.

---

### `yield break`

320) ¿Para qué sirve `yield break`?

- [x] Para cortar la iteración de golpe.
- [ ] Para devolver dos valores al mismo tiempo.
- [ ] Para reiniciar el enumerador desde el inicio.

---

### Método iterador

321) ¿Qué puede devolver un método que usa `yield return`?

- [ ] Solo `int`.
- [x] Una secuencia como `IEnumerable<T>`.
- [ ] Únicamente `void`.

---

### Ejecución diferida

322) ¿Qué significa que un iterador tenga ejecución diferida?

- [ ] Que todos los valores se calculan al llamar al método.
- [x] Que el código se ejecuta de a partes cuando el consumidor pide elementos.
- [ ] Que el código nunca se ejecuta.

---

### Momento de errores

323) ¿Cuándo aparece una excepción dentro de un método iterador con `yield`?

- [ ] Siempre al llamar al método que devuelve la secuencia.
- [ ] Nunca puede aparecer dentro de un iterador.
- [x] Al iterar la secuencia y llegar al punto donde ocurre el error.

---

### Archivos grandes

324) ¿Por qué un iterador puede procesar un archivo muy grande sin cargarlo entero en memoria?

- [x] Porque puede producir una línea por vez.
- [ ] Porque comprime el archivo automáticamente.
- [ ] Porque convierte el archivo en un array completo antes de empezar.

---

### Reiterar secuencias

325) ¿Qué ocurre si se recorre dos veces una secuencia diferida creada con un método iterador?

- [ ] La segunda vez siempre falla.
- [x] El método se ejecuta otra vez, con un nuevo enumerador.
- [ ] La segunda vez usa obligatoriamente una copia en memoria.

---

### Materialización

326) ¿Para qué sirve llamar `.ToList()` sobre una secuencia diferida?

- [ ] Para hacer que el iterador sea infinito.
- [ ] Para impedir cualquier recorrido posterior.
- [x] Para ejecutar la secuencia una vez y guardar los resultados en memoria.

---

### Secuencias infinitas

327) ¿Por qué una secuencia infinita como `Fibonacci()` no explota por sí sola?

- [x] Porque la ejecución es diferida y el consumidor decide cuándo dejar de pedir valores.
- [ ] Porque C# limita todos los `while(true)` a 10 vueltas.
- [ ] Porque `yield return` convierte los números infinitos en un único valor.

---

### `Take`

328) ¿Qué hace `Fibonacci().Take(10)`?

- [ ] Calcula todos los números de Fibonacci posibles.
- [x] Pide solo 10 valores y luego deja de llamar a `MoveNext()`.
- [ ] Convierte Fibonacci en una lista infinita en memoria.

---

### Composición de iteradores

329) ¿Qué patrón usan métodos como `Cuadrados(IEnumerable<int> fuente)`?

- [ ] Reciben una secuencia, la modifican en su lugar y no devuelven nada.
- [x] Reciben un `IEnumerable<T>`, transforman sus elementos y devuelven otro `IEnumerable<T>`.
- [ ] Solo funcionan si la fuente es un array.

---

### LINQ

330) ¿Qué relación tiene LINQ-to-Objects con los iteradores?

- [x] Sus operadores como `Where`, `Select` y `Take` son métodos sobre `IEnumerable<T>` que usan iteración diferida.
- [ ] LINQ siempre ejecuta todo inmediatamente.
- [ ] LINQ no puede trabajar con `IEnumerable<T>`.

---

### `Where`

331) ¿Qué hace un `Where` sobre una secuencia?

- [ ] Transforma cada elemento en otro tipo sin filtrar.
- [ ] Carga toda la base de datos en memoria siempre.
- [x] Devuelve solo los elementos que cumplen un predicado.

---

### `Select`

332) ¿Qué hace un `Select` sobre una secuencia?

- [x] Transforma cada elemento usando una función.
- [ ] Termina una secuencia con `yield break`.
- [ ] Libera recursos con `Dispose()`.

---

### `File.ReadLines`

333) ¿Qué diferencia clave tiene `File.ReadLines(ruta)` frente a `File.ReadAllLines(ruta)`?

- [ ] `ReadLines` carga todo el archivo en un `string[]`.
- [x] `ReadLines` devuelve una secuencia diferida y permite leer línea por línea.
- [ ] `ReadLines` solo funciona con archivos vacíos.

---

# Examen de LINQ en C#

## LINQ — Language Integrated Query

---

### Propósito de LINQ

334) ¿Qué problema resuelve LINQ?

- [ ] Reemplaza todos los tipos genéricos por arrays.
- [x] Eleva el nivel de abstracción al trabajar con colecciones, dejando visible qué resultado se busca.
- [ ] Permite que las clases tengan múltiples constructores.

---

### Programación declarativa

335) ¿Qué caracteriza al estilo declarativo de LINQ?

- [ ] Describe paso por paso cómo modificar variables auxiliares.
- [ ] Obliga a usar índices en todos los recorridos.
- [x] Describe qué resultado se quiere obtener.

---

### Conceptos funcionales

336) ¿Qué método LINQ equivale a `filter` en programación funcional?

- [x] `Where()`
- [ ] `Select()`
- [ ] `Aggregate()`

---

### Transformación

337) ¿Qué método LINQ equivale a `map`?

- [ ] `Where()`
- [x] `Select()`
- [ ] `Count()`

---

### Reducción

338) ¿Qué método representa el `reduce` o `fold` más general?

- [ ] `Distinct()`
- [ ] `Take()`
- [x] `Aggregate()`

---

### Lambdas

339) En esta expresión, ¿Qué es `p => p.Precio > 1000`?

```csharp
productos.Where(p => p.Precio > 1000)
```

- [x] Una lambda que recibe un producto y devuelve `bool`.
- [ ] Una clase anónima con una propiedad `Precio`.
- [ ] Una instrucción que modifica todos los productos.

---

### Uniformidad

340) ¿Qué significa que LINQ tenga una sintaxis uniforme?

- [ ] Que solo funciona con listas en memoria.
- [x] Que puede usarse con distintas fuentes de datos, como colecciones, EF Core, XML u observables.
- [ ] Que todos los métodos LINQ devuelven `List<T>`.

---

### `IEnumerable<T>`

341) ¿Qué interfaz mínima habilita los métodos LINQ sobre una fuente de datos?

- [ ] `IDisposable`
- [ ] `IComparable<T>`
- [x] `IEnumerable<T>`

---

### Métodos de extensión

342) ¿Por qué se puede llamar `lista.Where(x => x > 0)`?

- [x] Porque `Where` es un método de extensión sobre `IEnumerable<T>`.
- [ ] Porque `Where` es una palabra reservada obligatoria del lenguaje.
- [ ] Porque todas las listas heredan de una clase `Where`.

---

### `Func<T, TResult>`

343) ¿Qué tipo tiene un selector como `p => p.Nombre` si recibe un `Producto` y devuelve un `string`?

- [ ] `Action<Producto>`
- [x] `Func<Producto, string>`
- [ ] `Predicate<string>`

---

### Evaluación diferida

344) ¿Qué ocurre al construir esta query?

```csharp
var query = productos
    .Where(p => p.Precio > 1000)
    .OrderBy(p => p.Nombre)
    .Select(p => p.Nombre);
```

- [ ] Se filtran y ordenan todos los productos inmediatamente.
- [ ] Se crea una lista mutable con los resultados finales.
- [x] Se construye un plan diferido; la ejecución ocurre al iterar o materializar.

---

### Ejecución real

345) ¿Cuál de estas acciones fuerza la ejecución de una query LINQ diferida?

- [x] `ToList()`
- [ ] Asignarla a una variable `query`.
- [ ] Encadenar otro `Where()`.

---

### Re-ejecución

346) ¿Qué sucede si se itera dos veces una query diferida?

- [ ] La segunda iteración siempre usa una copia guardada automáticamente.
- [x] La query se ejecuta de nuevo.
- [ ] La segunda iteración siempre lanza una excepción.

---

### Materialización

347) ¿Cuándo conviene usar `ToList()`?

- [ ] Cuando se quiere evitar guardar resultados y re-ejecutar siempre.
- [ ] Cuando la query no debe ejecutarse nunca.
- [x] Cuando se quiere ejecutar una vez y reutilizar los resultados materializados.

---

### `First`

348) ¿Qué diferencia hay entre `First()` y `FirstOrDefault()`?

- [x] `First()` lanza si no hay elemento; `FirstOrDefault()` devuelve el valor por defecto.
- [ ] `FirstOrDefault()` siempre lanza si no hay elemento.
- [ ] Ambos cuentan todos los elementos antes de devolver.

---

### `Single`

349) ¿Qué verifica `Single()`?

- [ ] Que haya cero o más elementos.
- [x] Que exista exactamente un elemento.
- [ ] Que todos los elementos sean distintos.

---

### `Any`

350) ¿Por qué es preferible `Any()` a `Count() > 0` para saber si hay elementos?

- [ ] Porque `Any()` ordena la colección primero.
- [ ] Porque `Any()` transforma los elementos en strings.
- [x] Porque puede detenerse al encontrar el primero.

---

### Agregaciones

351) ¿Qué devuelve `MaxBy(p => p.Precio)`?

- [x] El objeto cuyo precio es máximo.
- [ ] Solo el valor numérico máximo.
- [ ] La cantidad de productos con precio máximo.

---

### `DistinctBy`

352) ¿Para qué sirve `DistinctBy(p => p.Categoria)`?

- [ ] Para ordenar por categoría descendente.
- [x] Para quedarse con un elemento por cada categoría, usando esa clave para eliminar duplicados.
- [ ] Para agrupar todos los productos en listas por categoría.

---

### `GroupBy`

353) ¿Qué produce `GroupBy(p => p.Categoria)`?

- [ ] Una única lista plana de precios.
- [ ] Un diccionario mutable obligatorio.
- [x] Una secuencia de grupos, cada uno con una clave y sus elementos.

---

### `SelectMany`

354) ¿Qué hace `SelectMany`?

- [x] Transforma cada elemento en una colección y aplana todas en una sola secuencia.
- [ ] Ordena una secuencia por múltiples claves.
- [ ] Devuelve solo el primer elemento de una colección.

---

### `Join`

355) ¿Qué tipo de unión representa `Join` en el ejemplo del apunte?

- [ ] Left join: todos los elementos de la izquierda aunque no coincidan.
- [x] Inner join: solo elementos con coincidencia en ambas colecciones.
- [ ] Unión de conjuntos sin claves.

---

### `GroupJoin`

356) ¿Qué representa `GroupJoin` en el apunte?

- [ ] Un filtro por texto.
- [ ] Un ordenamiento por varias columnas.
- [x] Un left join: todos los elementos de la izquierda con su grupo de coincidencias.

---

### `Zip`

357) ¿Qué hace `Zip`?

- [x] Combina dos secuencias elemento a elemento.
- [ ] Elimina duplicados exactos.
- [ ] Agrupa por una clave.

---

### Operaciones de conjuntos

358) ¿Qué resultado conceptual produce `Intersect`?

- [ ] Todos los elementos de ambas secuencias.
- [x] Los elementos comunes a ambas secuencias.
- [ ] Los elementos de la primera que no están en la segunda.

---

### `Chunk`

359) ¿Para qué sirve `Chunk(3)`?

- [ ] Para tomar únicamente los primeros tres elementos.
- [ ] Para saltear los primeros tres elementos.
- [x] Para dividir la secuencia en lotes de hasta 3 elementos.

---

### Inmutabilidad

360) ¿Qué ocurre con la colección original al aplicar `OrderBy` o `Where`?

- [x] No se modifica; LINQ devuelve una nueva secuencia.
- [ ] Se ordena o filtra en el mismo objeto original.
- [ ] Se borra automáticamente al finalizar la query.

---

### Efectos secundarios

361) ¿Por qué conviene evitar efectos secundarios dentro de lambdas LINQ?

- [ ] Porque las lambdas no pueden contener bloques.
- [x] Porque la evaluación diferida hace que no siempre sea obvio cuántas veces se ejecutarán.
- [ ] Porque `Select` exige modificar una lista externa.

---

### Filtrar temprano

362) ¿Por qué suele convenir filtrar antes de transformar?

- [ ] Porque `Where` solo puede ir antes de `Select` por regla del compilador.
- [ ] Porque `Select` elimina automáticamente los elementos inactivos.
- [x] Porque se transforman menos elementos y se evita trabajo innecesario.

---

### Método más específico

363) ¿Qué opción recomienda el apunte para encontrar el producto más barato?

- [x] `productos.MinBy(p => p.Precio)`
- [ ] `productos.OrderBy(p => p.Precio).First()` como opción preferida.
- [ ] `productos.Aggregate()` siempre, incluso para casos simples.

---

### Sintaxis de consulta

364) ¿Qué hace el compilador con la sintaxis de consulta?

- [ ] La ejecuta con un motor distinto y más lento.
- [x] La traduce mecánicamente a llamadas a métodos LINQ.
- [ ] La convierte en SQL siempre.

---

### `let`

365) ¿Para qué sirve `let` en sintaxis de consulta?

- [ ] Para terminar una consulta.
- [x] Para nombrar una subexpresión y reutilizarla dentro de la consulta.
- [ ] Para materializar la query como lista.

---

### Consulta vs. métodos

366) ¿En qué caso el apunte recomienda especialmente la sintaxis de consulta?

- [x] Consultas con `join` y `group by`, donde puede ser más legible.
- [ ] Operaciones como `Take`, `Any` y `DistinctBy`, que no tienen equivalente.
- [ ] Cualquier consulta simple de filtrado y proyección.

---

### Métodos sin equivalente

367) ¿Cuál de estos métodos no tiene equivalente directo en sintaxis de consulta?

- [ ] `where`
- [ ] `select`
- [x] `Take(5)`

---

### `All`

368) ¿Qué verifica `All(p => p.Activo)` sobre una colección de productos?

- [ ] Si existe al menos un producto activo.
- [x] Si todos los productos cumplen que `Activo` es `true`.
- [ ] Si la colección contiene exactamente un producto activo.

---

### Paginación

369) En una paginación con `pagina = 2` y `tamanio = 3`, ¿para qué se usa `Skip((pagina - 1) * tamanio).Take(tamanio)`?

- [ ] Para ordenar los productos por tamaño antes de filtrarlos.
- [ ] Para obtener todos los elementos excepto los de la página indicada.
- [x] Para saltar los elementos de páginas anteriores y tomar solo los de la página actual.

---

### Materialización como diccionario

370) ¿Cuándo tiene sentido usar `ToDictionary()` en una query LINQ?

- [x] Cuando se quiere materializar el resultado como un mapa clave-valor.
- [ ] Cuando se quiere conservar siempre el orden original de una lista mutable.
- [ ] Cuando se quiere ejecutar la query sin guardar resultados.

---

### `Aggregate` con semilla

371) ¿Qué aporta la semilla inicial en una llamada como `Aggregate(100, (acum, x) => acum + x)`?

- [ ] Hace que `Aggregate` ignore todos los elementos de la secuencia.
- [x] Define el valor inicial del acumulador antes de procesar los elementos.
- [ ] Convierte automáticamente el resultado en `List<int>`.

---

### `Append` y `Prepend`

372) ¿Qué ocurre con la colección original al usar `Append` o `Prepend`?

- [ ] Se modifica agregando el elemento dentro de la misma colección.
- [ ] Se ordena automáticamente antes de agregar el elemento.
- [x] No se modifica; se devuelve una nueva secuencia con el elemento agregado.

---

### `Concat`

373) ¿Para qué sirve `Concat` en LINQ?

- [x] Para unir dos secuencias una después de la otra.
- [ ] Para eliminar elementos repetidos usando una clave.
- [ ] Para combinar dos secuencias elemento a elemento.

---

### Variables intermedias

374) En una query compleja, ¿Qué ventaja tiene nombrar pasos intermedios como `pedidosValidos` o `porCategoria`?

- [ ] Obliga a ejecutar cada paso inmediatamente.
- [x] Mejora la legibilidad sin romper la composición de la consulta.
- [ ] Evita que la query pueda terminar con `ToList()`.

---

### Secuencias infinitas

375) ¿Por qué LINQ puede trabajar con una secuencia potencialmente infinita si se usa `Take(10)`?

- [ ] Porque `Take(10)` convierte toda la secuencia infinita en un array.
- [ ] Porque LINQ calcula primero todos los valores y luego descarta los sobrantes.
- [x] Porque la evaluación diferida permite pedir solo los primeros 10 elementos.

---

### Lambdas complejas

376) ¿Qué recomienda el apunte cuando una lambda dentro de `Where` se vuelve larga o difícil de leer?

- [x] Extraerla a una variable o método con nombre descriptivo.
- [ ] Reemplazar todos los `Where` por bucles `for`.
- [ ] Materializar siempre antes de escribir la condición.

---

### Mezcla de sintaxis

377) ¿Cuál es la solución idiomática cuando una consulta usa sintaxis de consulta pero necesita un método sin equivalente, como `Take(10)`?

- [ ] No se puede resolver con LINQ.
- [x] Encadenar el método sobre el resultado de la consulta.
- [ ] Reescribir `Take(10)` como `orderby`.

---

# Examen de principios SOLID en C#

## Principios SOLID en C#

---

### Propósito de SOLID

378) ¿Cuál es el objetivo principal de los principios SOLID?

- [ ] Hacer que todo el código use herencia.
- [x] Guiar el diseño para que el código sea más mantenible, extensible, entendible y testeable.
- [ ] Evitar el uso de interfaces y abstracciones.

---

### Cambio de requisitos

379) ¿Por qué SOLID es útil en sistemas reales?

- [ ] Porque el código real nunca cambia.
- [ ] Porque elimina la necesidad de pruebas.
- [x] Porque ayuda a reducir el impacto de cambios, bugs y nuevos requisitos.

---

### Los cinco principios

380) ¿Qué contiene el acrónimo SOLID?

- [x] Cinco principios de diseño orientado a objetos.
- [ ] Cinco tipos primitivos de C#.
- [ ] Cinco patrones obligatorios de base de datos.

---

### SRP

381) ¿Qué afirma el Single Responsibility Principle?

- [ ] Una clase debe tener un solo método.
- [x] Una clase debe tener una sola razón para cambiar.
- [ ] Una clase debe implementar todas las interfaces posibles.

---

### Responsabilidad

382) En SRP, ¿Qué es una responsabilidad?

- [ ] Cualquier línea individual de código.
- [ ] Un método privado sin parámetros.
- [x] Un conjunto coherente de funciones que cambian juntas.

---

### Señal de SRP

383) ¿Cuál es una señal de que una clase puede estar violando SRP?

- [x] Cambia por motivos muy distintos, como reglas de negocio, persistencia y notificación.
- [ ] Tiene un constructor.
- [ ] Expone una propiedad de solo lectura.

---

### Aplicación de SRP

384) ¿Qué busca una refactorización guiada por SRP?

- [ ] Dividir cada método en una clase distinta sin mirar el contexto.
- [x] Separar responsabilidades que cambian por razones diferentes.
- [ ] Reemplazar todas las clases por métodos estáticos.

---

### Exceso de separación

385) ¿Qué riesgo aparece si se aplica SRP de forma exagerada?

- [ ] El código se vuelve imposible de compilar.
- [ ] Todas las clases quedan automáticamente acopladas.
- [x] Se pueden crear demasiadas clases pequeñas y anémicas, difíciles de seguir.

---

### OCP

386) ¿Qué significa Open/Closed Principle?

- [x] El software debe estar abierto a extensión y cerrado a modificación.
- [ ] El software debe estar cerrado a extensión y abierto a modificación.
- [ ] Toda clase debe ser pública y mutable.

---

### Extensión

387) ¿Qué busca OCP al agregar una nueva variante de comportamiento?

- [ ] Modificar siempre el método central existente.
- [x] Agregar código nuevo sin tocar código ya probado y funcionando.
- [ ] Borrar las abstracciones para simplificar.

---

### Señal de OCP

388) ¿Cuál es una señal frecuente de violación de OCP?

- [ ] Usar polimorfismo.
- [ ] Crear una interfaz pequeña.
- [x] Tener que agregar un nuevo `if`, `else if` o `switch` cada vez que aparece una variante.

---

### Polimorfismo y OCP

389) ¿Cómo ayuda el polimorfismo a cumplir OCP?

- [x] Permite agregar implementaciones nuevas detrás de una abstracción común.
- [ ] Obliga a que todas las clases tengan los mismos campos privados.
- [ ] Impide que existan métodos abstractos.

---

### Strategy

390) ¿Qué aporta una estrategia intercambiable al diseño?

- [ ] Hace que una clase dependa de más detalles concretos.
- [x] Permite cambiar una regla de comportamiento mediante composición.
- [ ] Elimina la necesidad de validar datos.

---

### Herencia vs. composición

391) ¿Cuándo conviene preferir composición sobre herencia?

- [ ] Cuando solo se quiere reutilizar o variar comportamiento sin una relación "es un" estable.
- [ ] Cuando se necesita que una subclase reemplace correctamente a su base.
- [x] Cuando el comportamiento debe ser flexible y no depende de una jerarquía conceptual fuerte.

---

### LSP

392) ¿Qué exige Liskov Substitution Principle?

- [x] Que una subclase pueda usarse donde se espera la clase base sin romper el programa.
- [ ] Que toda clase tenga una única responsabilidad.
- [ ] Que cada interfaz tenga muchos métodos.

---

### Contrato de la clase base

393) ¿Qué debe respetar una subclase para cumplir LSP?

- [ ] Solo el nombre de la clase base.
- [x] Las expectativas, precondiciones, postcondiciones e invariantes del tipo base.
- [ ] La ubicación física del archivo.

---

### Precondiciones

394) ¿Qué significa "no fortalecer precondiciones" en LSP?

- [ ] La subclase puede exigir condiciones más restrictivas que la base.
- [x] La subclase no debe exigir más de lo que exige la clase base para usar una operación.
- [ ] La subclase debe eliminar todas las validaciones.

---

### Postcondiciones

395) ¿Qué significa "no debilitar postcondiciones" en LSP?

- [ ] La subclase puede prometer menos que la base.
- [ ] La subclase debe devolver siempre `null`.
- [x] La subclase debe cumplir al menos las garantías que promete la clase base.

---

### Señal de LSP

396) ¿Cuál es una señal de posible violación de LSP?

- [x] Código que pregunta por subtipos concretos para evitar comportamientos inesperados.
- [ ] Código que usa una interfaz pequeña.
- [ ] Código que recibe una abstracción por constructor.

---

### ISP

397) ¿Qué afirma Interface Segregation Principle?

- [ ] Los clientes deben depender de una interfaz grande y completa.
- [x] Los clientes no deben depender de métodos que no usan.
- [ ] Toda interfaz debe tener estado interno.

---

### Interfaces pequeñas

398) ¿Qué diseño se alinea mejor con ISP?

- [ ] Una interfaz enorme con todas las operaciones posibles.
- [ ] Una clase concreta usada directamente por todos los clientes.
- [x] Varias interfaces pequeñas, específicas y cohesivas.

---

### Métodos no soportados

399) ¿Qué problema intenta evitar ISP?

- [x] Implementaciones obligadas a lanzar errores en métodos que no tienen sentido para ellas.
- [ ] El uso de métodos públicos.
- [ ] El uso de nombres descriptivos.

---

### Cliente y contrato

400) Según ISP, ¿de qué debería depender un cliente?

- [ ] De todos los métodos que existen en el sistema.
- [x] Solo del contrato que realmente necesita usar.
- [ ] De una clase concreta con todas las capacidades.

---

### Relación entre ISP y LSP

401) ¿Cómo puede ISP ayudar a LSP?

- [ ] Haciendo que todas las clases hereden de una sola base.
- [x] Evitando que los tipos prometan operaciones que luego no pueden cumplir correctamente.
- [ ] Eliminando la necesidad de polimorfismo.

---

### DIP

402) ¿Qué afirma Dependency Inversion Principle?

- [x] Los módulos de alto nivel y bajo nivel deben depender de abstracciones.
- [ ] Los módulos de alto nivel deben crear directamente todas sus dependencias concretas.
- [ ] Las abstracciones deben depender de detalles técnicos.

---

### Módulos de alto nivel

403) ¿Qué se considera un módulo de alto nivel en DIP?

- [ ] Un detalle técnico como escribir un archivo o enviar un correo.
- [x] Código que expresa reglas o lógica importante del negocio.
- [ ] Una clase que solo contiene constantes.

---

### Detalles técnicos

404) ¿Qué se considera un módulo de bajo nivel en DIP?

- [ ] La política central del dominio.
- [ ] Una regla de negocio abstracta.
- [x] Un detalle concreto como persistencia, envío de mensajes o acceso a un servicio externo.

---

### Inyección de dependencias

405) ¿Qué permite la inyección de dependencias?

- [x] Entregar implementaciones concretas desde afuera a código que depende de abstracciones.
- [ ] Hacer que una clase construya internamente todos sus detalles con `new`.
- [ ] Evitar que existan interfaces.

---

### Testeabilidad

406) ¿Por qué DIP mejora la testeabilidad?

- [ ] Porque elimina la necesidad de probar casos de error.
- [ ] Porque obliga a usar servicios reales en los tests.
- [x] Porque permite reemplazar detalles externos por dobles, mocks o implementaciones en memoria.

---

### Desacoplamiento

407) ¿Qué ventaja aporta depender de abstracciones?

- [x] Cambiar una implementación concreta afecta menos al código que la usa.
- [ ] El código queda más acoplado a una única tecnología.
- [ ] Las pruebas se vuelven imposibles.

---

### Señales de refactor

408) ¿Cuál de estas señales indica que el diseño puede necesitar refactorización?

- [ ] Clases con nombres claros y responsabilidades separadas.
- [x] Clases enormes, `if/else` sobre tipos o creación directa de infraestructura en lógica de negocio.
- [ ] Interfaces específicas para capacidades puntuales.

---

### Criterio práctico

409) ¿Cómo deben aplicarse los principios SOLID?

- [ ] Como dogmas obligatorios aunque el problema sea simple.
- [x] Como guías, con criterio, cuando la complejidad del diseño lo justifica.
- [ ] Solo después de eliminar todas las abstracciones.

---

# Examen de Patrón Decorador

## Patrón Decorador en C#

### Concepto central

410) ¿Cuál es la idea principal del patrón Decorador?

- [ ] Crear una clase hija por cada combinación posible de funcionalidades.
- [x] Agregar comportamiento envolviendo un objeto con otro que implementa la misma interfaz.
- [ ] Cambiar la interfaz pública de un objeto para adaptarlo a otro sistema.

---

### Responsabilidades

411) ¿Por qué conviene separar logging, validación, retry o cache en decoradores independientes?

- [x] Porque cada capa tiene una responsabilidad clara y la clase original no se modifica por cambios ajenos a su función principal.
- [ ] Porque todos esos comportamientos deben ejecutarse siempre dentro del constructor del objeto original.
- [ ] Porque el decorador elimina la necesidad de usar interfaces.

---

### Composición vs. herencia

412) ¿Qué problema intenta evitar el Decorador frente a una solución basada en herencia?

- [ ] Que los objetos puedan combinarse en tiempo de ejecución.
- [ ] Que una clase implemente una interfaz común.
- [x] La explosión combinatoria de clases como `EmailConLoggingYRetryYCache`.

---

### Orden de decoradores

413) En una composición como `new Logging(new Validacion(new Servicio()))`, ¿por qué importa el orden de las capas?

- [ ] Porque el orden sólo afecta el nombre de las clases, no la ejecución.
- [x] Porque cambia qué comportamiento se ejecuta primero y qué capas llegan a intervenir ante errores.
- [ ] Porque C# no permite anidar más de un decorador por interfaz.

---

### Decorador vs. Adapter

414) ¿Cuál es la diferencia esencial entre Decorador y Adapter?

- [ ] El Decorador controla acceso remoto y el Adapter agrega cache.
- [ ] El Decorador sólo funciona con clases abstractas y el Adapter sólo con `struct`.
- [x] El Decorador mantiene la misma interfaz y agrega comportamiento; el Adapter cambia una interfaz para compatibilizar algo incompatible.

---

# Examen de Patrón Builder

## Patrón Builder en C#

### Concepto central

415) ¿Para qué sirve el patrón Builder?

- [x] Para construir objetos complejos paso a paso, separando el proceso de construcción del objeto final.
- [ ] Para envolver un objeto con otro que implementa la misma interfaz.
- [ ] Para decidir únicamente qué implementación concreta crear según un texto.

---

### Constructor telescópico

416) ¿Qué problema busca evitar Builder cuando una clase tiene muchos parámetros opcionales o booleanos?

- [ ] Que el objeto final pueda tener propiedades de solo lectura.
- [x] Constructores largos o muchas sobrecargas donde la intención de cada argumento queda poco clara.
- [ ] Que los métodos del builder devuelvan `this`.

---

### Fluent Interface

417) ¿Qué permite que un método de builder devuelva `return this;`?

- [ ] Que `Build()` se ejecute automáticamente al crear el builder.
- [ ] Que el objeto final sea mutable después de construido.
- [x] Encadenar llamadas como `.ConMasa("fina").ConJamon().Build()`.

---

### Validación

418) ¿Por qué tiene sentido validar en el método `Build()`?

- [x] Porque ahí se intenta cerrar la construcción y producir un objeto final consistente.
- [ ] Porque `Build()` debe modificar el objeto final cada vez que se lee una propiedad.
- [ ] Porque las validaciones no pueden hacerse dentro de métodos del builder.

---

### Step Builder

419) ¿Qué ventaja aporta un Step Builder frente a un builder simple?

- [ ] Elimina la necesidad de tener un objeto final.
- [ ] Hace que todas las propiedades sean públicas y modificables.
- [x] Usa interfaces para forzar el orden de construcción y evitar llamadas inválidas como `Build()` demasiado temprano.

---

# Examen de JSON

## JSON — El formato de intercambio de datos

### Formato estándar

420) ¿Por qué JSON es útil para intercambiar datos entre programas escritos en distintos lenguajes?

- [ ] Porque guarda los objetos con la misma representación binaria que tienen en memoria.
- [x] Porque representa datos estructurados como texto con reglas conocidas por muchos lenguajes.
- [ ] Porque permite ejecutar código C# dentro de cualquier archivo de texto.

---

### Sintaxis de valores

421) ¿Cuál de estas afirmaciones sobre la sintaxis de JSON es correcta?

- [x] Las claves de los objetos y los strings usan comillas dobles.
- [ ] Los booleanos se escriben como `True` y `False`.
- [ ] El último par clave-valor de un objeto debe terminar siempre con coma.

---

### Estructuras anidadas

422) En JSON, ¿Qué representa una estructura como esta?

```json
[
  { "id": 1, "nombre": "Ada" },
  { "id": 2, "nombre": "Alan" }
]
```

- [ ] Un objeto con dos claves llamadas `id` y `nombre`.
- [ ] Un string que contiene objetos separados por comas.
- [x] Un array de objetos.

---

### Serialización

423) ¿Qué hace `JsonSerializer.Serialize(objeto)` en C#?

- [ ] Convierte un string JSON en un objeto C#.
- [x] Convierte un objeto C# en un string JSON.
- [ ] Lee automáticamente un archivo JSON desde disco.

---

### Opciones de `System.Text.Json`

424) ¿Para qué sirve configurar `PropertyNamingPolicy = JsonNamingPolicy.CamelCase`?

- [ ] Para ignorar propiedades extras que aparezcan en el JSON.
- [ ] Para serializar enums siempre como números.
- [x] Para escribir nombres de propiedades como `"nombre"` en lugar de `"Nombre"`.
