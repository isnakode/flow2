<script lang="ts">
   import ITextCenter from "$lib/assets/icons/text-center.svelte";
   import ITextJustify from "$lib/assets/icons/text-justify.svelte";
   import ITextLeft from "$lib/assets/icons/text-left.svelte";
   import ITextRight from "$lib/assets/icons/text-right.svelte";
   import { mergeObjects, type Property } from "$lib/types/ShapeType";
   import { Panel, useNodes } from "@xyflow/svelte";
   const { properties }: { properties: Property[] } = $props();

   let property = $derived.by(() => mergeObjects(...properties));
   let nodeIds = $derived(new Set(properties.map((p) => p.id)));

   const textAlignData = [
      {
         icon: ITextLeft,
         align: "left",
      },
      {
         icon: ITextCenter,
         align: "center",
      },
      {
         icon: ITextRight,
         align: "right",
      },
      {
         icon: ITextJustify,
         align: "justify",
      },
   ];

   const node = useNodes();
</script>

<Panel
   position="top-right"
   class="bg-zinc-900 px-2 w-52 flex flex-col gap-1 m-0! h-dvh text-white">
   <div class="flex gap-2">
      <div class="w-full">
         <label for="x-input" class="label text-xs">x</label>
         <input
            id="x-input"
            class="input input-sm"
            type="number"
            value={property.x}
            oninput={(e) => {
               node.update((nodes) =>
                  nodes.map((n) => {
                     if (nodeIds.has(n.id)) {
                        return {
                           ...n,
                           position: {
                              ...n.position,
                              x: parseInt(e.currentTarget.value),
                           },
                        };
                     }
                     return n;
                  }),
               );
            }} />
      </div>
      <div class="w-full">
         <label for="y-input" class="label text-xs">y</label>
         <input
            id="y-input"
            class="input input-sm"
            type="number"
            value={property.y}
            oninput={(e) => {
               node.update((nodes) =>
                  nodes.map((n) => {
                     if (nodeIds.has(n.id)) {
                        return {
                           ...n,
                           position: {
                              ...n.position,
                              x: parseInt(e.currentTarget.value),
                           },
                        };
                     }
                     return n;
                  }),
               );
            }} />
      </div>
   </div>
   <div class="flex gap-2">
      <div class="w-full">
         <label for="width-input" class="label text-xs">Width</label>
         <input
            id="width-input"
            class="input input-sm"
            type="number"
            value={property.width}
            oninput={(e) => {
               node.update((nodes) =>
                  nodes.map((n) => {
                     if (nodeIds.has(n.id)) {
                        if (n.data.type == "circle") {
                           return {
                              ...n,
                              width: parseInt(e.currentTarget.value),
                              height: parseInt(e.currentTarget.value),
                           };
                        }
                        return {
                           ...n,
                           width: parseInt(e.currentTarget.value),
                        };
                     }
                     return n;
                  }),
               );
            }} />
      </div>
      <div class="w-full">
         <label for="height-input" class="label text-xs">Height</label>
         <input
            id="height-input"
            class="input input-sm"
            type="number"
            value={property.height}
            oninput={(e) => {
               node.update((nodes) =>
                  nodes.map((n) => {
                     if (nodeIds.has(n.id)) {
                        if (n.data.type == "circle") {
                           return {
                              ...n,
                              width: parseInt(e.currentTarget.value),
                              height: parseInt(e.currentTarget.value),
                           };
                        }
                        return {
                           ...n,
                           height: parseInt(e.currentTarget.value),
                        };
                     }
                     return n;
                  }),
               );
            }} />
      </div>
   </div>
   <div class="flex gap-2">
      <div class="w-full">
         <label for="color-input" class="label text-xs"> Fill </label>
         <input
            id="color-input"
            class="input input-sm"
            type="color"
            value={property.fill ?? "#000000"}
            oninput={(e) => {
               node.update((nodes) =>
                  nodes.map((n) => {
                     if (nodeIds.has(n.id)) {
                        return {
                           ...n,
                           data: {
                              ...n.data,
                              fill: e.currentTarget.value,
                           },
                        };
                     }
                     return n;
                  }),
               );
            }} />
      </div>
      <div class="w-full">
         <label for="border-color-input" class="label text-xs"> Border </label>
         <input
            id="border-color-input"
            class="input input-sm"
            type="color"
            value={property.stroke ?? "#000000"}
            oninput={(e) => {
               node.update((nodes) =>
                  nodes.map((n) => {
                     if (nodeIds.has(n.id)) {
                        return {
                           ...n,
                           data: {
                              ...n.data,
                              stroke: e.currentTarget.value,
                           },
                        };
                     }
                     return n;
                  }),
               );
            }} />
      </div>
   </div>
   <div class="flex gap-2">
      <div class="w-full">
         <label for="stroke-width-input" class="label text-xs">
            Border width
         </label>
         <input
            id="stroke-width-input"
            class="input input-sm"
            type="number"
            value={property.strokeWidth}
            oninput={(e) => {
               const v = e.currentTarget.value;
               node.update((nodes) =>
                  nodes.map((n) => {
                     if (nodeIds.has(n.id)) {
                        return {
                           ...n,
                           data: {
                              ...n.data,
                              strokeWidth: Number(v) || 0,
                           },
                        };
                     }
                     return n;
                  }),
               );
            }} />
      </div>
      <div class="w-full">
         <label for="font-size-input" class="label text-xs"> Font size </label>
         <input
            id="font-size-input"
            class="input input-sm"
            type="number"
            value={property.fontSize}
            oninput={(e) => {
               const v = e.currentTarget.value;
               node.update((nodes) =>
                  nodes.map((n) => {
                     if (nodeIds.has(n.id)) {
                        return {
                           ...n,
                           data: {
                              ...n.data,
                              fontSize: v == "" ? 0 : parseInt(v),
                           },
                        };
                     }
                     return n;
                  }),
               );
            }} />
      </div>
   </div>

   <label for="node-text-input" class="label text-xs"> Text </label>
   <textarea
      id="node-text-input"
      class="textarea textarea-sm text-left"
      oninput={(e) => {
         const text = e.currentTarget.value;
         node.update((nodes) =>
            nodes.map((n) => {
               if (nodeIds.has(n.id)) {
                  return {
                     ...n,
                     data: {
                        ...n.data,
                        text,
                     },
                  };
               }
               return n;
            }),
         );
      }}>{property.text}</textarea>
   <div class="flex gap-1 justify-center mt-1">
      {#each textAlignData as data}
         <button
            onclick={() => {
               node.update((nodes) =>
                  nodes.map((n) => {
                     if (nodeIds.has(n.id)) {
                        return {
                           ...n,
                           data: {
                              ...n.data,
                              textAlign: data.align as any,
                           },
                        };
                     }
                     return n;
                  }),
               );
            }}
            class="size-8 rounded-md p-1.5 text-white cursor-pointer
                     {property.textAlign == data.align
               ? 'bg-zinc-600'
               : 'hover:bg-zinc-700'}">
            <data.icon />
         </button>
      {/each}
   </div>
</Panel>

<style>
   @reference '../app.css';
   input,
   textarea {
      @apply bg-zinc-800;
      color-scheme: dark !important;
   }
</style>
