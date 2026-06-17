/* ════════════════════════════════════════════════════════════
   ETAPA 1 · Inventario (Stock)
   Catálogo, estado de los productos, render de inicio/lista y la
   hoja (sheet) para agregar/editar uniformes. Las funciones quedan
   globales; initProductos() (lo llama app.js) conecta los eventos.
   ════════════════════════════════════════════════════════════ */

/* ── Datos reales de la ficha ── */
const COLEGIOS_BASE = ["Instituto Sarmiento", "Instituto Minerva"];
const PRENDAS_POR_COLEGIO = {
  "Instituto Sarmiento": ["Chomba","Sweater","Buzo polar","Pollera","Bermuda","Campera gimnasia","Pantalón gimnasia","Conjunto gimnasia"],
  "Instituto Minerva":   ["Remera","Sweater liso","Campera gimnasia","Pantalón gimnasia","Conjunto gimnasia"]
};
const TALLES_SUGER = ["2","4","6","8","10","12","14","16","XS","S","M","L","XL","XXL","Único"];
const STOCK_BAJO = 3;

/* ── Estado ── */
let productos = [];
let filtroColegio = "todos";
let editId = null;
const form = { colegio:null, prenda:null, talle:null, precio:0, stock:0, activo:true };

/* ── Helpers de catálogo ── */
function colegiosActivos(){
  const set = new Set(COLEGIOS_BASE);
  productos.forEach(p => p.colegio && set.add(p.colegio));
  return [...set];
}
function prendasDe(colegio){
  const base = PRENDAS_POR_COLEGIO[colegio] ? [...PRENDAS_POR_COLEGIO[colegio]] : [];
  productos.forEach(p => { if(p.colegio===colegio && p.prenda && !base.includes(p.prenda)) base.push(p.prenda); });
  if(form.prenda && form.colegio===colegio && !base.includes(form.prenda)) base.push(form.prenda);
  return base;
}

/* ── Render: inicio ── */
function renderInicio(){
  $("#statTotal").textContent = productos.filter(p=>p.activo!==false).length;
  $("#statBajo").textContent  = productos.filter(p=>p.activo!==false && (p.stock||0) <= STOCK_BAJO).length;
  const valor = productos.reduce((a,p)=> a + (Number(p.precio)||0)*(Number(p.stock)||0), 0);
  $("#statValor").textContent = money(valor);
}

/* ── Render: filtros ── */
function renderFiltros(){
  const cont = $("#filtros"); cont.innerHTML = "";
  const mk = (val,label)=>{
    const b = document.createElement("button");
    b.className = "chip-f" + (filtroColegio===val?" on":"");
    b.textContent = label;
    b.onclick = ()=>{ filtroColegio = val; renderFiltros(); renderLista(); };
    return b;
  };
  cont.appendChild(mk("todos","Todos"));
  colegiosActivos().forEach(c=> cont.appendChild(mk(c, corto(c))));
}

/* ── Render: lista ── */
function renderLista(){
  const cont = $("#listaStock"); cont.innerHTML = "";
  let lista = productos.slice();
  if(filtroColegio!=="todos") lista = lista.filter(p=>p.colegio===filtroColegio);

  if(productos.length===0){
    cont.innerHTML = `<div class="empty"><div class="ico">📦</div>
      <h3>Todavía no hay uniformes</h3>
      <p>Cargá tu primer uniforme y empezá a tener el stock ordenado.</p>
      <button class="btn btn-primary" style="max-width:260px;margin:0 auto" id="emptyAdd">+ Agregar uniforme</button></div>`;
    $("#emptyAdd").onclick = ()=>openSheet();
    return;
  }
  if(lista.length===0){
    cont.innerHTML = `<div class="empty"><div class="ico">🔍</div>
      <h3>Nada en este colegio</h3>
      <p>Probá con otro colegio o agregá un uniforme nuevo.</p></div>`;
    return;
  }

  const grupos = {};
  lista.forEach(p=>{ (grupos[p.colegio] ||= []).push(p); });
  Object.keys(grupos).sort().forEach(col=>{
    const items = grupos[col].sort((a,b)=>
      (a.prenda||"").localeCompare(b.prenda||"") || (""+a.talle).localeCompare(""+b.talle,undefined,{numeric:true}));
    const g = document.createElement("div"); g.className = "col-group";
    g.innerHTML = `<div class="col-head"><span class="cn">${corto(col)}</span>
      <span class="cc">${items.length} uniforme${items.length>1?"s":""}</span></div>`;
    items.forEach(p=> g.appendChild(prodCard(p)));
    cont.appendChild(g);
  });
}
function prodCard(p){
  const el = document.createElement("div");
  const stock = Number(p.stock)||0;
  el.className = "prod" + (p.activo===false ? " pausado":"");
  let stockTag = "";
  if(stock===0) stockTag = `<span class="tag cero">Sin stock</span>`;
  else if(stock<=STOCK_BAJO) stockTag = `<span class="tag bajo">Queda poco</span>`;
  el.innerHTML = `
    <div class="pmain">
      <div class="pname">${p.prenda||"—"}</div>
      <div class="pmeta">
        <span class="tag talle">Talle ${p.talle||"—"}</span>
        <span class="tag precio">${money(p.precio)}</span>
        ${stockTag}
        ${p.activo===false?'<span class="tag" style="background:var(--gris-100);color:var(--gris-500)">En pausa</span>':''}
      </div>
    </div>
    <div class="pstock"><div class="sn">${stock}</div><div class="sl">en casa</div></div>
    <button class="pedit">✏️</button>`;
  el.querySelector(".pedit").onclick = ()=> openSheet(p);
  return el;
}

/* ── Input "otro" propio de la app (sin prompt del sistema) ── */
function otroInline(container, placeholder, onAdd){
  if(container.querySelector(".otro-row")) return;
  const row = document.createElement("div");
  row.className = "otro-row";
  row.innerHTML = `<input class="otro-in" placeholder="${placeholder}" autocomplete="off"/>
    <button class="otro-btn otro-ok">✓</button>
    <button class="otro-btn otro-no">✕</button>`;
  container.appendChild(row);
  const inp = row.querySelector(".otro-in");
  setTimeout(()=>inp.focus(), 50);
  const ok = ()=>{ const v = inp.value.trim(); if(v) onAdd(v); else inp.focus(); };
  row.querySelector(".otro-ok").onclick = ok;
  row.querySelector(".otro-no").onclick = ()=> row.remove();
  inp.addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); ok(); } });
}

/* ── Sheet ── */
function openSheet(prod=null){
  editId = prod ? prod.id : null;
  $("#sheetTitle").textContent = prod ? "Editar uniforme" : "Agregar uniforme";
  $("#btnDelete").style.display = prod ? "flex" : "none";
  $("#btnSave").textContent = prod ? "Guardar cambios" : "Guardar";

  form.colegio = prod?.colegio || null;
  form.prenda  = prod?.prenda  || null;
  form.talle   = prod ? String(prod.talle) : null;
  form.precio  = prod ? Number(prod.precio)||0 : 0;
  form.stock   = prod ? Number(prod.stock)||0 : 0;
  form.activo  = prod ? prod.activo!==false : true;

  renderColegio();
  renderPrenda();
  renderTalle(false);
  $("#inPrecio").value = form.precio ? Number(form.precio).toLocaleString("es-AR") : "";
  $("#stockVal").textContent = form.stock;
  $("#switchActivo").classList.toggle("on", form.activo);
  validate();

  $("#scrim").classList.add("show");
  $("#sheet").classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeSheet(){
  $("#scrim").classList.remove("show");
  $("#sheet").classList.remove("show");
  document.body.style.overflow = "";
}

/* ── Colegio (chips + otro propio) ── */
function renderColegio(){
  const cont = $("#chipsColegio"); cont.innerHTML = "";
  colegiosActivos().forEach(op=>{
    const b = document.createElement("button");
    b.className = "chip" + (op===form.colegio?" on":"");
    b.textContent = corto(op);
    b.onclick = ()=>{
      if(form.colegio!==op){ form.colegio = op; if(!prendasDe(op).includes(form.prenda)) form.prenda = null; }
      renderColegio(); renderPrenda(); validate();
    };
    cont.appendChild(b);
  });
  const add = document.createElement("button");
  add.className = "chip add"; add.textContent = "+ Otro colegio";
  add.onclick = ()=> otroInline(cont, "Nombre del colegio", v=>{
    form.colegio = v; form.prenda = null;
    renderColegio(); renderPrenda(); validate();
  });
  cont.appendChild(add);
}

/* ── Prenda (depende del colegio) ── */
function renderPrenda(){
  const cont = $("#chipsPrenda"); const hint = $("#prendaHint");
  cont.innerHTML = "";
  if(!form.colegio){ cont.style.display="none"; hint.style.display="block"; return; }
  cont.style.display="flex"; hint.style.display="none";
  prendasDe(form.colegio).forEach(op=>{
    const b = document.createElement("button");
    b.className = "chip" + (op===form.prenda?" on":"");
    b.textContent = op;
    b.onclick = ()=>{ form.prenda = op; renderPrenda(); validate(); };
    cont.appendChild(b);
  });
  const add = document.createElement("button");
  add.className = "chip add"; add.textContent = "+ Otra prenda";
  add.onclick = ()=> otroInline(cont, "Nombre de la prenda", v=>{
    form.prenda = v; renderPrenda(); validate();
  });
  cont.appendChild(add);
}

/* ── Talle (menú desplegable propio de la app) ── */
function renderTalle(open){
  const val = $("#ddVal");
  if(form.talle){ val.textContent = form.talle; val.classList.remove("ph"); }
  else { val.textContent = "Elegí el talle"; val.classList.add("ph"); }

  const panel = $("#ddPanel"); panel.innerHTML = "";
  const grid = document.createElement("div"); grid.className = "dd-grid";
  const opts = [...TALLES_SUGER];
  if(form.talle && !opts.includes(form.talle)) opts.push(form.talle);
  opts.forEach(op=>{
    const b = document.createElement("button");
    b.className = "dd-opt" + (op===form.talle?" on":"");
    b.textContent = op;
    b.onclick = ()=>{ form.talle = op; setDD(false); renderTalle(false); validate(); };
    grid.appendChild(b);
  });
  const add = document.createElement("button");
  add.className = "dd-opt add"; add.textContent = "+ Otro talle";
  add.onclick = ()=> otroInline(panel, "Talle", v=>{
    form.talle = v; setDD(false); renderTalle(false); validate();
  });
  grid.appendChild(add);
  panel.appendChild(grid);

  if(open) setDD(true);
}
function setDD(open){
  $("#ddHead").classList.toggle("open", open);
  $("#ddPanel").classList.toggle("open", open);
}

/* ── Validación ── */
function validate(){
  const ok = form.colegio && form.prenda && form.talle && form.precio>0;
  $("#btnSave").disabled = !ok;
}

/* ── Guardar ── */
async function guardarProducto(){
  if($("#btnSave").disabled) return;
  const data = {
    colegio: form.colegio, prenda: form.prenda, talle: String(form.talle),
    precio: Number(form.precio)||0, stock: Number(form.stock)||0, activo: !!form.activo
  };
  $("#btnSave").disabled = true;
  try{
    if(editId){ await colRef.doc(editId).set(data); toast("Cambios guardados ✓", "ok"); }
    else { await colRef.add(data); toast("Uniforme agregado ✓", "ok"); }
    closeSheet();
  }catch(err){
    console.error("Guardar uniforme:", err.code, err.message);
    toast("No se pudo guardar. Probá de nuevo.", "err");
    $("#btnSave").disabled = false;
  }
}

/* ── Borrar (con confirmación) ── */
function pedirBorrar(){
  if(!editId) return;
  const p = productos.find(x=>x.id===editId);
  $("#cfText").textContent = `Vas a borrar "${p?.prenda||""} talle ${p?.talle||""}". No se puede deshacer. Si solo querés pausarlo, usá "En venta".`;
  $("#confirm").classList.add("show");
}
async function borrarProducto(){
  $("#confirm").classList.remove("show");
  try{ await colRef.doc(editId).delete(); toast("Uniforme borrado"); closeSheet(); }
  catch(err){ console.error("Borrar:", err.code, err.message); toast("No se pudo borrar. Probá de nuevo.", "err"); }
}

/* ── Wiring de eventos (lo llama app.js) ── */
function initProductos(){
  $("#sheetClose").onclick = closeSheet;
  $("#scrim").onclick = closeSheet;
  $("#fabAdd").onclick = ()=> openSheet();

  $("#ddHead").onclick = ()=>{
    const isOpen = $("#ddPanel").classList.contains("open");
    setDD(!isOpen);
  };

  $("#inPrecio").addEventListener("input", e=>{
    const raw = e.target.value.replace(/\D/g,"");
    form.precio = raw ? parseInt(raw,10) : 0;
    e.target.value = raw ? form.precio.toLocaleString("es-AR") : "";
    validate();
  });

  $("#stockMinus").onclick = ()=>{ form.stock = Math.max(0, form.stock-1); $("#stockVal").textContent = form.stock; };
  $("#stockPlus").onclick  = ()=>{ form.stock += 1; $("#stockVal").textContent = form.stock; };

  $("#switchActivo").onclick = ()=>{
    form.activo = !form.activo;
    $("#switchActivo").classList.toggle("on", form.activo);
  };

  $("#btnSave").onclick   = guardarProducto;
  $("#btnDelete").onclick = pedirBorrar;
  $("#cfNo").onclick  = ()=> $("#confirm").classList.remove("show");
  $("#cfYes").onclick = borrarProducto;
}
