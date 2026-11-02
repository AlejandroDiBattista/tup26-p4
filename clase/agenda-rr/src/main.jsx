import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import Lista from "./paginas/Lista.jsx";
import Formulario from "./paginas/Formulario.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <main className="tarjeta">
        <Routes>
          <Route path="/"           element={<Lista />} />
          <Route path="/nuevo"      element={<Formulario />} />
          <Route path="/editar/:id" element={<Formulario />} />
        </Routes>
      </main>
    </BrowserRouter>
  </StrictMode>,
);
