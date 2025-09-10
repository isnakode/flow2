<script lang="ts">
   import FlowchartNode from "$lib/comp/FlowchartNode.svelte";
   import {
      Circle,
      Diamond,
      Hexagon,
      MousePointer2,
      Pentagon,
      RectangleHorizontal,
      Shapes,
      Square,
      Triangle,
   } from "@lucide/svelte";
   import type { Node, NodeTypes } from "@xyflow/svelte";
   import { Panel, SvelteFlow } from "@xyflow/svelte";

   const nodeTypes: NodeTypes = {
      flow: FlowchartNode,
   };

   import "@xyflow/svelte/dist/style.css";

   let nodes: Node[] = $state.raw([
      {
         id: "1",
         position: { x: 10, y: 10 },
         data: { type: "start" },
         type: "flow",
         width: 120,
         height: 40,
      },
      {
         id: "2",
         position: { x: 10, y: 70 },
         data: { type: "io" },
         type: "flow",
         width: 120,
         height: 70,
      },
      {
         id: "3",
         position: { x: 10, y: 150 },
         data: { type: "decision" },
         type: "flow",
         width: 80,
         height: 80,
      },
      {
         id: "4",
         position: { x: 160, y: 10 },
         data: { type: "process" },
         type: "flow",
         width: 100,
         height: 60,
      },
      {
         id: "5",
         position: { x: 160, y: 80 },
         data: { type: "doc" },
         type: "flow",
         width: 100,
         height: 60,
      },
      {
         id: "6",
         position: { x: 160, y: 160 },
         data: { type: "prep" },
         type: "flow",
         width: 100,
         height: 60,
      },
      {
         id: "7",
         position: { x: 160, y: 240 },
         data: { type: "loop" },
         type: "flow",
         width: 100,
         height: 60,
      },
      {
         id: "8",
         position: { x: 160, y: 310 },
         data: { type: "input" },
         type: "flow",
         width: 100,
         height: 60,
      },
      {
         id: "9",
         position: { x: 290, y: 10 },
         data: { type: "stored-data" },
         type: "flow",
         width: 100,
         height: 60,
      },
      {
         id: "10",
         position: { x: 290, y: 80 },
         data: { type: "loop-limit" },
         type: "flow",
         width: 100,
         height: 60,
      },
      {
         id: "11",
         position: { x: 290, y: 160 },
         data: { type: "delay" },
         type: "flow",
         width: 100,
         height: 60,
      },
      {
         id: "12",
         position: { x: 290, y: 240 },
         data: { type: "display" },
         type: "flow",
         width: 100,
         height: 60,
      },
      {
         id: "13",
         position: { x: 290, y: 310 },
         data: { type: "off-page" },
         type: "flow",
         width: 50,
         height: 45,
      },
      {
         id: "14",
         position: { x: 290, y: 370 },
         data: { type: "multi-doc" },
         type: "flow",
         width: 100,
         height: 60,
      },
   ]);

   let edges = $state.raw([{ id: "e1-2", source: "1", target: "2" }]);
</script>

<div style:width="100vw" style:height="100vh">
   <SvelteFlow {nodeTypes} bind:nodes bind:edges>
      <Panel
         position="center-left"
         class="bg-white rounded-md p-1 shadow-lg border border-gray-200 flex flex-col gap-1"
      >
         {#each [MousePointer2, Shapes] as Icon, i}
            <button class="aspect-square cursor-pointer relative group">
               <Icon
                  class="size-full p-1.5 rounded {i == 0
                     ? 'bg-blue-400 text-white'
                     : 'hover:bg-blue-100'}"
               />
               {#if i == 1}
                  <div
                     class="bg-white rounded-md gap-1 p-1 shadow-lg border border-gray-200 group-focus-within:grid hidden grid-cols-[repeat(2,max-content)] absolute left-[120%] top-1/2 -translate-y-1/2"
                  >
                     {#each [RectangleHorizontal, Circle, Triangle, Hexagon, Pentagon, Square, Diamond] as Iconly, j}
                        <Iconly
                           size="36"
                           class=" p-1.5 rounded {j == -1
                              ? 'bg-blue-400 text-white'
                              : 'hover:bg-blue-100'}"
                        />
                     {/each}
                  </div>
               {/if}
            </button>
         {/each}
      </Panel>
   </SvelteFlow>
</div>
