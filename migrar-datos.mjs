// ════════════════════════════════════════════════════════════════════════
// Migración de datos: proyecto VIEJO (asg-digital) → proyecto NUEVO
// SOLO copia las colecciones de Cascanueces. NO borra NADA del viejo.
//
// Mueve 9 colecciones + el doc de configuración, conservando los mismos IDs.
// Es idempotente: si lo corrés dos veces, simplemente vuelve a pisar con lo
// mismo (no duplica).
//
// ── CÓMO USARLO ─────────────────────────────────────────────────────────
//   1) Tené Node 18 o más nuevo.
//   2) En esta carpeta:  npm init -y  &&  npm i firebase
//   3) Pegá abajo el firebaseConfig del proyecto NUEVO (CFG_NUEVO).
//   4) Poné el email y la contraseña del usuario que creaste en el proyecto
//      nuevo (así funciona aunque las reglas ya estén cerradas):
//         export CASC_EMAIL="tucorreo@ejemplo.com"
//         export CASC_PASS="tucontraseña"
//   5) Corré:  node migrar-datos.mjs
//
// Si todavía tenés el proyecto nuevo en "modo prueba" (reglas abiertas),
// podés correrlo sin email/contraseña: igual va a escribir.
// ════════════════════════════════════════════════════════════════════════

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// ── Proyecto VIEJO (solo lectura; queda intacto) ──
const CFG_VIEJO = {
  apiKey: "AIzaSyBIryzk2Gb0hbjV8BKrPFw_42-cx11zEnc",
  authDomain: "asg-digital-30163.firebaseapp.com",
  projectId: "asg-digital-30163",
  storageBucket: "asg-digital-30163.firebasestorage.app",
  messagingSenderId: "207099757585",
  appId: "1:207099757585:web:5d75cc66fa87e58acd5db0",
};

// ⬇️⬇️⬇️  PEGÁ ACÁ EL CONFIG DEL PROYECTO NUEVO  ⬇️⬇️⬇️
const CFG_NUEVO = {
  apiKey: "PEGAR_AQUI",
  authDomain: "PEGAR_AQUI.firebaseapp.com",
  projectId: "PEGAR_AQUI",
  storageBucket: "PEGAR_AQUI.firebasestorage.app",
  messagingSenderId: "PEGAR_AQUI",
  appId: "PEGAR_AQUI",
};
// ⬆️⬆️⬆️  FIN DEL CONFIG A PEGAR  ⬆️⬆️⬆️

const COLECCIONES = [
  "productos_pos_cascanueces",
  "ventas_pos_cascanueces",
  "clientes_pos_cascanueces",
  "entregas_pos_cascanueces",
  "caja_pos_cascanueces",
  "egresos_pos_cascanueces",
  "espera_pos_cascanueces",
  "encargos_pos_cascanueces",
  "cuenta_pos_cascanueces",
];
const CONFIG_DOC = ["config_pos_cascanueces", "general"];

async function main() {
  if (CFG_NUEVO.projectId === "PEGAR_AQUI") {
    console.error("✋ Falta pegar el config del proyecto NUEVO (CFG_NUEVO) en este archivo.");
    process.exit(1);
  }

  const viejo = getFirestore(initializeApp(CFG_VIEJO, "viejo"));
  const nuevoApp = initializeApp(CFG_NUEVO, "nuevo");
  const nuevo = getFirestore(nuevoApp);

  // Login en el proyecto nuevo (opcional, pero recomendado con reglas cerradas).
  const email = process.env.CASC_EMAIL, pass = process.env.CASC_PASS;
  if (email && pass) {
    await signInWithEmailAndPassword(getAuth(nuevoApp), email, pass);
    console.log(`🔑 Logueado en el proyecto nuevo como ${email}`);
  } else {
    console.log("ℹ️  Sin CASC_EMAIL/CASC_PASS: asumo que el proyecto nuevo está en modo prueba.");
  }

  let total = 0;
  for (const col of COLECCIONES) {
    const snap = await getDocs(collection(viejo, col));
    for (const d of snap.docs) {
      await setDoc(doc(nuevo, col, d.id), d.data());
      total++;
    }
    console.log(`✓ ${col}: ${snap.size} copiados`);
  }

  // Doc de configuración
  const cs = await getDoc(doc(viejo, CONFIG_DOC[0], CONFIG_DOC[1]));
  if (cs.exists()) {
    await setDoc(doc(nuevo, CONFIG_DOC[0], CONFIG_DOC[1]), cs.data());
    console.log("✓ config_pos_cascanueces/general: copiado");
  }

  console.log(`\n✅ Listo. ${total} registros + config copiados al proyecto nuevo.`);
  console.log("   El proyecto viejo asg-digital quedó intacto.");
  process.exit(0);
}

main().catch((e) => { console.error("❌ Error:", e.message || e); process.exit(1); });
