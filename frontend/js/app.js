const $ = id => document.getElementById(id);
let carrito = [];
let productoSeleccionado = null;
let totalAPagar = 0;

// 1. CONEXIÓN CON EL BACKEND (RENDER)
const API_URL = window.APP_CONFIG.API_BASE_URL; 

// 2. VARIABLES PARA LOS PRODUCTOS REALES
let productosHombres = [];
let productosMujeres = [];
let productosNinos = [];

// 3. FUNCIÓN PARA CARGAR PRODUCTOS DESDE EL BACKEND
async function cargarProductos() {
  try {
    const response = await fetch(`${API_URL}/api/garments`);
    if (!response.ok) throw new Error("Error al cargar productos");
    
    const productos = await response.json();
    
    // Exponemos los productos globalmente para que admin.html los use
    window.productosGlobales = productos; 

    // Separamos los productos por categoría
    productosHombres = productos.slice(0, 5);
    productosMujeres = productos.slice(5, 9);
    productosNinos = productos.slice(9, 13);

    if (productos.length === 0) {
      cargarProductosDemo();
    } else {
      renderizarCategoria("items-hombres", productosHombres);
      renderizarCategoria("items-mujeres", productosMujeres);
      renderizarCategoria("items-ninos", productosNinos);
    }
  } catch (error) {
    console.error("Error de conexión, usando datos locales:", error);
    cargarProductosDemo(); 
  }
}

// 4. FUNCIÓN PARA CARGAR PRODUCTOS DE PRUEBA (PARA QUE SE VEA LLENO)
function cargarProductosDemo() {
  // Hombres
  productosHombres = [
    { id: "h1", name: "Polo Oversize Blanco", type: "Camisa", brand: "Nike", size: "L", color: "Blanco", price: 89.90, oldPrice: 149.90, stock: 20, description: "Polo de algodón peinado.", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80" },
    { id: "h2", name: "Zapatillas Running Pro", type: "Calzado", brand: "Nike", size: "42", color: "Rojo", price: 299.90, oldPrice: 399.90, stock: 15, description: "Máxima amortiguación.", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80" },
    { id: "h3", name: "Short Deportivo", type: "Camisa", brand: "Adidas", size: "M", color: "Negro", price: 59.90, oldPrice: 89.90, stock: 30, description: "Tela transpirable.", img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80" },
    { id: "h4", name: "Casaca Cortavientos", type: "Camisa", brand: "Puma", size: "L", color: "Azul", price: 129.90, oldPrice: 199.90, stock: 10, description: "Ideal para días fríos.", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80" }
  ];

  // Mujeres
  productosMujeres = [
    { id: "m1", name: "Top Deportivo Flex", type: "Camisa", brand: "Puma", size: "S", color: "Rosa", price: 69.90, oldPrice: 99.90, stock: 25, description: "Top con soporte medio.", img: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80" },
    { id: "m2", name: "Leggings Térmicos", type: "Camisa", brand: "Nike", size: "M", color: "Negro", price: 109.90, oldPrice: 159.90, stock: 18, description: "Máxima elasticidad.", img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80" },
    { id: "m3", name: "Zapatillas Training", type: "Calzado", brand: "Adidas", size: "38", color: "Blanco", price: 219.90, oldPrice: 289.90, stock: 12, description: "Suela antideslizante.", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80" }
  ];

  // Niños
  productosNinos = [
    { id: "n1", name: "Zapatillas Colegiales", type: "Calzado", brand: "Bata", size: "32", color: "Negro", price: 89.90, oldPrice: 129.90, stock: 50, description: "Resistentes y cómodas.", img: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&q=80" },
    { id: "n2", name: "Conjunto Deportivo", type: "Camisa", brand: "Adidas", size: "8 años", color: "Azul", price: 79.90, oldPrice: 119.90, stock: 20, description: "Conjunto de short y polo.", img: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80" },
    { id: "n3", name: "Pelota de Fútbol", type: "Pelota", brand: "Nike", size: "Única", color: "Blanco", price: 49.90, oldPrice: 79.90, stock: 40, description: "Balón oficial tamaño 4.", img: "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=600&q=80" }
  ];
  
  window.productosGlobales = [...productosHombres, ...productosMujeres, ...productosNinos];

  renderizarCategoria("items-hombres", productosHombres);
  renderizarCategoria("items-mujeres", productosMujeres);
  renderizarCategoria("items-ninos", productosNinos);
}

// 5. RENDERIZAR TARJETAS (DISEÑO ADIDAS)
function renderizarCategoria(containerId, productos) {
  const root = $(containerId);
  if(!root) return;
  root.replaceChildren();
  
  for (const item of productos) {
    const card = document.createElement("article"); card.className = "item";
    const descuento = item.oldPrice ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100) : 0;
    
    const imagen = item.img || "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80";

    card.innerHTML = `
      <img src="${imagen}" alt="${item.name}" onclick="abrirDetalleProducto('${item.id}')">
      <div class="price-container">
        <span class="price">S/ ${Number(item.price).toFixed(2)}</span>
        ${item.oldPrice ? `<span class="old-price">S/ ${Number(item.oldPrice).toFixed(0)}</span>` : ''}
        ${item.oldPrice ? `<span class="badge">-${descuento}%</span>` : ''}
      </div>
      <h3 onclick="abrirDetalleProducto('${item.id}')">${item.name}</h3>
      <p class="originals-link">${item.brand || "SportMax"}</p>
      <p class="colors-link">3 colores</p>
      <div class="item-actions">
        <button onclick="abrirDetalleProducto('${item.id}')">VER DETALLE</button>
        <button onclick="agregarAlCarrito('${item.id}')">AGREGAR</button>
      </div>
    `;
    root.append(card);
  }
}

// 7. LÓGICA DEL CARRITO Y DETALLE
window.abrirDetalleProducto = (id) => {
  const todos = [...productosHombres, ...productosMujeres, ...productosNinos];
  const item = todos.find(p => p.id === id);
  if (!item) return;

  productoSeleccionado = item;
  $("modal-img").src = item.img || "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80";
  $("modal-title").textContent = item.name;
  $("modal-brand").textContent = item.brand || "SportMax";
  $("modal-detail").textContent = `Talla: ${item.size || "-"} | Color: ${item.color || "-"}`;
  $("modal-price").textContent = `S/ ${Number(item.price).toFixed(2)}`;
  $("modal-stock").textContent = `Stock: ${item.stock || 0} unidades`;
  $("modal-desc").textContent = item.description || "Sin descripción.";
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

$("cart-btn").onclick = () => { 
  renderCarrito(); 
  $("cart-step-1").style.display = "block";
  $("cart-step-2").style.display = "none";
  $("cart-modal").style.display = "block"; 
};

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
  container.innerHTML = ""; totalAPagar = 0;
  if (carrito.length === 0) { container.innerHTML = "<p style='color:#64748b; text-align:center; padding: 20px;'>Tu bolsa está vacía.</p>"; $("cart-total").textContent = "S/ 0.00"; return; }
  carrito.forEach((item, index) => {
    totalAPagar += item.price * item.qty;
    const div = document.createElement("div");
    div.style.cssText = "display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding: 15px 0;";
    div.innerHTML = `<div style="display: flex; gap: 15px; align-items: center;"><img src="${item.img}" style="width: 60px; height: 60px; object-fit: contain; background: #f8fafc; border-radius: 4px;"><div><strong style="display: block; font-size: 0.9rem;">${item.name}</strong><small style="color: #64748b;">S/ ${item.price}</small></div></div><div style="display: flex; align-items: center; gap: 10px;"><button onclick="restarCantidad(${index})" style="border: 1px solid #cbd5e1; background: white; width: 25px; height: 25px; cursor: pointer;">-</button><span>${item.qty}</span><button onclick="sumarCantidad(${index})" style="border: 1px solid #cbd5e1; background: white; width: 25px; height: 25px; cursor: pointer;">+</button><button onclick="eliminarDelCarrito(${index})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-weight:bold; margin-left: 10px;">&times;</button></div>`;
    container.append(div);
  });
  $("cart-total").textContent = `S/ ${totalAPagar.toFixed(2)}`;
}

window.sumarCantidad = (index) => { carrito[index].qty += 1; $("cart-count").textContent = carrito.reduce((acc, p) => acc + p.qty, 0); renderCarrito(); };
window.restarCantidad = (index) => { if (carrito[index].qty > 1) carrito[index].qty -= 1; else carrito.splice(index, 1); $("cart-count").textContent = carrito.reduce((acc, p) => acc + p.qty, 0); renderCarrito(); };
window.eliminarDelCarrito = (index) => { carrito.splice(index, 1); $("cart-count").textContent = carrito.reduce((acc, p) => acc + p.qty, 0); renderCarrito(); };
window.vaciarCarrito = () => { carrito = []; $("cart-count").textContent = "0"; renderCarrito(); };

window.irAlPago = () => { if (carrito.length === 0) return alert("Agrega productos primero."); $("cart-step-1").style.display = "none"; $("cart-step-2").style.display = "block"; $("pay-total").textContent = totalAPagar.toFixed(2); };
window.volverAlCarrito = () => { $("cart-step-2").style.display = "none"; $("cart-step-1").style.display = "block"; };
$("payment-form").addEventListener("submit", (e) => { e.preventDefault(); alert("¡Pago Exitoso!"); carrito = []; $("cart-count").textContent = "0"; $("cart-modal").style.display = "none"; $("payment-form").reset(); });

// 8. INICIALIZAR TODO
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos(); 
});
