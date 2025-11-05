<template>
  <div class="molstar-wrapper">
    <div ref="container" class="molstar-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

/**
 * Props:
 *  - url (required): URL of the structure file (e.g. bcif/mmcif/pdb/gz)
 *  - format (optional): explicit format, defaults to 'bcif'
 *  - representation (optional): visual representation type ('cartoon', 'backbone', 'ball_and_stick', 'line', 'spacefill', 'carbohydrate', 'surface')
 *  - viewerOptions (optional): forwarded to molstar.Viewer.create
 */
const props = defineProps({
  url: { type: String, required: true },
  format: { type: String, default: "bcif" },
  representation: {
    type: String,
    default: "cartoon",
    validator: (value) =>
      [
        "cartoon",
        "backbone",
        "ball_and_stick",
        "line",
        "spacefill",
        "carbohydrate",
        "surface",
      ].includes(value),
  },
  viewerOptions: {
    type: Object,
    default: () => ({
      layoutIsExpanded: false,
      layoutShowControls: false,
    }),
  },
});

/* ------------ Utilities: safe, idempotent loader for Mol* CDN ------------- */

let molstarReadyPromise;

function ensureMolstarLoaded() {
  if (window.molstar) return Promise.resolve(window.molstar);

  if (!molstarReadyPromise) {
    molstarReadyPromise = new Promise((resolve, reject) => {
      const cssHref = "https://cdn.jsdelivr.net/npm/molstar@latest/build/viewer/molstar.css";
      const jsSrc = "https://cdn.jsdelivr.net/npm/molstar@latest/build/viewer/molstar.js";

      const cssId = "molstar-cdn-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = cssHref;
        document.head.appendChild(link);
      }

      const jsId = "molstar-cdn-js";
      if (document.getElementById(jsId)) {
        waitForMolstar(resolve, reject);
        return;
      }

      const script = document.createElement("script");
      script.id = jsId;
      script.src = jsSrc;
      script.async = true;
      script.onload = () => waitForMolstar(resolve, reject);
      script.onerror = (e) => reject(new Error(`Failed to load Mol* from CDN: ${e?.message || e}`));
      document.head.appendChild(script);
    });
  }
  return molstarReadyPromise;
}

function waitForMolstar(resolve, reject) {
  const start = Date.now();
  const timeoutMs = 8000;
  const t = setInterval(() => {
    if (window.molstar?.Viewer && window.molstar?.PluginExtensions?.mvs) {
      clearInterval(t);
      resolve(window.molstar);
    } else if (Date.now() - start > timeoutMs) {
      clearInterval(t);
      reject(new Error("Mol* global not initialized in time."));
    }
  }, 50);
}

/* ------------------------------ Viewer state ------------------------------ */

const container = ref(null);
let viewer = null;
let destroyed = false;

async function initViewerOnce() {
  if (viewer || destroyed) return;
  const molstar = await ensureMolstarLoaded();

  viewer = await molstar.Viewer.create(container.value, {
    ...props.viewerOptions,
  });

  await buildAndLoadView(props.url, props.format, props.representation);
}

/**
 * Build and load MVS view with a configurable representation.
 */
async function buildAndLoadView(structureUrl, format, representation) {
  if (!viewer || !structureUrl) return;

  const molstar = window.molstar;
  const { PluginExtensions } = molstar;
  const { mvs } = PluginExtensions;

  try {
    const builder = mvs.MVSData.createBuilder();

    const structure = builder
      .download({ url: structureUrl })
      .parse({ format })
      .modelStructure({});

    // polymer with dynamic representation
    structure
      .component({ selector: "polymer" })
      .representation({ type: representation })
      .color({ color: "green" });

    const mvsData = builder.getState();

    await mvs.loadMVS(viewer.plugin, mvsData, {
      sourceUrl: structureUrl,
      sanityChecks: true,
      replaceExisting: true,
    });

    console.info("[MolstarVue] Loaded structure:", {
      url: structureUrl,
      format,
      representation,
    });
  } catch (err) {
    console.error("[MolstarVue] Failed to build/load MVS view:", err);
  }
}

/* ---------------------------- Lifecycle & watch --------------------------- */

onMounted(async () => {
  try {
    await initViewerOnce();
  } catch (e) {
    console.error("[MolstarVue] init error:", e);
  }
});

watch(
  () => [props.url, props.format, props.representation],
  async ([newUrl, newFmt, newRep], [oldUrl, oldFmt, oldRep]) => {
    if (!viewer) return;
    if (
      !newUrl ||
      (newUrl === oldUrl && newFmt === oldFmt && newRep === oldRep)
    )
      return;
    await buildAndLoadView(newUrl, newFmt, newRep);
  }
);

onBeforeUnmount(() => {
  destroyed = true;
  try {
    if (viewer?.plugin?.dispose) viewer.plugin.dispose();
    if (viewer?.dispose) viewer.dispose();
  } catch (e) {
    /* noop */
  }
  viewer = null;
});
</script>

<style scoped>
.molstar-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
}
.molstar-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
