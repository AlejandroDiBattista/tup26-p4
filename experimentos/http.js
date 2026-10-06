const { STATUS_CODES, createServer } = require('node:http');

// Trabaja con mensajes de texto completos, sin streaming ni codificación chunked.
class Request {
    constructor(http, ruta = null) {
        const texto = http.toString();
        const separador = /\r?\n\r?\n/.exec(texto);
        if (!separador) throw new Error('Solicitud HTTP incompleta');

        const lineas = texto.slice(0, separador.index).split(/\r?\n/);
        const inicio = /^(\S+) (\S+) HTTP\/(1\.[01])$/.exec(lineas.shift());
        if (!inicio) throw new Error('Línea de solicitud HTTP inválida');

        [, this.metodo, this.url, this.version] = inicio;
        this.cabeceras = Object.create(null);
        for (const linea of lineas) {
            const posicion = linea.indexOf(':');
            if (posicion <= 0) throw new Error('Cabecera HTTP inválida');
            const key = linea.slice(0, posicion).trim().toLowerCase();
            const value = linea.slice(posicion + 1).trim();
            this.cabeceras[key] = value;
        }
        this.cuerpo = texto.slice(separador.index + separador[0].length);
        this.params = {};
        // La ruta opcional indica los nombres: /usuarios/:id.
        if (ruta) this.match(ruta);
    }

    match(ruta) {
        const patron = ruta.split('/');
        const segmentos = this.path.split('/');
        const esParametro = parte => parte.startsWith(':') && parte.length > 1;
        this.params = {};
        if (patron.length !== segmentos.length || !patron.every((parte, i) =>
            esParametro(parte) ? segmentos[i] !== '' : parte === segmentos[i]
        )) return false;

        this.params = Object.fromEntries(patron.flatMap((parte, i) =>
            esParametro(parte) ? [[parte.slice(1), decodeURIComponent(segmentos[i])]] : []
        ));
        return true;
    }

    get method() {
        return this.metodo;
    }
    
    get path() {
        return this.url.split('?')[0];
    }

    get query() {
        const posicion = this.url.indexOf('?');
        const consulta = posicion < 0 ? '' : this.url.slice(posicion + 1);
        // Si una clave se repite, se conserva su último valor.
        return Object.fromEntries(new URLSearchParams(consulta));
    }

    get headers() {
        return this.cabeceras;
    }

    get body() {
        return this.cuerpo;
    }
}

class Response {
    constructor(mensaje = '', estado = 200) {
        this.headers = {};
        this.texto = String(mensaje);
        this.state(estado);
    }   

    writeHeader(codigo, cabecera = {}) {
        this.state(codigo);
        this.headers = { ...this.headers, ...Object.fromEntries(
            Object.entries(cabecera).map(([key, value]) => [key.toLowerCase(), value])
        ) };
        return this;
    }

    send(texto = '') {
        this.texto += texto;
        return this;
    }
    
    end(texto = '') {
        return this.send(texto);
    }

    state(codigo) {
        if (!Number.isInteger(codigo) || codigo < 100 || codigo > 599) {
            throw new RangeError('Código de estado HTTP inválido');
        }
        this.stateCode = codigo;
        return this;
    }

    status(codigo) {
        return this.state(codigo);
    }

    json(datos) {
        this.texto = JSON.stringify(datos) ?? '';
        this.headers['content-type'] = 'application/json; charset=utf-8';
        return this;
    }

    toHttp() {
        const headers = Object.fromEntries(
            Object.entries(this.headers).map(([key, value]) => [key.toLowerCase(), value])
        );
        const sinCuerpo = this.stateCode < 200 || this.stateCode === 204 || this.stateCode === 304;
        const body = sinCuerpo ? '' : this.texto;
        // La salida siempre es un mensaje completo, nunca chunked.
        delete headers['transfer-encoding'];
        if (sinCuerpo) {
            delete headers['content-length'];
        } else {
            headers['content-type'] ??= 'text/plain; charset=utf-8';
            headers['content-length'] = Buffer.byteLength(body, 'utf8');
        }

        const inicio = `HTTP/1.1 ${this.stateCode} ${STATUS_CODES[this.stateCode] || ''}`;
        const cabeceras = Object.entries(headers).map(([key, value]) => `${key}: ${value}`);
        return [inicio, ...cabeceras, '', body].join('\r\n');
    }
}

class Express {
    constructor() {
        this.rutas = [];
    }

    route(metodo, ruta, callback) {
        this.rutas.push({ metodo, ruta, callback });
        return this;
    }

    get(ruta, callback) {
        return this.route('GET', ruta, callback);
    }

    post(ruta, callback) {
        return this.route('POST', ruta, callback);
    }

    put(ruta, callback) {
        return this.route('PUT', ruta, callback);
    }

    delete(ruta, callback) {
        return this.route('DELETE', ruta, callback);
    }

    use(middleware) {
        return this.route(null, null, middleware);
    }

    listen(puerto, callback) {
        return createServer(async (entrada, salida) => {
            const res = new Response();
            const fallar = (error) => {
                if (salida.writableEnded) return;
                const codigo = error instanceof URIError ? 400 : 500;
                salida.writeHead(codigo, { 'content-type': 'text/plain; charset=utf-8' });
                salida.end(codigo === 400 ? 'URL inválida' : 'Error interno del servidor');
            };

            // En el servidor, send/json/end envían la respuesta y cierran su escritura.
            for (const nombre of ['send', 'json']) {
                const original = res[nombre].bind(res);
                res[nombre] = (...args) => {
                    if (salida.writableEnded) return res;
                    original(...args);
                    salida.writeHead(res.stateCode, {
                        'content-type': 'text/plain; charset=utf-8', ...res.headers,
                    });
                    salida.end(res.texto);
                    return res;
                };
            }

            try {
                const partes = [];
                for await (const parte of entrada) partes.push(parte);
                const cabeceras = [];
                for (let i = 0; i < entrada.rawHeaders.length; i += 2) {
                    cabeceras.push(`${entrada.rawHeaders[i]}: ${entrada.rawHeaders[i + 1]}`);
                }
                const inicio = `${entrada.method} ${entrada.url} HTTP/${entrada.httpVersion}`;
                const req = new Request([inicio, ...cabeceras, '', Buffer.concat(partes).toString()].join('\r\n'));

                const ejecutar = async (indice = 0) => {
                    if (salida.writableEnded) return;
                    try {
                        const capa = this.rutas[indice];
                        if (!capa) return res.status(404).send('No encontrado');
                        const metodo = req.method === 'HEAD' ? 'GET' : req.method;
                        if (capa.metodo && (capa.metodo !== metodo || !req.match(capa.ruta))) {
                            return ejecutar(indice + 1);
                        }
                        let continuo = false;
                        const next = (error) => {
                            if (continuo || salida.writableEnded) return;
                            continuo = true;
                            return error ? fallar(error) : ejecutar(indice + 1);
                        };
                        await capa.callback(req, res, next);
                    } catch (error) {
                        fallar(error);
                    }
                };
                await ejecutar();
            } catch (error) {
                fallar(error);
            }
        }).listen(puerto, callback);
    }
}
module.exports = { Request, Response, Express };
