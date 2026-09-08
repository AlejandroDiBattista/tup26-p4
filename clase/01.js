
import path from "node:path";
import {mkdir} from "node:fs/promises"

let p = console.log

let ruta = path.resolve( "..", "..", "datos.json")
p(ruta)
p(path.dirname(ruta))
p(path.basename(ruta))
p(path.extname(ruta))
p(path.parse(ruta))

path.parse(ruta);
await mkdir("uno/dos",{recursive:true})