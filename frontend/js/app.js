const $ = id => document.getElementById(id);
let carrito = [];
let productoSeleccionado = null;
let totalAPagar = 0;

// --- PRODUCTOS CON PRECIOS ORIGINALES (PARA EL ESTILO ADIDAS) ---
const productosHombres = [
  { id: "h1", name: "Polo Oversize Blanco", type: "Camisa", brand: "Nike", size: "L", color: "Blanco", price: 89.90, oldPrice: 149.90, stock: 20, description: "Polo de algodón peinado con corte oversize.", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", category: "Hombre Originals" },
  { id: "h2", name: "Zapatillas Running", type: "Calzado", brand: "Nike", size: "42", color: "Rojo", price: 299.90, oldPrice: 399.90, stock: 15, description: "Máxima amortiguación y malla transpirable.", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", category: "Running" },
  { id: "h3", name: "Short Deportivo", type: "Camisa", brand: "Adidas", size: "M", color: "Negro", price: 79.90, oldPrice: 119.90, stock: 30, description: "Short ligero ideal para entrenamiento.", img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80", category: "Hombre Originals" },
  { id: "h4", name: "Balón de Fútbol", type: "Pelota", brand: "Mikasa", size: "5", color: "Blanco", price: 120.00, oldPrice: 160.00, stock: 10, description: "Balón cosido a máquina para césped.", img: "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=600&q=80", category: "Fútbol" },
  { id: "h5", name: "Camisa de Botones", type: "Camisa", brand: "Adidas", size: "L", color: "Beige", price: 179.00, oldPrice: 299.00, stock: 12, description: "Camisa de botones 3 tiras.", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80", category: "Hombre Originals" }
];

const productosMujeres = [
  { id: "m1", name: "Top Deportivo", type: "Camisa", brand: "Puma", size: "S", color: "Rosa", price: 69.90, oldPrice: 99.90, stock: 25, description: "Top con soporte medio y secado rápido.", img: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80", category: "Mujer Training" },
  { id: "m2", name: "Leggings Black", type: "Camisa", brand: "Adidas", size: "M", color: "Negro", price: 119.90, oldPrice: 159.90, stock: 40, description: "Leggings de compresión con cintura alta.", img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80", category: "Mujer Originals" },
  { id: "m3", name: "Zapatillas Urbanas", type: "Calzado", brand: "Vans", size: "38", color: "Blanco", price: 199.90, oldPrice: 259.90, stock: 12, description: "Estilo clásico con suela de waffle.", img: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80", category: "Mujer Originals" },
  { id: "m4", name: "Mochila Sport", type: "Accesorio", brand: "Nike", size: "Única", color: "Rosa", price: 149.90, oldPrice: 189.90, stock: 15, description: "Mochila con compartimento para zapatillas.", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", category: "Mujer Training" }
];

const productosNinos = [
  { id: "n1", name: "Zapatillas Colegiales", type: "Calzado", brand: "Bata", size: "32", color: "Negro", price: 89.90, oldPrice: 129.90, stock: 50, description: "Zapatillas resistentes para el día a día.", img: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&q=80", category: "Niños Originals" },
  { id: "n2", name: "Polera de Algodón", type: "Camisa", brand: "Nike", size: "10 años", color: "Rojo", price: 49.90, oldPrice: 79.90, stock: 35, description: "Polera suave y cómoda 100% algodón.", img: "https://images.unsplash.com/photo-1519238263530-99abcf2b3127?w=600&q=80", category: "Niños Originals" },
  { id: "n3", name: "Pelota de Básquet", type: "Pelota", brand: "Spalding", size: "5", color: "Naranja", price: 75.00, oldPrice: 110.00, stock: 20, description: "Pelota de goma para iniciación.", img: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", category: "Niños Básquet" },
  { id: "n4", name: "Gorra Infantil", type: "Accesorio", brand: "Adidas", size: "Única", color: "Azul", price: 45.00, oldPrice: 69.90, stock: 25, description: "Gorra ajustable para niños.", img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80", category: "Niños Originals" }
];

// --- FUNCIÓN PARA RENDERIZAR CON ESTILO ADIDAS ---
function renderizarCategoria(containerId, productos) {
  const root = $(containerId);
  if(!root) return;
  root.replaceChildren();
  
  for (const item of productos) {
    const card = document.createElement("article"); card.className = "item";
    
    // Calculamos el descuento
    const descuento = Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100);

    card.innerHTML = `
      <img src="${item.img}" alt="${item.name}" onclick="abrirDetalleProducto('${item.id}')">
      <div class="price-container">
        <span class="price">S/ ${Number(item.price).toFixed(0)}</span>
        <span class="old-price">S/ ${Number(item.oldPrice).toFixed(0)}</span>
        <span class="badge">-${descuento}%</span>
      </div>
      <h3 onclick="abrirDetalleProducto('${item.id}')">${item.name}</h3>
      <p class="originals-link">${item.category}</p>
      <p class="colors-link">3 colores</p>
      <div class="item-actions">
        <button onclick="abrirDetalleProducto('${item.id}')">VER DETALLE</button>
        <button onclick="agregarAlCarrito('${item.id}')">AGREGAR</button>
      </div>
    `;
    root.append(card);
  }
}

// --- FUNCIONES GLOBALES ---
window.abrirDetalleProducto = (id) => {
  const todos = [...productosHombres, ...productosMujeres, ...productosNinos];
  const item = todos.find(p => p.id === id);
  if (!item) return;

  productoSeleccionado = item;
  $("modal-img").src = item.img;
  $("modal-title").textContent = item.name;
  $("modal-brand").textContent = item.brand;
  $("modal-detail").textContent = `Talla: ${item.size} | Color: ${item.color}`;
  $("modal-price").textContent = `S/ ${Number(item.price).toFixed(2)}`;
  $("modal-stock").textContent = `Stock: ${item.stock} unidades`;
  $("modal-desc").textContent = item.description;
  $("product-modal").style.display = "block";
};

window.agregarAlCarrito = (id) => {
  const todos = [...productosHombres, ...productosMujeres, ...productosNinos];
  const item = todos.find(p => p.id === id);
  if (!item) return;
  
  const existe = carrito.find(p => p.id === item.id);
  if (existe) { existe.qty += 1; } else { carrito.push({ ...item, qty: 1 }); }
  $("cart-count").textContent = carrito.reduce((acc, p) => acc + p.qty, 0);
  alert(`¡${item.name} añadido a tu bolsa!`);
};

// --- LÓGICA DEL CARRITO Y CHECKOUT ---
$("cart-btn").onclick = () => { 
  renderCarrito(); 
  $("cart-step-1").style.display = "block";
  $("cart-step-2").style.display = "none";
  $("cart-modal").style.display = "block"; 
};

$("btn-admin").onclick = () => $("admin-modal").style.display = "block";

$("modal-add-btn").onclick = () => {
  if (!productoSeleccionado) return;
  const existe = carrito.find(p => p.id === productoSeleccionado.id);
  if (existe) { existe.qty += 1; } else { carrito.push({ ...productoSeleccionado, qty: 1 }); }
  $("cart-count").textContent = carrito.reduce((acc, p) => acc + p.qty, 0);
  $("product-modal").style.display = "none";
  alert(`¡${productoSeleccionado.name} añadido a tu bolsa!`);
};

function renderCarrito() {
  const container = $("cart-items-container");
  container.innerHTML = "";
  totalAPagar = 0;

  if (carrito.length === 0) {
    container.innerHTML = "<p style='color:#64748b; text-align:center; padding: 20px;'>Tu bolsa está vacía.</p>";
    $("cart-total").textContent = "S/ 0.00";
    return;
  }

  carrito.forEach((item, index) => {
    totalAPagar += item.price * item.qty;
    const div = document.createElement("div");
    div.style.cssText = "display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding: 15px 0;";
    div.innerHTML = `
      <div style="display: flex; gap: 15px; align-items: center;">
        <img src="${item.img}" style="width: 60px; height: 60px; object-fit: contain; background: #f8fafc; border-radius: 4px;">
        <div>
          <strong style="display: block; font-size: 0.9rem;">${item.name}</strong>
          <small style="color: #64748b;">S/ ${item.price}</small>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <button onclick="restarCantidad(${index})" style="border: 1px solid #cbd5e1; background: white; width: 25px; height: 25px; cursor: pointer;">-</button>
        <span>${item.qty}</span>
        <button onclick="sumarCantidad(${index})" style="border: 1px solid #cbd5e1; background: white; width: 25px; height: 25px; cursor: pointer;">+</button>
        <button onclick="eliminarDelCarrito(${index})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-weight:bold; margin-left: 10px;">&times;</button>
      </div>
    `;
    container.append(div);
  });
  $("cart-total").textContent = `S/ ${totalAPagar.toFixed(2)}`;
}

window.sumarCantidad = (index) => { carrito[index].qty += 1; $("cart-count").textContent = carrito.reduce((acc, p) => acc + p.qty, 0); renderCarrito(); };
window.restarCantidad = (index) => { if (carrito[index].qty > 1) carrito[index].qty -= 1; else carrito.splice(index, 1); $("cart-count").textContent = carrito.reduce((acc, p) => acc + p.qty, 0); renderCarrito(); };
window.eliminarDelCarrito = (index) => { carrito.splice(index, 1); $("cart-count").textContent = carrito.reduce((acc, p) => acc + p.qty, 0); renderCarrito(); };
window.vaciarCarrito = () => { carrito = []; $("cart-count").textContent = "0"; renderCarrito(); };

// --- PASARELA DE PAGO ---
window.irAlPago = () => {
  if (carrito.length === 0) return alert("Agrega productos primero.");
  $("cart-step-1").style.display = "none";
  $("cart-step-2").style.display = "block";
  $("pay-total").textContent = totalAPagar.toFixed(2);
};

window.volverAlCarrito = () => {
  $("cart-step-2").style.display = "none";
  $("cart-step-1").style.display = "block";
};

if ($("pay-method")) {
  $("pay-method").addEventListener("change", (e) => {
    if (e.target.value === "Tarjeta") {
      $("card-details").style.display = "block";
      $("pay-card").required = true;
    } else {
      $("card-details").style.display = "none";
      $("pay-card").required = false;
    }
  });
}

if ($("payment-form")) {
  $("payment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = $("pay-name").value;
    const correo = $("pay-email").value;
    const metodo = $("pay-method").value;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = "Procesando...";
    btn.disabled = true;

    setTimeout(() => {
      alert(`¡Pago Exitoso!\n\nGracias por tu compra, ${nombre}.\nSe ha enviado el comprobante a: ${correo}\nMétodo: ${metodo}\nTotal pagado: S/ ${totalAPagar.toFixed(2)}`);
      
      carrito = [];
      $("cart-count").textContent = "0";
      $("cart-modal").style.display = "none";
      $("payment-form").reset();
      $("card-details").style.display = "block";
      btn.textContent = "Pagar S/ 0.00"; 
      btn.disabled = false;
    }, 1500);
  });
}

// --- BUSCADOR FUNCIONAL ---
if ($("search-input")) {
  $("search-input").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filterAndRender = (containerId, products) => {
      const filtered = products.filter(p => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term));
      renderizarCategoria(containerId, filtered);
    };
    filterAndRender("items-hombres", productosHombres);
    filterAndRender("items-mujeres", productosMujeres);
    filterAndRender("items-ninos", productosNinos);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarCategoria("items-hombres", productosHombres);
  renderizarCategoria("items-mujeres", productosMujeres);
  renderizarCategoria("items-ninos", productosNinos);
});
