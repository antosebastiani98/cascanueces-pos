/* ════════════════════════════════════════════════════════════
   ETAPA 2 · Vender (POS) — a prueba de mamá
   Flujo de venta en 3 pasos (armar → cobrar → listo), carrito,
   descuento de stock y registro de la venta. Incluye los ajustes
   de cobro (recargo por transferencia) que configura Antonella.
   initVentas() (lo llama app.js) conecta los eventos.
   ════════════════════════════════════════════════════════════ */

let venderCart = [];
let vSel = { colegio:null, prenda:null };
let recargoPct = 0;
let pagoSel = null;
let vStepNow = "armar";

const tOrder = t => { const i = TALLES_SUGER.indexOf(String(t)); return i<0 ? 999 : i; };
const vendibles = () => productos.filter(p => p.activo!==false && (Number(p.stock)||0) > 0);

function openVender(){
  venderCart = []; vSel = { colegio:null, prenda:null }; pagoSel = null;
  vStep("armar");
  buildVColegios(); buildVPrendas(); buildVTalles(); renderCart(); renderPago();
  const v = $("#vender"); v.classList.add("show"); v.setAttribute("aria-hidden","false");
}
function closeVender(){
  const v = $("#vender"); v.classList.remove("show"); v.setAttribute("aria-hidden","true");
}
function vStep(name){
  vStepNow = name;
  $("#vArmar").classList.toggle("on", name==="armar");
  $("#vCobrar").classList.toggle("on", name==="cobrar");
  $("#vOk").classList.toggle("on", name==="ok");
  $("#vBar").style.display = name==="armar" ? "flex" : "none";
  $("#vTitle").textContent = name==="cobrar" ? "Cobrar" : name==="ok" ? "Listo" : "Nueva venta";
  document.querySelector(".v-body").scrollTop = 0;
}

/* back inteligente */
let exitArmed = false, exitTimer = null;
function vBack(){
  if(vStepNow==="ok"){ closeVender(); return; }
  if(vStepNow==="cobrar"){ vStep("armar"); return; }
  if(venderCart.length===0){ closeVender(); return; }
  if(exitArmed){ clearTimeout(exitTimer); exitArmed=false; closeVender(); return; }
  exitArmed = true; toast("Tocá de nuevo para salir sin cobrar");
  exitTimer = setTimeout(()=> exitArmed=false, 3000);
}

/* ── PASO 1: armar ── */
function buildVColegios(){
  const cont = $("#vColegios"); cont.innerHTML = "";
  const cols = [...new Set(vendibles().map(p=>p.colegio))].sort();
  if(cols.length===0){ cont.innerHTML = `<p class="v-hint">No hay stock cargado todavía. Agregá uniformes desde Stock.</p>`; return; }
  cols.forEach(col=>{
    const b = document.createElement("button");
    b.className = "v-chip" + (vSel.colegio===col?" on":"");
    b.textContent = col;
    b.onclick = ()=>{ vSel.colegio = col; vSel.prenda = null; buildVColegios(); buildVPrendas(); buildVTalles(); };
    cont.appendChild(b);
  });
}
function buildVPrendas(){
  const cont = $("#vPrendas"), hint = $("#vPrendaHint");
  cont.innerHTML = "";
  if(!vSel.colegio){ cont.style.display="none"; hint.style.display="block"; return; }
  cont.style.display="flex"; hint.style.display="none";
  const prendas = [...new Set(vendibles().filter(p=>p.colegio===vSel.colegio).map(p=>p.prenda))];
  prendas.forEach(pr=>{
    const b = document.createElement("button");
    b.className = "v-chip" + (vSel.prenda===pr?" on":"");
    b.textContent = pr;
    b.onclick = ()=>{ vSel.prenda = pr; buildVPrendas(); buildVTalles(); };
    cont.appendChild(b);
  });
}
function buildVTalles(){
  const cont = $("#vTalles"), hint = $("#vTalleHint");
  cont.innerHTML = "";
  if(!vSel.colegio || !vSel.prenda){ cont.style.display="none"; hint.style.display="block"; return; }
  cont.style.display="flex"; hint.style.display="none";
  const prods = productos
    .filter(p=>p.activo!==false && p.colegio===vSel.colegio && p.prenda===vSel.prenda)
    .sort((a,b)=> tOrder(a.talle)-tOrder(b.talle));
  if(prods.length===0){ cont.innerHTML = `<p class="v-hint">No hay talles cargados para esta prenda.</p>`; return; }
  prods.forEach(p=>{
    const stock = Number(p.stock)||0;
    const enCart = (venderCart.find(x=>x.id===p.id)?.cant)||0;
    const card = document.createElement("button");
    card.className = "t-card" + (stock<=0?" cero":"");
    card.innerHTML = `
      <span class="tt">${p.talle}</span>
      <span class="ti"><b>$ ${(Number(p.precio)||0).toLocaleString("es-AR")}</b>
        <span>${stock<=0 ? "Sin stock" : "Quedan "+stock+(enCart?` · ${enCart} en el carrito`:"")}</span></span>
      <span class="tadd">＋</span>`;
    if(stock>0) card.onclick = ()=> addToCart(p);
    cont.appendChild(card);
  });
}
function addToCart(p){
  const stock = Number(p.stock)||0;
  if(stock<=0) return;
  const line = venderCart.find(x=>x.id===p.id);
  if(line){
    if(line.cant >= stock){ toast("Ya cargaste todo el stock de ese talle"); return; }
    line.cant++;
  } else {
    venderCart.push({ id:p.id, colegio:p.colegio, prenda:p.prenda, talle:String(p.talle),
                      precio:Number(p.precio)||0, cant:1, stock });
  }
  renderCart(); buildVTalles();
}
function cartSubtotal(){ return venderCart.reduce((a,l)=> a + l.precio*l.cant, 0); }
function cartCount(){ return venderCart.reduce((a,l)=> a + l.cant, 0); }

function renderCart(){
  const wrap = $("#vCartWrap"), cont = $("#vCart");
  cont.innerHTML = "";
  wrap.style.display = venderCart.length ? "block" : "none";
  venderCart.forEach(l=>{
    const row = document.createElement("div");
    row.className = "ci";
    row.innerHTML = `
      <div class="cn"><b>${l.prenda} · talle ${l.talle}</b>
        <span>${l.colegio} · $ ${(l.precio).toLocaleString("es-AR")} c/u</span></div>
      <div class="ci-step">
        <button data-d="-1">−</button><span class="q">${l.cant}</span><button data-d="1">＋</button>
      </div>`;
    row.querySelectorAll("button").forEach(b=>{
      b.onclick = ()=>{
        const d = Number(b.dataset.d);
        if(d>0){ if(l.cant >= l.stock){ toast("No hay más stock de ese talle"); return; } l.cant++; }
        else { l.cant--; if(l.cant<=0) venderCart = venderCart.filter(x=>x.id!==l.id); }
        renderCart(); buildVTalles();
      };
    });
    cont.appendChild(row);
  });
  // barra inferior
  const sub = cartSubtotal(), cnt = cartCount();
  $("#vBarTotal").textContent = money(sub);
  $("#vBarCount").textContent = cnt ? `${cnt} prenda${cnt>1?"s":""}` : "Sin nada todavía";
  $("#vCobrarBtn").disabled = cnt===0;
}

/* ── PASO 2: cobrar ── */
function renderPago(){
  const sub = cartSubtotal();
  const transSub = recargoPct>0 ? `Recargo ${recargoPct}%` : "Sin recargo configurado";
  $("#pagoTransSub").textContent = transSub;
  let recargo = 0, total = sub, det = `${cartCount()} prenda${cartCount()>1?"s":""}`;
  if(pagoSel==="transferencia"){
    recargo = Math.round(sub * recargoPct / 100);
    total = sub + recargo;
    det = recargo>0 ? `Subtotal ${money(sub)} + recargo ${recargoPct}% (${money(recargo)})` : `${money(sub)} · sin recargo`;
  }
  $("#vPagoTotal").textContent = money(total);
  $("#vPagoDet").textContent = det;
  document.querySelectorAll(".pago").forEach(b=> b.classList.toggle("on", b.dataset.pago===pagoSel));
  $("#vConfirmar").disabled = !pagoSel;
}

/* ── Confirmar venta: descuenta stock + guarda venta ── */
async function confirmarVenta(){
  if(!pagoSel || venderCart.length===0) return;
  $("#vConfirmar").disabled = true;
  const sub = cartSubtotal();
  const recargo = pagoSel==="transferencia" ? Math.round(sub*recargoPct/100) : 0;
  const total = sub + recargo;
  try{
    const batch = db.batch();
    venderCart.forEach(l=>{
      const actual = Number(productos.find(p=>p.id===l.id)?.stock)||0;
      const nuevo = Math.max(0, actual - l.cant);
      batch.set(colRef.doc(l.id), { stock: nuevo }, { merge:true });
    });
    const ventaRef = ventasRef.doc();
    batch.set(ventaRef, {
      items: venderCart.map(l=>({ productoId:l.id, colegio:l.colegio, prenda:l.prenda,
        talle:l.talle, precio:l.precio, cant:l.cant, subtotal:l.precio*l.cant })),
      subtotal: sub,
      recargoPct: pagoSel==="transferencia" ? recargoPct : 0,
      recargo, total,
      metodoPago: pagoSel,
      estado: "completada",
      fecha: firebase.firestore.FieldValue.serverTimestamp(),
      ts: Date.now()
    });
    await batch.commit();
    $("#vOkAmt").textContent = money(total);
    $("#vOkWay").textContent = pagoSel==="efectivo"
      ? "Cobrado en efectivo 💵"
      : "Cobrado por transferencia / MP 📲" + (recargo>0 ? " (recargo incluido)" : "");
    venderCart = []; pagoSel = null;
    vStep("ok");
  }catch(err){
    console.error("Confirmar venta:", err.code, err.message);
    toast("No se pudo cobrar. Probá de nuevo.", "err");
    $("#vConfirmar").disabled = false;
  }
}
function nuevaVenta(){
  vSel = { colegio:null, prenda:null }; pagoSel = null;
  vStep("armar"); buildVColegios(); buildVPrendas(); buildVTalles(); renderCart(); renderPago();
}

/* ── Ajustes de cobro (Antonella) ── */
function openAjustes(){
  $("#ajRecargo").value = recargoPct || "";
  $("#ajScrim").classList.add("show"); $("#ajSheet").classList.add("show");
}
function closeAjustes(){ $("#ajScrim").classList.remove("show"); $("#ajSheet").classList.remove("show"); }
async function guardarAjustes(){
  const v = Math.max(0, parseFloat($("#ajRecargo").value)||0);
  recargoPct = v;
  try{ await cfgRef.set({ recargoTransferencia:v }, { merge:true }); toast("Recargo guardado ✓","ok"); closeAjustes(); }
  catch(err){ console.error("Ajustes:", err.code, err.message); toast("No se pudo guardar.","err"); }
}
async function loadRecargo(){
  try{ const s = await cfgRef.get(); if(s.exists) recargoPct = Number(s.data().recargoTransferencia)||0; }
  catch(err){ console.warn("config:", err.code); }
}

/* ── Wiring de eventos (lo llama app.js) ── */
function initVentas(){
  $("#venderBtn").addEventListener("click", openVender);
  $("#vBack").onclick = vBack;
  $("#vCobrarBtn").onclick = ()=>{ if(venderCart.length===0) return; pagoSel=null; vStep("cobrar"); renderPago(); };
  document.querySelectorAll(".pago").forEach(b=>{
    b.onclick = ()=>{ pagoSel = b.dataset.pago; renderPago(); };
  });
  $("#vConfirmar").onclick = confirmarVenta;
  $("#vNueva").onclick = nuevaVenta;
  $("#vListo").onclick = closeVender;

  $("#ajustesLink").onclick = openAjustes;
  $("#ajClose").onclick = closeAjustes;
  $("#ajScrim").onclick = closeAjustes;
  $("#ajGuardar").onclick = guardarAjustes;
}
