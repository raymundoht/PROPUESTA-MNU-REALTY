"use client";

import { useSyncExternalStore } from "react";

// Favoritos de visitantes anónimos: se guardan en el navegador.
// Cuando existan cuentas de cliente se sincronizarán con la tabla `favorites`.
const KEY = "mnu:favoritos";
const EVENT = "mnu:favoritos-change";

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

let cache: string[] = [];
let cacheRaw = "";

function snapshot() {
  let raw = "[]";
  try {
    raw = localStorage.getItem(KEY) ?? "[]";
  } catch {}
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cache = read();
  }
  return cache;
}

const empty: string[] = [];

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useFavorites() {
  return useSyncExternalStore(subscribe, snapshot, () => empty);
}

export function toggleFavorite(id: string) {
  const list = read();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}
