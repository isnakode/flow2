<script lang="ts">
   import ExportIcon from "$lib/assets/icons/export.svg";
   import Maximize from "$lib/assets/icons/maximize.svg";
   import SaveIcon from "$lib/assets/icons/save.svg";
   import ShapeIcon from "$lib/assets/icons/shape.svg";
   import ZoomIn from "$lib/assets/icons/ZoomIn.svg";
   import ZoomOut from "$lib/assets/icons/ZoomOut.svg";
   import FlowchartNode from "$lib/comp/FlowchartNode.svelte";
   import FlowchartShape from "$lib/comp/FlowchartShape.svelte";
   import { nanoId, scaleToMax, templates } from "$lib/types/ShapeType";
   import "@xyflow/svelte/dist/style.css";
   import Lz from "lz-string";

   import { browser } from "$app/environment";
   import { shortcut } from "@svelte-put/shortcut";
   import {
      ConnectionLineType,
      ConnectionMode,
      isNode,
      Panel,
      SvelteFlow,
      useEdges,
      useNodes,
      useOnSelectionChange,
      useStore,
      useSvelteFlow,
      type Edge,
      type Node,
      type NodeTypes,
   } from "@xyflow/svelte";
   import { onMount } from "svelte";

   const nodeTypes: NodeTypes = {
      flow: FlowchartNode,
   };
   const node = useNodes();
   const edge = useEdges();
   const {
      screenToFlowPosition,
      updateNodeData,
      updateNode,
      setZoom,
      getNodesBounds,
   } = useSvelteFlow();

   $effect(() => {
      if (browser) {
         localStorage.setItem(
            "nodes",
            Lz.compress(
               JSON.stringify(nodes.map(({ selected, dragging, ...n }) => n)),
            ),
         );
         localStorage.setItem(
            "edges",
            Lz.compress(JSON.stringify(edges.map(({ selected, ...n }) => n))),
         );
      }
   });

   const getStorageData = (storageName: string) => {
      if (localStorage.getItem(storageName) != null) {
         return JSON.parse(Lz.decompress(localStorage.getItem(storageName)!));
      }
      return [];
   };
   let nodes: Node[] = $state.raw(getStorageData("nodes"));
   let edges: Edge[] = $state.raw(getStorageData("edges"));
   let isDragging = $state(false);
   let hoveredIds = $state<string[]>([]);

   const gap = 30;
   const onmousemove = (e: MouseEvent) => {
      if (!isDragging) return;
      const mouse = screenToFlowPosition({
         x: e.clientX,
         y: e.clientY,
      });
      hoveredIds = [];
      for (const { position: p, width = 0, height = 0, id } of nodes) {
         const onX = mouse.x > p.x - gap && mouse.x < p.x + width + gap;
         const onY = mouse.y > p.y - gap && mouse.y < p.y + height + gap;
         updateNodeData(id, { willConnect: onX && onY });
         hoveredIds.push(id);
      }
   };

   let selectedNodes: Node[] = $state([]);
   let selectedEdges: Edge[] = $state([]);

   useOnSelectionChange(({ nodes, edges }) => {
      selectedNodes = nodes;
      selectedEdges = edges;
   });
   const copy = async () => {
      await navigator.clipboard.writeText(JSON.stringify(selectedNodes));
   };
   const selectAll = () => {
      node.update((nodes) => nodes.map((n) => ({ ...n, selected: true })));
      edge.update((edges) => edges.map((e) => ({ ...e, selected: true })));
   };
   const paste = async () => {
      const res = await navigator.clipboard.readText();
      const copied: Node[] = JSON.parse(res);
      for (const copy of copied) {
         if (isNode(copy)) {
            node.set([
               ...nodes,
               {
                  ...copy,
                  id: nanoId(),
                  selected: false,
                  position: {
                     x: copy.position.x + 10,
                     y: copy.position.y + 10,
                  },
               },
            ]);
         }
      }
   };
   let st = $derived(useStore());
   onMount(async () => {
      await st.fitView();
      await setZoom(1);
   });
   let holdShapeTimeoutId = $state<number | null>(null);
   let selected: Node | undefined = $derived.by(() => {
      if (selectedNodes.length != 1) return;
      return nodes.find((n) => n.id == selectedNodes[0].id);
   });
</script>

<svelte:window
   onkeydown={async (e) => {
      if (e.ctrlKey && e.key == "d") {
         e.preventDefault();
         copy();
         paste();
      }
      if (e.ctrlKey && e.key === "a") {
         const tag = (e.target as HTMLElement)?.tagName.toLowerCase();
         if (tag === "input" || tag === "textarea") {
            return;
         }
         selectAll();
      }
   }}
   use:shortcut={{
      trigger: [
         {
            key: "c",
            modifier: ["ctrl"],
            callback: copy,
         },
         {
            key: "v",
            modifier: ["ctrl"],
            callback: paste,
         },
      ],
   }}
/>

<div style:width="100vw" style:height="100vh">
   <SvelteFlow
      elevateNodesOnSelect={true}
      deleteKey={["Delete", "Backspace"]}
      connectionLineType={ConnectionLineType.SmoothStep}
      panOnDrag={[1, 2]}
      {nodeTypes}
      bind:nodes
      bind:edges
      defaultEdgeOptions={{ type: "smoothstep" }}
      {onmousemove}
      onconnectstart={() => (isDragging = true)}
      onconnectend={() => {
         isDragging = false;
         for (const id of hoveredIds) {
            updateNodeData(id, { willConnect: false });
         }
      }}
      connectionMode={ConnectionMode.Loose}
   >
      <Panel
         position="center-left"
         class="bg-white rounded-md p-1 shadow-lg border border-gray-200 flex flex-col gap-1"
      >
         {#each [ShapeIcon, ExportIcon, SaveIcon] as icon, i}
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <div
               tabindex="0"
               class="aspect-square cursor-pointer relative group"
            >
               <p class="size-8 p-1.5 rounded hover:bg-blue-100">
                  <img src={icon} alt="" />
               </p>
               {#if i == 0}
                  <div
                     class="bg-white rounded-md gap-1 p-1 shadow-lg border border-gray-200 group-focus-within:grid hidden grid-cols-[repeat(4,max-content)] absolute left-[120%] top-1/2 -translate-y-1/2"
                  >
                     {#each templates as t (t.type)}
                        {@const [width, height] = scaleToMax(
                           [t.width, t.height],
                           32,
                        )}
                        <button
                           onmousedown={(e) => {
                              holdShapeTimeoutId = setTimeout(() => {
                                 const position = screenToFlowPosition({
                                    x: e.clientX,
                                    y: e.clientY,
                                 });
                                 const newNode: Node = {
                                    id: nanoId(15),
                                    height: t.height,
                                    width: t.width,
                                    position,
                                    type: "flow",
                                    data: {
                                       type: t.type,
                                       strokeWidth: 1,
                                       stroke: "#6B6B6B",
                                       fill: "#dbdbdb",
                                    },
                                 };
                                 node.set([...nodes, newNode]);
                                 holdShapeTimeoutId = null;
                              }, 450);
                           }}
                           onmouseup={() => {
                              if (holdShapeTimeoutId != null) {
                                 clearTimeout(holdShapeTimeoutId);
                                 holdShapeTimeoutId = null;
                                 const position = screenToFlowPosition({
                                    x: window.innerWidth / 2 - t.width,
                                    y: window.innerHeight / 2 - t.height,
                                 });
                                 const newNode: Node = {
                                    id: nanoId(15),
                                    height: t.height,
                                    width: t.width,
                                    position,
                                    type: "flow",
                                    data: {
                                       type: t.type,
                                       strokeWidth: 1,
                                       stroke: "#6B6B6B",
                                       fill: "#dbdbdb",
                                    },
                                 };
                                 node.set([...nodes, newNode]);
                              }
                           }}
                           class="flex justify-center items-center hover:bg-blue-200 aspect-square p-0.5 rounded"
                        >
                           <FlowchartShape
                              type={t.type}
                              {width}
                              {height}
                              strokeWidth={1}
                              stroke="#6B6B6B"
                              fill="#dbdbdb"
                           />
                        </button>
                     {/each}
                  </div>
               {/if}
            </div>
         {/each}
         <button
            onclick={async () => await st.fitView()}
            class="aspect-square cursor-pointer relative group"
         >
            <p class="size-8 p-1.5 rounded hover:bg-blue-100">
               <img src={Maximize} alt="" />
            </p>
         </button>
         <button
            onclick={async () => {
               await st.zoomIn();
            }}
            class="aspect-square cursor-pointer relative group"
         >
            <p class="size-8 p-1.5 rounded hover:bg-blue-100">
               <img src={ZoomIn} alt="" />
            </p>
         </button>
         <button
            onclick={async () => await st.zoomOut()}
            class="aspect-square cursor-pointer relative group"
         >
            <p class="size-8 p-1.5 rounded hover:bg-blue-100">
               <img src={ZoomOut} alt="" />
            </p>
         </button>
      </Panel>
      <Panel
         position="top-left"
         class="bg-white rounded-md shadow-lg p-1 border-gray-200"
      >
         <p class="font-bold">Log</p>
         <p>Viewport: {JSON.stringify(st.viewport)}</p>
         <p>nodes bounds: {JSON.stringify(getNodesBounds(nodes))}</p>
      </Panel>
      <Panel
         position="top-right"
         class="bg-white  p-1 shadow-lg border w-48 border-gray-200 flex flex-col gap-1 m-0! h-dvh"
      >
         {#if selected}
            <div class="flex gap-2">
               <div class="w-full">
                  <label for="x-input" class="label text-xs">x</label>
                  <input
                     id="x-input"
                     class="input input-sm"
                     type="number"
                     value={selected.position.x}
                     oninput={(e) => {
                        updateNode(selected.id, {
                           position: {
                              ...selected.position,
                              x: parseInt(e.currentTarget.value),
                           },
                        });
                     }}
                  />
               </div>
               <div class="w-full">
                  <label for="y-input" class="label text-xs">y</label>
                  <input
                     id="y-input"
                     class="input input-sm"
                     type="number"
                     value={selected.position.y}
                     oninput={(e) => {
                        updateNode(selected.id, {
                           position: {
                              ...selected.position,
                              y: parseInt(e.currentTarget.value),
                           },
                        });
                     }}
                  />
               </div>
            </div>
            <div class="flex gap-2">
               <div class="w-full">
                  <label for="width-input" class="label text-xs">Width</label>
                  <input
                     id="width-input"
                     class="input input-sm"
                     type="number"
                     value={selected.width}
                     oninput={(e) => {
                        updateNode(selected.id, {
                           width: parseInt(e.currentTarget.value),
                        });
                     }}
                  />
               </div>
               <div class="w-full">
                  <label for="height-input" class="label text-xs">Height</label>
                  <input
                     id="height-input"
                     class="input input-sm"
                     type="number"
                     value={selected.height}
                     oninput={(e) => {
                        updateNode(selected.id, {
                           height: parseInt(e.currentTarget.value),
                        });
                     }}
                  />
               </div>
            </div>
            <div class="flex gap-2">
               <div class="w-full">
                  <label for="color-input" class="label text-xs"> Fill </label>
                  <input
                     id="color-input"
                     class="input input-sm"
                     type="color"
                     value={selected.data.fill}
                     oninput={(e) => {
                        updateNodeData(selected.id, {
                           fill: e.currentTarget.value,
                        });
                     }}
                  />
               </div>
               <div class="w-full">
                  <label for="border-color-input" class="label text-xs">
                     Border
                  </label>
                  <input
                     id="border-color-input"
                     class="input input-sm"
                     type="color"
                     value={selected.data.stroke}
                     oninput={(e) => {
                        updateNodeData(selected.id, {
                           stroke: e.currentTarget.value,
                        });
                     }}
                  />
               </div>
            </div>
            <label for="stroke-width-input" class="label text-xs">
               Border width
            </label>
            <input
               id="stroke-width-input"
               class="input input-sm"
               type="number"
               value={selected.data.strokeWidth}
               oninput={(e) => {
                  const v = e.currentTarget.value;
                  updateNodeData(selected.id, {
                     strokeWidth: v == "" ? 0 : parseInt(v),
                  });
               }}
            />
         {/if}
      </Panel>
   </SvelteFlow>
</div>
