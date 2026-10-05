import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
archivo_env = Path(__file__).with_name(".env")
if archivo_env.exists():
    for linea in archivo_env.read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if not linea or linea.startswith("#"):
            continue
        nombre, separador, valor = linea.partition("=")
        if not separador:
            continue
        valor = valor.strip().strip("\"'")
        os.environ.setdefault(nombre.strip(), valor)
api_key = os.environ.get("OPENAI_API_KEY", "").strip()
if not api_key:
    raise RuntimeError("Falta OPENAI_API_KEY. Configurala como variable de entorno o en el archivo .env.")
modelo = os.environ.get("OPENAI_MODEL", "gpt-6-luna").strip() or "gpt-6-luna"
url_api = "https://api.openai.com/v1/chat/completions"
herramientas = [
    {
        "type": "function",
        "function": {
            "name": "leerArchivo",
            "description": "Lee un archivo de texto y devuelve su contenido",
            "parameters": {
                "type": "object",
                "properties": {
                    "ruta": {"type": "string", "description": "Ruta del archivo"},
                },
                "required": ["ruta"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "escribirArchivo",
            "description": "Crea un archivo de texto o reemplaza su contenido por el indicado",
            "parameters": {
                "type": "object",
                "properties": {
                    "ruta": {"type": "string", "description": "Ruta del archivo"},
                    "contenido": {"type": "string", "description": "Texto completo que se guardará"},
                },
                "required": ["ruta", "contenido"],
            },
        },
    },
]
def leerArchivo(ruta):
    return Path(ruta).read_text(encoding="utf-8")

def escribirArchivo(ruta, contenido):
    ruta_archivo = Path(ruta)
    ruta_archivo.parent.mkdir(parents=True, exist_ok=True)
    ruta_archivo.write_text(contenido, encoding="utf-8")
    return "Archivo guardado"

funciones = {
        "leerArchivo": leerArchivo,
        "escribirArchivo": escribirArchivo,
    }

def ejecutar_herramienta(llamada):
    nombre = llamada.get("function", {}).get("name", "")
    identificador = llamada.get("id", "")
    try:
        if nombre not in funciones:
            raise ValueError(f"Herramienta desconocida: {nombre}")
        argumentos = json.loads(llamada["function"].get("arguments", "{}"))
        if not isinstance(argumentos, dict):
            raise ValueError("Los argumentos de la herramienta deben ser un objeto JSON.")
        print(f"  🔧 {nombre}({argumentos.get('ruta', '')})")
        resultado = funciones[nombre](**argumentos)
    except Exception as error:
        resultado = f"Error: {error}"
    return {
        "role": "tool",
        "tool_call_id": identificador,
        "content": str(resultado),
    }
def llamar_api(mensajes):
    cuerpo = {
        "model": modelo,
        "messages": mensajes,
        "tools": herramientas,
        "reasoning_effort": "none",
    }
    datos = json.dumps(cuerpo).encode("utf-8")
    solicitud = urllib.request.Request(
        url_api,
        data=datos,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(solicitud, timeout=60) as respuesta:
            datos_respuesta = json.loads(respuesta.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        cuerpo_error = error.read().decode("utf-8", errors="replace")
        try:
            detalle = json.loads(cuerpo_error).get("error", {}).get("message", cuerpo_error)
        except json.JSONDecodeError:
            detalle = cuerpo_error
        raise RuntimeError(f"La API respondió con el código de estado {error.code}: {detalle}") from error
    mensaje = datos_respuesta.get("choices", [{}])[0].get("message")
    if not mensaje:
        raise RuntimeError("La API no devolvió ningún mensaje.")
    return mensaje

def responder(mensajes):
    while True:
        mensaje = llamar_api(mensajes)
        mensajes.append(mensaje)
        llamadas = mensaje.get("tool_calls", [])
        if not llamadas:
            return mensaje.get("content") or ""
        for llamada in llamadas:
            mensajes.append(ejecutar_herramienta(llamada))
mensajes = [
    {
        "role": "system",
        "content": "Sos un asistente de programación. Podés leer y escribir archivos con las herramientas disponibles. Respondé en español y en forma breve.",
    },
]

print("Asistente iniciado. Escribí 'salir' para terminar.")
while True:
    try:
        texto = input("\nVos: ").strip()
    except EOFError:
        break
    if texto.lower() == "salir":
        break
    if not texto:
        continue
    mensajes.append({"role": "user", "content": texto})
    try:
        print(f"\nAsistente: {responder(mensajes)}")
    except Exception as error:
        print(f"\nError: {error}", file=sys.stderr)
