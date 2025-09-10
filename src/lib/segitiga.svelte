<script lang="ts">
   type Direction = "l" | "t" | "r" | "b" | "tl" | "tr" | "bl" | "br";
   type Rect = { x: number; y: number; width: number; height: number };

   const {
      stroke = 0,
      onResize,
      rect,
   }: {
      rect: Rect;
      stroke?: number;
      onResize: (rect: Rect) => void;
   } = $props();

   let mouseDownOn: Direction | null = null;
   let hoverDir: Direction | null = null;
   let startX = 0;
   let startY = 0;
   let startRect: Rect | null = null;

   // Peta arah ke style cursor
   const cursorMap: Record<Direction, string> = {
      tl: "nwse-resize",
      br: "nwse-resize",
      tr: "nesw-resize",
      bl: "nesw-resize",
      t: "ns-resize",
      b: "ns-resize",
      l: "ew-resize",
      r: "ew-resize",
   };

   function getDirection(
      mouseX: number,
      mouseY: number,
      rect: Rect,
      edge = 10,
   ): Direction | null {
      const left = Math.abs(mouseX - rect.x) <= edge;
      const right = Math.abs(mouseX - (rect.x + rect.width)) <= edge;
      const top = Math.abs(mouseY - rect.y) <= edge;
      const bottom = Math.abs(mouseY - (rect.y + rect.height)) <= edge;

      if (top && left) return "tl";
      if (top && right) return "tr";
      if (bottom && left) return "bl";
      if (bottom && right) return "br";
      if (top) return "t";
      if (bottom) return "b";
      if (left) return "l";
      if (right) return "r";
      return null;
   }

   function updateCursor(dir: Direction | null) {
      const newCursor = dir ? cursorMap[dir] : "auto";
      if (document.body.style.cursor !== newCursor) {
         document.body.style.cursor = newCursor;
      }
   }

   function onMouseDown(e: MouseEvent) {
      if (hoverDir) {
         mouseDownOn = hoverDir;
         startX = e.pageX;
         startY = e.pageY;
         startRect = { ...rect };
      }
   }

   function onMouseUp() {
      mouseDownOn = null;
      startRect = null;
   }

   function onMouseMove(e: MouseEvent) {
      if (mouseDownOn && startRect) {
         // Drag aktif → resize pakai delta
         const dx = e.pageX - startX;
         const dy = e.pageY - startY;

         let { x, y, width, height } = startRect;

         if (mouseDownOn.includes("r")) width = startRect.width + dx;
         if (mouseDownOn.includes("l")) {
            x = startRect.x + dx;
            width = startRect.width - dx;
         }
         if (mouseDownOn.includes("b")) height = startRect.height + dy;
         if (mouseDownOn.includes("t")) {
            y = startRect.y + dy;
            height = startRect.height - dy;
         }

         if (width >= 0 && height >= 0) {
            onResize({ x, y, width, height });
         }
      } else {
         // Hover → deteksi edge / corner
         hoverDir = getDirection(e.pageX, e.pageY, rect, 10);
         updateCursor(hoverDir);
      }
   }
</script>

<svelte:document
   onmousemove={onMouseMove}
   onmousedown={onMouseDown}
   onmouseup={onMouseUp}
/>

<svg
   style="
      width: {rect.width}px;
      height: {rect.height}px;
      top: {rect.y}px;
      left: {rect.x}px;
      position: absolute;
   "
   class="border"
   viewBox="-{stroke / 2} -{stroke / 2} {rect.width + stroke} {rect.height +
      stroke}"
>
   <path
      class="stroke-blue-400 fill-blue-500"
      d="M{rect.width / 2} 0 L{rect.width} {rect.height} L0 {rect.height} Z"
      stroke-linejoin="round"
      stroke-width="{stroke}px"
   />
</svg>
