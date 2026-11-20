import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
// Base temporal: las pruebas nunca modifican los datos de uso real.
const dir=await mkdtemp(join(tmpdir(),'minicrm-'));
process.env.DATABASE_URL='file:'+join(dir,'test.db').replaceAll('\\','/');
const {app}=await import('../src/app.js');
const {prepararBase,client,db}=await import('../src/db/index.js');
const {actividades}=await import('../src/db/schema.js');
await test('API completa, validaciones, restricciones y persistencia',async()=>{
 await prepararBase();
 const server=app.listen(0,'127.0.0.1');
 await new Promise<void>(resolve=>server.once('listening',resolve));
 const address=server.address();assert.ok(address&&typeof address!=='string');
 const root='http://127.0.0.1:'+address.port;
 async function request(url:string,method='GET',body?:unknown,status=200){const r=await fetch(root+url,{method,headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});assert.equal(r.status,status,method+' '+url);return r.status===204?null:r.json();}
 const data={nombre:'Ana García',email:'ana@example.com',telefono:'381 555 0123',direccion:'San Martín 450'};
 try {
  const home=await fetch(root+'/');assert.equal(home.status,200);const html=await home.text();assert.ok(html.includes('text/babel'));assert.ok(html.includes('fetch('));
  assert.deepEqual(await request('/api/clientes'),[]);
  await request('/api/clientes','POST',{},400);
  await request('/api/clientes','POST',{...data,email:'incorrecto'},400);
  await request('/api/clientes/abc','GET',undefined,400);
  const c=await request('/api/clientes','POST',data,201);
  for(const q of ['garcia','ANA@EXAMPLE.COM','555','san martin',String(c.id)])assert.equal((await request('/api/clientes?q='+encodeURIComponent(q)))[0].id,c.id);
  assert.equal((await request('/api/clientes/'+c.id)).actividades.length,0);
  assert.equal((await request('/api/clientes/'+c.id,'PUT',{...data,nombre:'Ana actualizada'})).nombre,'Ana actualizada');
  const prefix='/api/clientes/'+c.id+'/actividades';
  await request(prefix,'POST',{descripcion:' '},400);
  await request(prefix,'POST',{descripcion:'Fecha incorrecta',fecha:'2026-02-30'},400);
  const a=await request(prefix,'POST',{descripcion:'Llamar',fecha:'2026-10-01',completada:true},201);
  assert.equal(a.completada,false);
  assert.equal((await request(prefix+'/'+a.id,'PUT',{descripcion:'Enviar propuesta',fecha:null})).fecha,null);
  const otro=await request('/api/clientes','POST',{...data,nombre:'Otro'},201);
  await request('/api/clientes/'+otro.id+'/actividades/'+a.id,'DELETE',undefined,404);
  const done=await request(prefix+'/'+a.id+'/completar','PATCH');assert.equal(done.completada,true);assert.ok(done.completadaEn);
  await request(prefix+'/'+a.id,'PUT',{descripcion:'Alteración'},409);
  await request(prefix+'/'+a.id,'DELETE',undefined,409);
  await request(prefix+'/'+a.id+'/completar','PATCH',undefined,409);
  assert.equal((await request('/api/clientes/'+c.id)).actividades[0].descripcion,'Enviar propuesta');
  const pending=await request(prefix,'POST',{descripcion:'Pendiente sin fecha'},201);
  await request(prefix+'/'+pending.id,'DELETE',undefined,204);
  const persisted=await db.select().from(actividades);assert.equal(persisted.length,1);
  await request('/api/clientes/'+c.id,'DELETE',undefined,204);
  assert.equal((await db.select().from(actividades)).length,0);
  await request('/api/clientes/'+c.id,'GET',undefined,404);
  await request('/api/clientes/'+otro.id,'DELETE',undefined,204);
  await request('/api/no-existe','GET',undefined,404);
  const malformed=await fetch(root+'/api/clientes',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});assert.equal(malformed.status,400);
 } finally {await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));client.close();await rm(dir,{recursive:true,force:true});}
});
