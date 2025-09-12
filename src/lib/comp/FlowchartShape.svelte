<script>
   const {
      width,
      height,
      type,
      strokeWidth = 1,
      stroke = "#6B6B6B",
      fill = "#dbdbdb",
   } = $props();
</script>

<svg
   {width}
   {height}
   {fill}
   viewBox="-{strokeWidth / 2} -{strokeWidth / 2} 
   {width + strokeWidth} {height + strokeWidth}"
   stroke-width={strokeWidth}
   {stroke}
   stroke-linejoin="round"
>
   {#if type == "start"}
      {@const r = Math.min(height, width) / 2}
      <rect x="0" y="0" {width} {height} rx={r} ry={r} />
   {:else if type == "io"}
      {@const s = width * 0.1}
      <path d={`M ${s} 0L${width} 0L${width - s} ${height}L0 ${height}Z`} />
   {:else if type == "decision"}
      <path
         d="M0 {height / 2}L{width / 2} 0L{width} {height / 2} 
         L{width / 2} {height}Z"
      />
   {:else if type == "process"}
      <path d="M0 0H{width}V{height}H0Z" />
   {:else if type == "doc"}
      {@const waveHeight = height * 0.1}
      <path
         d="M0 0H {width}V{height - waveHeight}Q 
         {width - width / 2 / 2} {height + waveHeight} 
         {width - width / 2} {height - waveHeight}T0 {height - waveHeight}Z"
      />
   {:else if type == "multi-doc"}
      {@const waveHeight = height * 0.07}
      {@const wGap = width * 0.12}
      {@const hGap = height * 0.15}
      <path
         d="M0 {hGap}H{width - wGap}V{height - waveHeight}Q 
     {width * 0.75} {height + waveHeight} {width * 0.5} 
     {height - waveHeight}T0 {height - waveHeight}Z"
         transform="translate({wGap}, {-hGap})"
      />
      <path
         d="M0 {hGap}H {width - wGap}V {height - waveHeight}Q 
     {width * 0.75} {height + waveHeight} {width * 0.5} 
     {height - waveHeight}T0 {height - waveHeight}Z"
         transform="translate({wGap / 2}, {-hGap / 2})"
      />
      <path
         d="M0 {hGap}H{width - wGap}V{height - waveHeight}Q 
     {width * 0.75} {height + waveHeight} {width * 0.5} 
     {height - waveHeight}T0 {height - waveHeight}Z"
      />
   {:else if type == "prep"}
      {@const s = width * 0.15}
      <path
         d="M{s} 0L{width - s} 0L{width} {height / 2}L 
         {width - s} {height}L {s} {height}L0 {height / 2}Z"
      />
   {:else if type == "loop"}
      {@const s = width * 0.15}
      <path d=" M0 0L{width} 0L {width - s} {height}L{s} {height}Z" />
   {:else if type == "input"}
      {@const s = height * 0.3}
      <path d="M0 {s}L{width} 0L{width} {height}L0 {height}Z" />
   {:else if type == "stored-data"}
      {@const r = height / 2}
      <path
         d="M{r} {height}A{r} {r} 0 1 1 {r} 0H{width}
         Q{width - width * 0.3} {r} {width} {height}Z"
      />
   {:else if type == "loop-limit"}
      {@const bevel = width * 0.2}
      <path
         d="M{bevel} 0H{width - bevel}L{width} {bevel}V{height}H0V{bevel}Z"
      />
   {:else if type == "delay"}
      {@const r = height / 2}
      <path d="M0 0H{width - r}A{r} {r} 0 1 1 {width - r} {height}H0Z" />
   {:else if type == "display"}
      {@const r = height / 2}
      <path
         d="M0 {r}L{r * 0.8} 0H{width - r} A{r} {r} 0 1 1 
         {width - r} {height}H{r * 0.8}Z"
      />
   {:else if type == "off-page"}
      {@const r = height / 2}
      <path d="M0 {r}L{r * 0.8} 0H{width} V{height}H{r * 0.8}Z" />
   {:else if type == "direct-data"}
      {@const r = height / 2}
      {@const w = Math.min(width * 0.15, r * 0.7)}
      <path
         d="M{w} {height}A{Math.min(w, r)} {r} 0 1 1 {w} 0
         H{width - w}V{height}Z"
      />
      <ellipse cx={width - w} cy={r} rx={Math.min(w, r)} ry={r} />
   {:else if type == "internal-storage"}
      {@const gap = Math.min(width, height) * 0.2}
      <path d="M0 0H{width}V{height}H0Z" />
      <line x1={0} y1={gap} x2={width} y2={gap} />
      <line x1={gap} y1={0} x2={gap} y2={height} />
   {:else if type == "predefined-process"}
      {@const gap = width * 0.15}
      <path d="M0 0H{width}V{height}H0Z" />
      <line x1={gap} y1={0} x2={gap} y2={height} />
      <line x1={width - gap} y1={0} x2={width - gap} y2={height} />
   {:else if type == "circle"}
      {@const r = Math.min(height, width) / 2}
      <circle cx={r} cy={r} {r} />
   {:else if type == "merge"}
      <path d="M0 0H{width}L{width / 2} {height}Z" />
   {:else if type == "db"}
      {@const r = width / 2}
      {@const h = height * 0.15}
      <path
         d="M{width} {height - h}A{r} {h} 0 1 1 0 {height - h}V{h}H{width}Z"
      />
      <ellipse cx={r} cy={h} rx={r} ry={h} />
   {/if}
</svg>
