export type ShapeType =
   | "start"
   | "io"
   | "decision"
   | "process"
   | "doc"
   | "prep"
   | "loop"
   | "input"
   | "stored-data"
   | "loop-limit"
   | "delay"
   | "display"
   | "off-page"
   | "multi-doc"
   | "direct-data"
   | "internal-storage"
   | "predefined-process"
   | "circle"
   | "merge"
   | "db";

export const templates = [
   { width: 100, height: 40, type: "start" },
   { width: 100, height: 60, type: "io" },
   { width: 80, height: 80, type: "decision" },
   { width: 100, height: 60, type: "process" },
   { width: 100, height: 60, type: "doc" },
   { width: 100, height: 60, type: "prep" },
   { width: 100, height: 60, type: "loop" },
   { width: 100, height: 60, type: "input" },
   { width: 100, height: 60, type: "stored-data" },
   { width: 100, height: 60, type: "loop-limit" },
   { width: 100, height: 60, type: "delay" },
   { width: 100, height: 60, type: "display" },
   { width: 50, height: 45, type: "off-page" },
   { width: 100, height: 60, type: "multi-doc" },
   { width: 100, height: 60, type: "direct-data" },
   { width: 100, height: 60, type: "internal-storage" },
   { width: 100, height: 60, type: "predefined-process" },
   { width: 40, height: 40, type: "circle" },
   { width: 60, height: 30, type: "merge" },
   { width: 100, height: 100, type: "db" }
]

export const scaleToMax = (arr: number[], targetMax: number) => {
   const maxVal = Math.max(...arr);
   return arr.map(x => x * targetMax / maxVal);
}

export function nanoId(size = 21) {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   const arr = new Uint8Array(size);
   crypto.getRandomValues(arr);
   return Array.from(arr, n => chars[n % chars.length]).join('');
}
