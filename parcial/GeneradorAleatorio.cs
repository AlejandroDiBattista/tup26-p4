using System;
using System.Collections.Generic;

public static class Aleatorio {
    public static void Main() {
        Console.WriteLine(string.Join(", ", GenerarExamen(12345, 100, 10)));

        var codigo = "12345.19.abc123";
        var codigoCompleto = $"{codigo}.{CalcularSumaDeControl(codigo)}";
        Console.WriteLine($"Código: {codigoCompleto}");
        Console.WriteLine($"¿Válido? {EsCodigoValido(codigoCompleto)}");
    }

    public static List<int> GenerarExamen(long semilla, int maximo = 424, int cantidad = 10) {
        const long multiplicador = 48271;
        const long modulo        = 2147483647;
        const int saltar         = 22;


        var numeros = new List<int>();
        for (var numero = 1; numero <= maximo; numero++) {
            numeros.Add(numero);
        }

        var estado = semilla % modulo;
        for (var i = 0; i < saltar; i++) {
            estado = (estado * multiplicador) % modulo;
        }

        // Algoritmo de Fisher-Yates para mezclar el array
        for (var i = numeros.Count - 1; i > 0; i--) {
            estado = (estado * multiplicador) % modulo;
            var j = (int)(estado % (i + 1));
            (numeros[i], numeros[j]) = (numeros[j], numeros[i]);
        }

        return numeros.GetRange(0, cantidad);
    }

    // Suma de control: suma ponderada de códigos de carácter mod 97, resultado de 2 dígitos (00–96).
    // Ejemplo: "12345.19.abc" → posición 1='1'(49*1) + posición 2='2'(50*2) + ...
    public static string CalcularSumaDeControl(string codigo) {
        long suma = 0;
        for (int i = 0; i < codigo.Length; i++) {
            suma += (long)codigo[i] * (i + 1);
        }
        return (suma % 97).ToString("D2");
    }

    // Recibe el código completo (con suma de control al final, separada por punto).
    // Devuelve true si los últimos 2 dígitos coinciden con la suma calculada sobre el resto.
    public static bool EsCodigoValido(string codigoCompleto) {
        var ultimoPunto = codigoCompleto.LastIndexOf('.');
        if (ultimoPunto < 0) return false;

        var base64 = codigoCompleto[..ultimoPunto];
        var sumaRecibida = codigoCompleto[(ultimoPunto + 1)..];
        return sumaRecibida == CalcularSumaDeControl(base64);
    }
}
