import "./style.css";
fetch("http://localhost:3000/productos")
  .then((res) => res.json())
  .then((data) => {
    console.log(data);

    document.querySelector("#app").innerHTML = `
      <h1>Productos</h1>

      ${data
        .map(
          (producto) => `
            <div>
              <h2>${producto.nombre}</h2>
              <p>$${producto.precio}</p>
            </div>
          `
        )
        .join("")}
    `;
  })
  .catch((error) => console.log(error));