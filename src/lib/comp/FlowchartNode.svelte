<script lang="ts">
   import type { ShapeData } from "$lib/types/ShapeType";
   import {
      Handle,
      NodeResizer,
      Position,
      useSvelteFlow,
      type Node,
      type NodeProps,
   } from "@xyflow/svelte";
   import FlowchartShape from "./FlowchartShape.svelte";

   const { width, height, data, ...p }: NodeProps<Node<ShapeData>> = $props();
   const { updateNodeData } = useSvelteFlow<Node<ShapeData>>();
   let el: HTMLElement | undefined = $state();
   $effect(() => {
      if (el && el.innerText !== data.text) {
         el.innerText = data.text;
      }
   });
   let activeElement: HTMLElement | null = $state(null);
</script>

<svelte:document bind:activeElement />

<NodeResizer isVisible={p.selected} keepAspectRatio={data.type == "circle"} />
<div
   id="node-label-input-{p.id}"
   bind:this={el}
   oninput={(e) => {
      let text = e.currentTarget.innerText;
      if (text == "\n") text = text.replace("\n", "");
      updateNodeData(p.id, { text });
   }}
   role="textbox"
   tabindex="0"
   contenteditable
   style="max-width:{width}px;
   font-size:{data.fontSize}px;
   text-align:{data.textAlign};"
   class="{activeElement == el
      ? 'nodrag nopan'
      : ''} w-max outline-none absolute absolute-center">
</div>
<FlowchartShape
   {width}
   {height}
   type={data.type}
   stroke={data.stroke}
   strokeWidth={data.strokeWidth}
   fill={data.fill} />
<Handle
   class={p.selected || data.willConnect ? "visible" : "invisible"}
   id="1"
   position={Position.Left}
   type="source" />
<Handle
   class={p.selected || data.willConnect ? "visible" : "invisible"}
   id="2"
   position={Position.Right}
   type="source" />
<Handle
   class={p.selected || data.willConnect ? "visible" : "invisible"}
   id="3"
   position={Position.Top}
   type="source" />
<Handle
   class={p.selected || data.willConnect ? "visible" : "invisible"}
   id="4"
   position={Position.Bottom}
   type="source" />
