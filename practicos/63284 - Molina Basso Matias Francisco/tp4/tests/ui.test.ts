import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Ejecuta los handlers reales del JSX, aislando hooks y HTTP.
// La integración visual y los campos se verifican además en navegador.
const html = await readFile("public/MiniCRM.html", "utf8");
const jsx = html.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert.ok(jsx);
const source = ts.transpileModule(jsx, {
  fileName: "MiniCRM.tsx",
  compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;

function setup() {
  const state: any[] = [];
  let cursor = 0;
  let root: any;
  let accept = false;
  const prompts: string[] = [];
  const requests: string[] = [];
  const useState = (initial: any) => {
    const index = cursor++;
    if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
    return [state[index], (value: any) => {
      state[index] = typeof value === "function" ? value(state[index]) : value;
    }];
  };
  const scope = {
    React: {
      useState,
      useRef: (value: any) => useState({ current: value })[0],
      useEffect: () => {},
      useId: () => "test-field",
      createElement: (type: any, props: any, ...children: any[]) => ({ type, props: { ...props, children } }),
    },
    ReactDOM: { createRoot: () => ({ render: (element: any) => { root = element; } }) },
    document: { getElementById: () => ({}) },
    window: { crearClienteMcp: () => ({}) },
    confirm: (message: string) => { prompts.push(message); return accept; },
    fetch: async (url: string) => {
      requests.push(url);
      return { ok: true, status: 200, json: async () => ({ id: Number(url.split("/").pop()), nombre: "Ana", apellido: "Prueba", email: "ana@example.com", actividades: [] }) };
    },
  };
  runInNewContext(source, scope);
  function render() { cursor = 0; return root.type(); }
  function component(name: string) {
    const children = render().props.children.flat(Infinity);
    const element = children.find((child: any) => child?.type?.name === name);
    assert.ok(element, `Componente ${name} presente`);
    return element.props;
  }
  return {
    render, component, prompts, requests,
    accept: () => { accept = true; },
    dirty: () => render().props.onDraft(),
    selected: async () => { await render().props.master.props.onSelect(1); },
  };
}

test("Borrador nuevo de actividad: rechazar descarte bloquea cada operación destructiva del formulario", async () => {
  const actions: Record<string, (ui: ReturnType<typeof setup>) => unknown> = {
    editarActividad: ui => ui.component("ClientDetail").setActivity({ id: 2 }),
    editarCliente: ui => ui.component("ClientDetail").onEdit(),
    completar: ui => ui.component("ClientDetail").onComplete(2),
    borrarActividad: ui => ui.component("ClientDetail").onDeleteActivity(2),
    borrarCliente: ui => ui.component("ClientDetail").onDelete(),
    cancelar: ui => ui.component("ClientDetail").onCancelActivity(),
    seleccionar: ui => ui.render().props.master.props.onSelect(2),
    nuevoCliente: ui => ui.render().props.master.props.onCreate(),
    volver: ui => ui.component("Button").onClick(),
  };
  for (const [name, action] of Object.entries(actions)) {
    const ui = setup();
    await ui.selected();
    ui.dirty();
    const requestCount = ui.requests.length;
    await action(ui);
    assert.equal(ui.prompts.length, 1, name);
    assert.match(ui.prompts[0], /Descartar/);
    assert.equal(ui.requests.length, requestCount, name);
    assert.equal(ui.component("ClientDetail").client.id, 1, name);
    assert.equal(ui.component("ClientDetail").activity, null, name);
    assert.equal(ui.render().props.transportDisabled, true, name);
  }
});

test("Borrador en edición de actividad: conservar al rechazar y cambiar solo al aceptar", async () => {
  const ui = setup();
  await ui.selected();
  ui.component("ClientDetail").setActivity({ id: 2 });
  assert.equal(ui.prompts.length, 0);
  ui.dirty();
  ui.component("ClientDetail").setActivity({ id: 3 });
  assert.equal(ui.component("ClientDetail").activity.id, 2);
  ui.accept();
  ui.component("ClientDetail").setActivity({ id: 3 });
  assert.equal(ui.component("ClientDetail").activity.id, 3);
  assert.equal(ui.prompts.length, 2);
});

test("Clientes nuevos y editados conservan borrador al cancelar o navegar sin aceptar", async () => {
  for (const edit of [false, true]) {
    const ui = setup();
    if (edit) {
      await ui.selected();
      ui.component("ClientDetail").onEdit();
    } else ui.render().props.master.props.onCreate();
    ui.dirty();
    const original = ui.component("ClientForm");
    ui.component("ClientForm").onCancel();
    await ui.render().props.master.props.onSelect(2);
    ui.render().props.master.props.onCreate();
    assert.equal(ui.prompts.length, 3);
    assert.equal(ui.component("ClientForm").key, original.key);
    ui.accept();
    ui.component("ClientForm").onCancel();
    assert.equal(ui.render().props.transportDisabled, false);
  }
});

test("Reiniciar un alta confirmada remonta el formulario; sin cambios no pide confirmación", () => {
  const ui = setup();
  ui.render().props.master.props.onCreate();
  const key = ui.component("ClientForm").key;
  ui.dirty();
  ui.accept();
  ui.render().props.master.props.onCreate();
  assert.notEqual(ui.component("ClientForm").key, key);
  assert.equal(ui.prompts.length, 1);
  ui.component("ClientForm").onCancel();
  assert.equal(ui.prompts.length, 1);
});
