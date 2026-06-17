/* ════════════════════════════════════════════════════════════
   App — navegación, glue e init. Se carga ÚLTIMO.
   Conecta los módulos (productos, ventas), arranca la sync en
   tiempo real con Firestore y hace el primer render.
   Como todos los scripts usan defer, al ejecutarse este archivo
   el DOM ya está armado y el resto de los módulos cargados.
   ════════════════════════════════════════════════════════════ */

/* ── Navegación entre vistas ── */
function go(view){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  $("#view-"+view).classList.add("active");
  document.querySelectorAll(".nav-link").forEach(a=> a.classList.toggle("on", a.dataset.go===view));
  $("#fabAdd").style.display = view==="stock" ? "flex" : "none";
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ── Sync en tiempo real con Firestore ── */
function startSync(){
  colRef.onSnapshot({ includeMetadataChanges:true }, snap=>{
    productos = snap.docs.map(d=>({ id:d.id, ...d.data() }));
    setConn(snap.metadata.fromCache && !navigator.onLine ? "offline" : "online");
    renderInicio(); renderFiltros(); renderLista();
  }, err=>{
    console.error("Firestore ["+COL+"]:", err.code, err.message);
    setConn("offline");
    if(err.code==="permission-denied") toast("Sin permisos en Firestore — revisá las reglas.", "err");
  });
  window.addEventListener("online",  ()=> setConn("online"));
  window.addEventListener("offline", ()=> setConn("offline"));
}

/* ── Init / glue ── */
function initApp(){
  // navegación por data-go (topbar, sidebar, bottom nav, atajos)
  document.addEventListener("click", e=>{
    const link = e.target.closest("[data-go]");
    if(link){ e.preventDefault(); go(link.dataset.go); }
  });

  // wiring de cada módulo
  initProductos();
  initVentas();

  // primer render (antes de que lleguen los datos) + config + sync
  renderInicio(); renderFiltros(); renderLista();
  loadRecargo();
  startSync();
}

initApp();
