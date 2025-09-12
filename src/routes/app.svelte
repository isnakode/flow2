<script lang="ts">
   import ExportIcon from "$lib/assets/icons/export.svg";
   import SaveIcon from "$lib/assets/icons/save.svg";
   import ShapeIcon from "$lib/assets/icons/shape.svg";
   import FlowchartNode from "$lib/comp/FlowchartNode.svelte";
   import FlowchartShape from "$lib/comp/FlowchartShape.svelte";
   import { nanoId, scaleToMax, templates } from "$lib/types/ShapeType";
   import "@xyflow/svelte/dist/style.css";

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
      useSvelteFlow,
      type Edge,
      type Node,
      type NodeTypes,
   } from "@xyflow/svelte";

   const nodeTypes: NodeTypes = {
      flow: FlowchartNode,
   };
   const {
      set: setNodes,
      current: currentNodes,
      update: updateNodes,
   } = useNodes();
   const {
      set: setEdges,
      current: currentEdges,
      update: updateEdges,
   } = useEdges();
   const { screenToFlowPosition, updateNodeData } = useSvelteFlow();

   $effect(() => {
      if (browser) {
         localStorage.setItem(
            "nodes",
            JSON.stringify(nodes.map((n) => ({ ...n, selected: false }))),
         );
         localStorage.setItem(
            "edges",
            JSON.stringify(edges.map((e) => ({ ...e, selected: false }))),
         );
      }
   });

   let nodes: Node[] = $state.raw(
      JSON.parse(localStorage.getItem("nodes") ?? "[]"),
   );
   let edges: Edge[] = $state.raw(
      JSON.parse(localStorage.getItem("edges") ?? "[]"),
   );
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

   useOnSelectionChange(({ nodes, edges }) => {
      selectedNodes = nodes;
   });
   const copy = async () => {
      await navigator.clipboard.writeText(JSON.stringify(selectedNodes));
   };
   const selectAll = async () => {
      updateNodes((nodes) => nodes.map((n) => ({ ...n, selected: true })));
      updateEdges((edges) => edges.map((e) => ({ ...e, selected: true })));
   };
   const paste = async () => {
      const res = await navigator.clipboard.readText();
      const copied: Node[] = JSON.parse(res);
      for (const copy of copied) {
         if (isNode(copy)) {
            setNodes([
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
</script>

<svelte:window
   onkeydown={(e) => {
      if (e.ctrlKey && e.key == "d") {
         e.preventDefault();
         copy();
         paste();
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
            key: "a",
            modifier: ["ctrl"],
            callback: selectAll,
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
      deleteKey={["Delete", "Backspace"]}
      fitView
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
                           onclick={() => {
                              if (browser) {
                                 const { x, y } = screenToFlowPosition({
                                    x: window.innerWidth / 2 - t.width,
                                    y: window.innerHeight / 2 - t.height,
                                 });
                                 const newNode: Node = {
                                    height: t.height,
                                    width: t.width,
                                    position: { x, y },
                                    id: nanoId(15),
                                    type: "flow",
                                    data: { type: t.type },
                                 };
                                 setNodes([...nodes, newNode]);
                              }
                           }}
                           class="flex justify-center items-center hover:bg-blue-200 aspect-square p-0.5 rounded"
                        >
                           <FlowchartShape
                              type={t.type}
                              {width}
                              {height}
                              strokeWidth={1}
                              fill="#dbdbdb"
                           />
                        </button>
                     {/each}
                  </div>
               {/if}
            </div>
         {/each}
      </Panel>
      <Panel
         position="top-right"
         class="bg-white  p-1 shadow-lg border border-gray-200 flex flex-col gap-1 m-0! h-dvh"
      >
         <input type="text" class="input input-sm" />
      </Panel>
   </SvelteFlow>
</div>
