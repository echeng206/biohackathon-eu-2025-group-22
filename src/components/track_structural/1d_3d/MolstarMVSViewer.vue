<template>
  <div class="molstar-wrapper">
    <div ref="container" class="molstar-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

/**
 * Props:
 *  - url (required): structure URL
 *  - format (optional): 'bcif' | 'mmcif' | 'cif' | 'pdb'
 *  - representation (optional): 'cartoon' | 'backbone' | 'ball_and_stick' | 'line' | 'spacefill' | 'carbohydrate' | 'surface'
 *  - defaultColor (optional): X11 name or hex (applied to whole polymer first)
 *  - colorByResidue (optional): object mapping residue selectors to colors.
 *      Supported key formats:
 *        "A:42"         -> { label_asym_id: "A", label_seq_id: 42 }
 *        "auth:B:100"   -> { auth_asym_id: "B", auth_seq_id: 100 }
 *  - viewerOptions (optional): forwarded to molstar.Viewer.create
 */
const props = defineProps({
  url: { type: String, required: true },
  format: { type: String, default: "bcif" },
  representation: {
    type: String,
    default: "cartoon",
    validator: (v) =>
      [
        "cartoon",
        "backbone",
        "ball_and_stick",
        "line",
        "spacefill",
        "carbohydrate",
        "surface",
      ].includes(v),
  },
  defaultColor: { type: String, default: "green" },
  colorByResidue: { type: Object, default: () => ({}) },
  viewerOptions: {
    type: Object,
    default: () => ({
      layoutIsExpanded: false,
      layoutShowControls: false,
    }),
  },
});

/* ------------ Mol* loader (CDN) ------------- */
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
  viewer = await molstar.Viewer.create(container.value, { ...props.viewerOptions });
  await buildAndLoadView(props.url, props.format, props.representation, props.defaultColor, props.colorByResidue);
}

/**
 * Parse keys like "A:42" or "auth:B:100" into an MVS selector object.
 * Returns null if the key is not understood.
 */
function parseResidueKey(key) {
  // "auth:B:100" => auth chain+res
  if (key.startsWith("auth:")) {
    const parts = key.split(":"); // ["auth", chain, seqId]
    if (parts.length === 3) {
      const [, chain, seq] = parts;
      const n = Number(seq);
      if (Number.isFinite(n)) return { auth_asym_id: chain, auth_seq_id: n };
    }
    if (parts.length === 4) {
      // allow "auth:B:100:insCode"
      const [, chain, seq, ins] = parts;
      const n = Number(seq);
      if (Number.isFinite(n)) return { auth_asym_id: chain, auth_seq_id: n, pdbx_PDB_ins_code: ins };
    }
    return null;
  }
  // "A:42" => label chain+res
  const parts = key.split(":");
  if (parts.length === 2) {
    const [chain, seq] = parts;
    const n = Number(seq);
    if (Number.isFinite(n)) return { label_asym_id: chain, label_seq_id: n };
  }
  return null;
}

/**
 * Build the MVS view and load it, including default color and per-residue overrides.
 */
async function buildAndLoadView(structureUrl, format, representation, defaultColor, colorByResidue) {
  if (!viewer || !structureUrl) return;

  const molstar = window.molstar;
  const { mvs } = molstar.PluginExtensions;

  try {
    const builder = mvs.MVSData.createBuilder();

    const structure = builder
      .download({ url: structureUrl })
      .parse({ format })
      .modelStructure({});

    // Build a polymer representation with the chosen type
    const rep = structure
      .component({ selector: "polymer" })
      .representation({ type: representation });

    // 1) Default color for the whole polymer
    rep.color({ color: defaultColor, selector: "polymer" }); // applies to all polymer residues

    // 2) Per-residue overrides
    if (colorByResidue && typeof colorByResidue === "object") {
      for (const [key, color] of Object.entries(colorByResidue)) {
        const selector = parseResidueKey(key);
        if (!selector) {
          console.warn("[MolstarVue] Skipping invalid residue key:", key);
          continue;
        }
        rep.color({ color, selector }); // target the specific residue
      }
    }

    const mvsData = builder.getState();
    await mvs.loadMVS(viewer.plugin, mvsData, {
      sourceUrl: structureUrl,
      sanityChecks: true,
      replaceExisting: true,
    });

    console.info("[MolstarVue] Loaded structure w/ colors:", {
      url: structureUrl,
      format,
      representation,
      defaultColor,
      nOverrides: colorByResidue ? Object.keys(colorByResidue).length : 0,
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

// Rebuild when any relevant input changes
watch(
  () => [props.url, props.format, props.representation, props.defaultColor, props.colorByResidue],
  async ([newUrl, newFmt, newRep, newDefault, newMap], [oldUrl, oldFmt, oldRep, oldDefault, oldMap]) => {
    if (!viewer) return;
    // shallow change detection for colorByResidue: always rebuild on reference change
    const same =
      newUrl === oldUrl &&
      newFmt === oldFmt &&
      newRep === oldRep &&
      newDefault === oldDefault &&
      newMap === oldMap;
    if (!newUrl || same) return;

    await buildAndLoadView(newUrl, newFmt, newRep, newDefault, newMap);
  }
);

onBeforeUnmount(() => {
  destroyed = true;
  try {
    if (viewer?.plugin?.dispose) viewer.plugin.dispose();
    if (viewer?.dispose) viewer.dispose();
  } catch {
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
