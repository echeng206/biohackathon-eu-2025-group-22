<template>
  <div class="molstar-wrapper">
    <div ref="container" class="molstar-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { Viewer } from 'molstar/lib/apps/viewer/app';
import { MVSData } from 'molstar/lib/extensions/mvs/mvs-data';

import 'molstar/build/viewer/molstar.css';

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
 *  - viewerOptions (optional): forwarded to Viewer.create
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

/* ------------------------------ Viewer & MVS ------------------------------ */

const container = ref(null);
let viewer = null;
let destroyed = false;

async function initViewerOnce() {
  if (viewer || destroyed) return;

  // Create the Viewer using your installed package
  viewer = await Viewer.create(container.value, { ...props.viewerOptions });

  // First load
  await buildAndLoadView(
    props.url,
    props.format,
    props.representation,
    props.defaultColor,
    props.colorByResidue
  );
}

/**
 * Parse keys like "A:42" or "auth:B:100" into an MVS selector object.
 * Returns null if the key is not understood.
 */
function parseResidueKey(key) {
  if (key.startsWith("auth:")) {
    const parts = key.split(":"); // ["auth", chain, seqId] or ["auth", chain, seqId, ins]
    if (parts.length === 3 || parts.length === 4) {
      const [, chain, seq, ins] = parts;
      const n = Number(seq);
      if (Number.isFinite(n)) {
        const sel = { auth_asym_id: chain, auth_seq_id: n };
        if (parts.length === 4) sel.pdbx_PDB_ins_code = ins;
        return sel;
      }
    }
    return null;
  }
  const parts = key.split(":");
  if (parts.length === 2) {
    const [chain, seq] = parts;
    const n = Number(seq);
    if (Number.isFinite(n)) return { label_asym_id: chain, label_seq_id: n };
  }
  return null;
}

/**
 * Build the MVS view (Method 2) and load it into the existing viewer.
 * Uses the extension’s `loadMVS` to avoid encode/decode.
 */
async function buildAndLoadView(structureUrl, format, representation, defaultColor, colorByResidue) {
  if (!viewer || !structureUrl) return;

  try {
    const builder = MVSData.createBuilder();

    const structure = builder
      .download({ url: structureUrl })
      .parse({ format }) // 'bcif' | 'mmcif' | 'cif' | 'pdb'
      .modelStructure({});

    // Polymer representation
    const rep = structure
      .component({ selector: "polymer" })
      .representation({ type: representation });

    // Default color for polymer
    rep.color({ color: defaultColor, selector: "polymer" });

    // Per-residue overrides
    if (colorByResidue && typeof colorByResidue === "object") {
      for (const [key, color] of Object.entries(colorByResidue)) {
        const selector = parseResidueKey(key);
        if (!selector) {
          console.warn("[MolstarVue] Skipping invalid residue key:", key);
          continue;
        }
        rep.color({ color, selector });
      }
    }

    const mvsData = builder.getState();
    await viewer.loadMvsData(mvsData, "mvsj", true)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[MolstarVue] Failed to build/load MVS view (npm):", err);
  }
}

/* ---------------------------- Lifecycle & watch --------------------------- */
onMounted(async () => {
  try {
    await initViewerOnce();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[MolstarVue] init error:", e);
  }
});

watch(
  () => [props.url, props.format, props.representation, props.defaultColor, props.colorByResidue],
  async ([newUrl, newFmt, newRep, newDefault, newMap], [oldUrl, oldFmt, oldRep, oldDefault, oldMap]) => {
    if (!viewer) return;
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
