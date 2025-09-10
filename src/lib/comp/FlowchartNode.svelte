<script lang="ts">
   import { NodeResizer, type NodeProps } from "@xyflow/svelte";

   const {
      width = 170,
      height = 60,
      selected,
      data,
      ...prop
   }: NodeProps = $props();
</script>

<NodeResizer isVisible={selected} />

{#if data.type == "start"}
   {@const r = Math.min(height, width) / 2}
   <svg {width} {height} viewBox={`0 0 ${width} ${height}`} fill="#5e6ecf">
      <rect x="0" y="0" {width} {height} rx={r} ry={r} fill="#5e6ecf" />
   </svg>
{:else if data.type == "io"}
   {@const s = width * 0.1}
   <svg {width} {height} viewBox={`0 0 ${width} ${height}`} fill="#5e6ecf">
      <path
         d={`M ${s} 0 L ${width} 0 L ${width - s} ${height} L 0 ${height} Z`}
      />
   </svg>
{:else if data.type == "decision"}
   <svg {width} {height} viewBox={`0 0 ${width} ${height}`} fill="#5e6ecf">
      <path
         d="M 0 {height / 2} L {width / 2} 0 L {width}
      {height / 2} L {width / 2}
      {height} Z"
      />
   </svg>
{:else if data.type == "process"}
   <svg {width} {height} viewBox={`0 0 ${width} ${height}`} fill="#5e6ecf">
      <path d="M0 0 H{width} V{height} H0 Z" />
   </svg>
{:else if data.type == "doc"}
   {@const waveHeight = height * 0.1}
   <svg {width} {height} viewBox={`0 0 ${width} ${height}`} fill="#5e6ecf">
      <path
         d="M 0 0H {width}V {height - waveHeight}Q 
         {width - width / 2 / 2} {height + waveHeight} 
         {width - width / 2} {height - waveHeight}T 0 {height - waveHeight}Z"
      />
   </svg>
{:else if data.type == "multi-doc"}
   {@const waveHeight = height * 0.1}
   {@const gap = Math.max(Math.min(width, height) * 0.05, 10)}
   <!-- misal 5% dari tinggi -->

   <svg
      {width}
      {height}
      viewBox={`0 0 ${width} ${height}`}
      fill="#5e6ecf"
      class="stroke-1 stroke-white"
   >
      <defs>
         <path
            id="doc-shape"
            d="
        M 0 {gap}
        H {width - gap}
        V {height - waveHeight}
        Q {width * 0.75} {height + waveHeight} {width * 0.5} {height -
               waveHeight}
        T 0 {height - waveHeight}
        Z
      "
         />
      </defs>
      <use x={gap} y={-gap} href="#doc-shape" />
      <use x={gap / 2} y={-gap / 2} href="#doc-shape" />
      <use href="#doc-shape" />
   </svg>
{:else if data.type == "prep"}
   {@const s = width * 0.15}
   <svg {width} {height} viewBox={`0 0 ${width} ${height}`} fill="#5e6ecf">
      <path
         d="M {s} 0L {width - s} 0L {width} {height / 2}L 
         {width - s} {height}L {s} {height}L 0 {height / 2}Z"
      />
   </svg>
{:else if data.type == "loop"}
   {@const s = width * 0.15}
   <svg {width} {height} viewBox={`0 0 ${width} ${height}`} fill="#5e6ecf">
      <path d=" M0 0 L {width} 0 L {width - s} {height} L {s} {height} Z" />
   </svg>
{:else if data.type == "input"}
   {@const s = height * 0.3}
   <svg {width} {height} viewBox={`0 0 ${width} ${height}`} fill="#5e6ecf">
      <path d="M 0 {s} L {width} 0 L {width} {height}L 0 {height}Z" />
   </svg>
{:else if data.type == "stored-data"}
   {@const r = height / 2}
   <svg {width} {height} viewBox={`0 0 ${width} ${height}`} fill="#5e6ecf">
      <path
         d="M{r} {height}A{r} {r} 0 1 1 {r} 0H{width}
         Q{width - width * 0.3} {r} {width} {height}Z"
      />
   </svg>
{:else if data.type == "loop-limit"}
   {@const bevel = width * 0.2}
   <svg {width} {height} viewBox={`0 0 ${width} ${height}`} fill="#5e6ecf">
      <path
         d="M{bevel} 0H{width - bevel}L{width} {bevel}V{height}H0 V{bevel}Z"
      />
   </svg>
{:else if data.type == "delay"}
   {@const r = height / 2}
   <svg {width} {height} viewBox={`0 0 ${width} ${height}`} fill="#5e6ecf">
      <path d="M0 0H{width - r} A{r} {r} 0 1 1 {width - r} {height} H0Z" />
   </svg>
{:else if data.type == "display"}
   {@const r = height / 2}
   <svg {width} {height} viewBox={`0 0 ${width} ${height}`} fill="#5e6ecf">
      <path
         d="M0 {r}L{r * 0.8} 0H{width - r} A{r} {r} 0 1 1 
         {width - r} {height} H{r * 0.8}Z"
      />
   </svg>
{:else if data.type == "off-page"}
   {@const r = height / 2}
   <svg {width} {height} viewBox={`0 0 ${width} ${height}`} fill="#5e6ecf">
      <path d="M0 {r}L{r * 0.8} 0H{width} V{height}H{r * 0.8}Z" />
   </svg>
{/if}
