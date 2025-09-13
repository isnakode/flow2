<script lang="ts">
   import {
      Handle,
      NodeResizer,
      Position,
      type Node,
      type NodeProps,
   } from "@xyflow/svelte";
   import FlowchartShape from "./FlowchartShape.svelte";

   const {
      width = 170,
      height = 60,
      selected,
      data,
   }: NodeProps<
      Node<{
         type: string;
         strokeWidth: number;
         willConnect: boolean;
         stroke: string;
         fill: string;
      }>
   > = $props();
</script>

<NodeResizer isVisible={selected} keepAspectRatio={data.type == "circle"} />
<FlowchartShape
   {width}
   {height}
   type={data.type}
   stroke={data.stroke}
   strokeWidth={data.strokeWidth}
   fill={data.willConnect ? "#000000" : data.fill}
/>
<Handle
   class={selected || data.willConnect ? "visible" : "invisible"}
   id="1"
   position={Position.Left}
   type="source"
/>
<Handle
   class={selected || data.willConnect ? "visible" : "invisible"}
   id="2"
   position={Position.Right}
   type="source"
/>
<Handle
   class={selected || data.willConnect ? "visible" : "invisible"}
   id="3"
   position={Position.Top}
   type="source"
/>
<Handle
   class={selected || data.willConnect ? "visible" : "invisible"}
   id="4"
   position={Position.Bottom}
   type="source"
/>
