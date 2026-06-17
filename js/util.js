/* ════════════════════════════════════════════════════════════
   Utilidades compartidas por todos los módulos.
   - $       selector corto
   - money   formato $ rioplatense
   - corto   nombre corto del colegio
   - toast   avisos breves a la mamá
   - setConn estado de conexión (online / sin conexión)
   Quedan como globales (window.*) para usarse desde cualquier módulo.
   ════════════════════════════════════════════════════════════ */

const $ = s => document.querySelector(s);
const money = n => "$ " + (Number(n)||0).toLocaleString("es-AR");
const corto = c => (c||"").replace("Instituto ","");

function toast(msg, kind=""){
  const t = $("#toast"); t.textContent = msg; t.className = "toast show " + kind;
  clearTimeout(toast._t); toast._t = setTimeout(()=> t.classList.remove("show"), 2700);
}

function setConn(state){
  ["#connMob","#connDesk"].forEach(sel=>{
    const el = $(sel); if(!el) return;
    el.classList.remove("online","offline"); el.classList.add(state);
    el.querySelector(".ct").textContent = state==="online" ? "Conectado" : "Sin conexión · guarda local";
  });
}
