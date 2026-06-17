/* ════════════════════════════════════════════════════════════
   Firebase — proyecto asg-digital-30163 (dossier ASG)
   Usa el SDK "compat" (global window.firebase) que se carga por
   <script> en index.html: nada de ES modules. Acá inicializamos
   y dejamos db + las referencias a las colecciones disponibles
   para el resto de los módulos.
   ════════════════════════════════════════════════════════════ */

/* Config del proyecto (la apiKey de Firebase es pública, no es secreta) */
const cfg = {
  apiKey:"AIzaSyBIryzk2Gb0hbjV8BKrPFw_42-cx11zEnc",
  authDomain:"asg-digital-30163.firebaseapp.com",
  projectId:"asg-digital-30163",
  storageBucket:"asg-digital-30163.firebasestorage.app",
  messagingSenderId:"207099757585",
  appId:"1:207099757585:web:5d75cc66fa87e58acd5db0"
};

firebase.initializeApp(cfg);

/* Firestore con cache local + sincronización entre pestañas
   (equivale al persistentLocalCache/multiTab de la versión anterior). */
const db = firebase.firestore();
db.enablePersistence({ synchronizeTabs:true })
  .catch(err => console.warn("Firestore persistencia:", err.code));

/* ── Colecciones Firestore ── slugs EXACTOS: {tipo}_pos_cascanueces
   (un slug mal escrito rompe todo) */
const COL       = "productos_pos_cascanueces";
const colRef    = db.collection(COL);
const ventasRef = db.collection("ventas_pos_cascanueces");
const cfgRef    = db.collection("config_pos_cascanueces").doc("general");
