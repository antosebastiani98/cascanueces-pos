# CLAUDE.md — Cascanueces POS

## Qué es
App web (gestor + POS) para Cascanueces Uniformes. Reemplaza Nex POS. La opera la mamá (dueña), que NO es técnica.

## Regla #1: a prueba de mamá
Botones grandes (mín 56px), una mano, elegir es tocar (no escribir), cero jerga, acciones reversibles, español rioplatense (vos), voz Cascanueces (cálida, divertida, humor sutil). Inicio = "Vender" bien grande.

## Stack (no cambiar)
HTML/CSS/JS vanilla, sin frameworks ni build step. Estático en Hostinger (labs.asgdigital.pro).
Scripts con `defer` en orden; funciones globales en `window.*` (sin ES modules).
Firebase Firestore, proyecto asg-digital-30163.
IA vía proxy labs.asgdigital.pro/api-proxy.php (modelo claude-opus-4-5). Nunca API key en el front.

## Firestore (un slug mal escrito rompe todo)
Colecciones: `productos_pos_cascanueces`, `ventas_pos_cascanueces`, `clientes_pos_cascanueces`, `entregas_pos_cascanueces`, `caja_pos_cascanueces`.

## Marca Cascanueces
Principal celeste #8FB2C8 · texto gris #535B61 · azules #3457A8 y #294A7A · rojo #F72141 · SIN dorado.
Oscuros en gris neutro, nunca marrón. Cards claras sobre fondo suave.
Tipografías: More Sugar (títulos, vía cdnfonts), DM Sans (cuerpo/botones), Dancing Script ("Cascanueces" y firmas, máx 1 por pantalla).
Sin badges de versión visibles.

## Cómo trabajar (clave)
UN módulo por tarea. No editar varios archivos grandes de una. Código completo, sin placeholders.
Al terminar cada etapa, frenar y resumir qué quedó y cómo lo usa la mamá.

## Etapas
1. Inventario  2) Vender (POS)  3) Clientes + WhatsApp  4) Entregas  5) Caja + Reportes  6) Voz (dictado IA)
Fase aparte (servidor, no es archivo de este repo): ingesta automática por WhatsApp Cloud API.
