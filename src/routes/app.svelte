<script lang="ts">
  import ExportIcon from "$lib/assets/icons/export.svelte";
  import Maximize from "$lib/assets/icons/maximize.svelte";
  import ShapeIcon from "$lib/assets/icons/shape.svelte";
  import ZoomIn from "$lib/assets/icons/ZoomIn.svelte";
  import ZoomOut from "$lib/assets/icons/ZoomOut.svelte";
  import FlowchartNode from "$lib/comp/FlowchartNode.svelte";
  import FlowchartShape from "$lib/comp/FlowchartShape.svelte";
  import {
    createShapeData,
    nanoId,
    placeCaretAtEnd,
    scaleToMax,
    templates,
    type Property,
    type ShapeData,
    type ShapeType,
  } from "$lib/types/ShapeType";
  import "@xyflow/svelte/dist/style.css";
  import Lz from "lz-string";

  import { browser } from "$app/environment";
  import LabeledEdge from "$lib/comp/LabeledEdge.svelte";
  import { shortcut } from "@svelte-put/shortcut";
  import {
    Background,
    ConnectionLineType,
    ConnectionMode,
    getViewportForBounds,
    isNode,
    Panel,
    SvelteFlow,
    useEdges,
    useNodes,
    useOnSelectionChange,
    useStore,
    useSvelteFlow,
    type Edge,
    type EdgeTypes,
    type Node,
    type NodeTypes,
    type XYPosition,
  } from "@xyflow/svelte";
  import { toPng } from "html-to-image";
  import { onMount } from "svelte";
  import NodePropertyPanel from "./NodePropertyPanel.svelte";

  const nodeTypes: NodeTypes = {
    flow: FlowchartNode,
  };
  const edgeTypes: EdgeTypes = {
    label: LabeledEdge,
  };
  const node = useNodes();
  const edge = useEdges();
  const {
    screenToFlowPosition,
    updateNodeData,
    updateNode,
    setZoom,
    getNodesBounds,
  } = useSvelteFlow<Node<ShapeData>, Edge>();

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

  const nodeToProperty = (node: Node<ShapeData>): Property => ({
    ...node.position,
    ...node.data,
    id: node.id,
    width: node.width,
    height: node.height,
  });

  const getStorageData = (storageName: string) => {
    if (localStorage.getItem(storageName) != null) {
      return JSON.parse(Lz.decompress(localStorage.getItem(storageName)!));
    }
    return [];
  };
  let nodes: Node<ShapeData>[] = $state.raw(getStorageData("nodes"));
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

  let nodeIds = $state(new Set<string>());
  let edgeIds = $state(new Set<string>());
  let selectedEdges: Edge[] = $derived(edges.filter((n) => edgeIds.has(n.id)));
  let selectedNodes: Node<ShapeData>[] = $derived(
    nodes.filter((n) => nodeIds.has(n.id)),
  );

  useOnSelectionChange(({ nodes, edges }) => {
    nodeIds = new Set(nodes.map((s) => s.id));
    edgeIds = new Set(edges.map((s) => s.id));
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

  let clickTimer: number | null = null;
  let edgeTimer: number | null = null;
  let dragedShape: (typeof templates)[number] | null = $state(null);
  const addShape = (t: (typeof templates)[number], p: XYPosition) => {
    nodes = nodes.map((n) => ({ ...n, selected: false }));
    const position = screenToFlowPosition(p);
    const newNode: Node<ShapeData> = {
      id: nanoId(15),
      height: t.height,
      width: t.width,
      type: "flow",
      position,
      selected: true,
      data: createShapeData(t.type as ShapeType),
    };
    node.set([...nodes, newNode]);
  };

  const download = () => {
    const width = 2480;
    const height = 3508;
    const nodesBounds = getNodesBounds(nodes);
    const viewport = getViewportForBounds(
      nodesBounds,
      width,
      height,
      0.5,
      2.0,
      0.2,
    );

    const viewportDomNode = document.querySelector<HTMLElement>(
      ".svelte-flow__viewport",
    )!;

    if (viewport) {
      toPng(viewportDomNode, {
        backgroundColor: "white",
        width,
        height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      }).then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "svelte-flow.png";
        link.href = dataUrl;
        link.click();
      });
    }
  };
</script>

<svelte:window
  onkeydown={async (e) => {
    if (e.ctrlKey && e.key == "d") {
      e.preventDefault();
      copy();
      paste();
    }
    if (e.ctrlKey && e.key === "a") {
      const el = e.target as HTMLElement;
      const editable = el?.isContentEditable;
      const tag = el?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || editable) {
        return;
      }
      e.preventDefault();
      selectAll();
    }
    if (e.ctrlKey && e.key === "c") {
      const el = e.target as HTMLElement;
      const editable = el?.isContentEditable;
      const tag = el?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || editable) {
        return;
      }
      copy();
    }
  }}
  use:shortcut={{
    trigger: [
      {
        key: "v",
        modifier: ["ctrl"],
        callback: paste,
      },
    ],
  }} />

<div style:width="100vw" style:height="100vh">
  <SvelteFlow
    ondragover={(e) => e.preventDefault()}
    onlyRenderVisibleElements
    ondrop={(e) => {
      e.preventDefault();
      if (dragedShape) {
        addShape(dragedShape, {
          x: e.clientX,
          y: e.clientY,
        });
      }
    }}
    onedgeclick={(e) => {
      const input = document.querySelector<HTMLElement>(
        `#edge-label-input-${e.edge.id}`,
      );

      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        setTimeout(() => {
          if (input) {
            input.focus();
            placeCaretAtEnd(input);
          }
        });
      } else {
        clickTimer = setTimeout(() => (clickTimer = null), 300);
      }
    }}
    onnodeclick={async (e) => {
      console.log(document.activeElement);

      const input = document.querySelector<HTMLElement>(
        `#node-label-input-${e.node.id}`,
      );

      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        setTimeout(() => {
          if (input) {
            input.focus();
            placeCaretAtEnd(input);
          }
        });
      } else {
        clickTimer = setTimeout(() => (clickTimer = null), 300);
      }
    }}
    onclick={(e) => {
      const el = e.target as HTMLElement;
      const editable = el?.isContentEditable;
      const tag = el?.tagName.toLowerCase();

      if (tag === "input" || tag === "textarea" || editable) {
        return;
      }
      window.getSelection()?.removeAllRanges();
    }}
    multiSelectionKey={["Shift", "Control"]}
    elevateNodesOnSelect={true}
    deleteKey={["Delete", "Backspace"]}
    connectionLineType={ConnectionLineType.Bezier}
    panOnDrag={[1, 2]}
    snapGrid={[10, 10]}
    {nodeTypes}
    {edgeTypes}
    bind:nodes
    bind:edges
    defaultEdgeOptions={{
      type: "label",
      label: "",
      data: { type: "smooth" },
      markerEnd: { type: "arrowclosed" },
    }}
    {onmousemove}
    onconnectstart={() => (isDragging = true)}
    onconnectend={() => {
      isDragging = false;
      for (const id of hoveredIds) {
        updateNodeData(id, { willConnect: false });
      }
    }}
    connectionMode={ConnectionMode.Loose}>
    <Background bgColor="#232323" />
    <Panel
      position="top-left"
      class="bg-zinc-900 w-52 flex *:hover:bg-zinc-700 *:px-2  m-0! text-white">
      <button>File</button>
      <button>Edit</button>
    </Panel>
    <Panel
      position="center-left"
      class="bg-zinc-900 rounded-md p-1 shadow-lg border flex flex-col gap-1">
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div tabindex="0" class="aspect-square cursor-pointer relative group">
        <p class="size-8 p-1.5 rounded hover:bg-zinc-700 text-white">
          <ShapeIcon class="size-5" />
        </p>
        <div
          class="bg-zinc-900 rounded-md gap-1 p-1 shadow-lg group-focus-within:grid hidden grid-cols-[repeat(4,max-content)] absolute left-[120%] top-1/2 -translate-y-1/2">
          {#each templates as t (t.type)}
            {@const [width, height] = scaleToMax([t.width, t.height], 32)}
            <button
              draggable="true"
              ondragstart={() => {
                dragedShape = t;
              }}
              ondragend={() => {
                dragedShape = null;
              }}
              onclick={() => {
                addShape(t, {
                  x: window.innerWidth / 2 - t.width,
                  y: window.innerHeight / 2 - t.height,
                });
              }}
              class="flex justify-center cursor-pointer items-center aspect-square p-0.5 bg-transparent rounded {dragedShape
                ? ''
                : 'hover:bg-zinc-600'}">
              <FlowchartShape
                type={t.type}
                {width}
                {height}
                strokeWidth={1}
                stroke="#A5A5A5"
                fill="#515156" />
            </button>
          {/each}
        </div>
      </div>
      <button
        onclick={async () => await st.fitView()}
        class="aspect-square cursor-pointer p-1.5 rounded hover:bg-zinc-700 text-gray-200">
        <Maximize class="size-5" />
      </button>
      <button
        onclick={download}
        class="aspect-square cursor-pointer p-1.5 rounded hover:bg-zinc-700 text-gray-200">
        <ExportIcon class="size-5" />
      </button>
      <button
        onclick={async () => await st.zoomIn()}
        class="aspect-square cursor-pointer p-1.5 rounded hover:bg-zinc-700 text-gray-200">
        <ZoomIn class="size-5" />
      </button>
      <button
        onclick={async () => await st.zoomOut()}
        class="aspect-square cursor-pointer p-1.5 rounded hover:bg-zinc-700 text-gray-200">
        <ZoomOut class="size-5" />
      </button>
    </Panel>
    <NodePropertyPanel properties={selectedNodes.map(nodeToProperty)} />
  </SvelteFlow>
</div>
