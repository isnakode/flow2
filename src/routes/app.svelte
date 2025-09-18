<script lang="ts">
  import ExportIcon from "$lib/assets/icons/export.svg";
  import Maximize from "$lib/assets/icons/maximize.svg";
  import SaveIcon from "$lib/assets/icons/save.svg";
  import ShapeIcon from "$lib/assets/icons/shape.svg";
  import ITextCenter from "$lib/assets/icons/text-center.svg";
  import ITextJustify from "$lib/assets/icons/text-justify.svg";
  import ITextLeft from "$lib/assets/icons/text-left.svg";
  import ITextRight from "$lib/assets/icons/text-right.svg";
  import ZoomIn from "$lib/assets/icons/ZoomIn.svg";
  import ZoomOut from "$lib/assets/icons/ZoomOut.svg";
  import FlowchartNode from "$lib/comp/FlowchartNode.svelte";
  import FlowchartShape from "$lib/comp/FlowchartShape.svelte";
  import {
    createShapeData,
    mergeObjects,
    nanoId,
    scaleToMax,
    templates,
    type Property,
    type ShapeData,
    type ShapeType,
  } from "$lib/types/ShapeType";
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
    type XYPosition,
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
  let clickTimer: number | null = null;
  let dragedShape: (typeof templates)[number] | null = $state(null);
  const addShape = (t: (typeof templates)[number], p: XYPosition) => {
    const position = screenToFlowPosition(p);
    const newNode: Node<ShapeData> = {
      id: nanoId(15),
      height: t.height,
      width: t.width,
      type: "flow",
      position,
      data: createShapeData(t.type as ShapeType),
    };
    node.set([...nodes, newNode]);
  };

  let property = $derived.by(() => {
    return mergeObjects(...selectedNodes.map(nodeToProperty));
  });
  function placeCaretAtEnd(el: HTMLElement) {
    if (!el) return;

    const range = document.createRange();
    const sel = window.getSelection();

    range.selectNodeContents(el);
    range.collapse(false); // false = ke akhir
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
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
    onnodeclick={async (e) => {
      const el = e.event.currentTarget as HTMLElement;
      const input = el.querySelector<HTMLElement>("[contenteditable]");

      const editable = el?.isContentEditable;
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
    connectionLineType={ConnectionLineType.SmoothStep}
    panOnDrag={[1, 2]}
    snapGrid={[10, 10]}
    {nodeTypes}
    bind:nodes
    bind:edges
    defaultEdgeOptions={{
      type: "smoothstep",
      label: "halo",
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
    <Panel
      position="center-left"
      class="bg-white rounded-md p-1 shadow-lg border border-gray-200 flex flex-col gap-1">
      {#each [ShapeIcon, ExportIcon, SaveIcon] as icon, i}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div tabindex="0" class="aspect-square cursor-pointer relative group">
          <p class="size-8 p-1.5 rounded hover:bg-blue-100">
            <img src={icon} alt="" />
          </p>
          {#if i == 0}
            <div
              class="bg-white rounded-md gap-1 p-1 shadow-lg border border-gray-200 group-focus-within:grid hidden grid-cols-[repeat(4,max-content)] absolute left-[120%] top-1/2 -translate-y-1/2">
              {#each templates as t (t.type)}
                {@const [width, height] = scaleToMax([t.width, t.height], 32)}
                <button
                  draggable="true"
                  ondragstart={(e) => {
                    dragedShape = t;
                  }}
                  ondragend={(e) => {
                    dragedShape = null;
                  }}
                  onclick={() => {
                    addShape(t, {
                      x: window.innerWidth / 2 - t.width,
                      y: window.innerHeight / 2 - t.height,
                    });
                  }}
                  class="flex justify-center items-center aspect-square p-0.5 bg-transparent rounded {dragedShape
                    ? ''
                    : 'hover:bg-blue-200'}">
                  <FlowchartShape
                    type={t.type}
                    {width}
                    {height}
                    strokeWidth={1}
                    stroke="#6B6B6B"
                    fill="#dbdbdb" />
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
      <button
        onclick={async () => await st.fitView()}
        class="aspect-square cursor-pointer relative group">
        <p class="size-8 p-1.5 rounded hover:bg-blue-100">
          <img src={Maximize} alt="" />
        </p>
      </button>
      <button
        onclick={async () => {
          await st.zoomIn();
        }}
        class="aspect-square cursor-pointer relative group">
        <p class="size-8 p-1.5 rounded hover:bg-blue-100">
          <img src={ZoomIn} alt="" />
        </p>
      </button>
      <button
        onclick={async () => await st.zoomOut()}
        class="aspect-square cursor-pointer relative group">
        <p class="size-8 p-1.5 rounded hover:bg-blue-100">
          <img src={ZoomOut} alt="" />
        </p>
      </button>
    </Panel>
    <Panel
      position="top-right"
      class="bg-white px-2 shadow-lg border w-52 border-gray-200 flex flex-col gap-1 m-0! h-dvh">
      <div class="flex gap-2">
        <div class="w-full">
          <label for="x-input" class="label text-xs">x</label>
          <input
            id="x-input"
            class="input input-sm"
            type="number"
            value={property.x}
            oninput={(e) => {
              nodes = nodes.map((n) => {
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
              });
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
              nodes = nodes.map((n) => {
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
              });
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
              nodes = nodes.map((n) => {
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
              });
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
              nodes = nodes.map((n) => {
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
              });
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
              nodes = nodes.map((n) => {
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
              });
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
              nodes = nodes.map((n) => {
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
              });
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
              nodes = nodes.map((n) => {
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
              });
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
              nodes = nodes.map((n) => {
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
              });
            }} />
        </div>
      </div>

      <label for="node-text-input" class="label text-xs"> Text </label>
      <textarea
        id="node-text-input"
        class="textarea textarea-sm text-left"
        oninput={(e) => {
          const text = e.currentTarget.value;
          nodes = nodes.map((n) => {
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
          });
        }}>{property.text}</textarea>
      <div class="flex gap-1 justify-center mt-1">
        {#each textAlignData as data}
          <button
            onclick={() => {
              nodes = nodes.map((n) => {
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
              });
            }}
            class="size-8 rounded-md p-1.5 cursor-pointer
                     {property.textAlign == data.align
              ? 'bg-blue-200'
              : 'hover:bg-blue-100'}">
            <img src={data.icon} alt={data.align} />
          </button>
        {/each}
      </div>
    </Panel>
  </SvelteFlow>
</div>
