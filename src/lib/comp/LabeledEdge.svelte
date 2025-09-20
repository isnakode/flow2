<script lang="ts">
   import {
      BaseEdge,
      EdgeLabel,
      getBezierPath,
      getSmoothStepPath,
      getStraightPath,
      useEdges,
      useSvelteFlow,
      type Edge,
      type EdgeProps,
      type Node,
   } from "@xyflow/svelte";

   type EdgeData = { type: string };

   const { updateEdge } = useSvelteFlow<Node, Edge<EdgeData>>();

   let {
      id,
      sourceX,
      sourceY,
      targetX,
      targetY,
      data,
      label,
      sourcePosition,
      targetPosition,
   }: EdgeProps<Edge<EdgeData>> = $props();

   let [edgePath, labelX, labelY] = $derived.by(() => {
      const c = {
         sourceX,
         sourceY,
         targetX,
         targetY,
         sourcePosition,
         targetPosition,
      };
      switch (data?.type) {
         case "smooth":
            return getSmoothStepPath(c);
         case "bezier":
            return getBezierPath(c);
         case "straight":
         default:
            return getStraightPath(c);
      }
   });

   let activeElement: HTMLElement | null = $state(null);

   const edges = useEdges();
</script>

<svelte:document bind:activeElement />

<BaseEdge {id} path={edgePath} />
<EdgeLabel transparent={label == ""} x={labelX} y={labelY}>
   <div
      id="edge-label-input-{id}"
      bind:innerText={label}
      oninput={(e) => {
         let label = e.currentTarget.innerText;
         if (label == "\n") label = label.replace("\n", "");
         updateEdge(id, { label });
      }}
      role="textbox"
      tabindex="0"
      contenteditable
      class="w-max outline-none nodrag nopan">
   </div>
</EdgeLabel>

<!-- style="max-width:{width}px;
   font-size:{data.fontSize}px;
   text-align:{data.textAlign};" -->
