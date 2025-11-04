<script setup>
    import StructureViewer from "./StructureViewer.vue";
    import SequenceNavigation from "./SequenceNavigation.vue";
    import LinearTracksManager from "./LinearTracksManager.vue";
    import SequenceTrack from "./SequenceTrack.vue";
    
    const props = defineProps({
        moleculeId: { type: String, required: true, default: '1CBS' },
        sequence: { type: String, required: true, default: 'SEQUENCE' }
    });
</script>

<template>
    <div>
        1D left · 3D right. Click in 1D to select; Scop3P overlay is toggleable. PDB highlights auto-clamped to mapped ranges.
    </div>
    <div class="grid">
        <div class="left">
            <LinearTracksManager>
                <tr>
                    <td></td>
                    <td>
                        <SequenceNavigation :sequence="sequence" height="40" />
                    </td>
                </tr>
                <tr>
                    <td>Sequence</td>
                    <td>
                        <SequenceTrack :sequence="sequence" height="40"/>
                    </td>
                </tr>
            </LinearTracksManager>
        </div>
        <div class="right">
            <StructureViewer 
                :moleculeId="moleculeId" 
                hideControls="true"
                bg-color-r="255" 
                bg-color-g="255" 
                bg-color-b="255"
            />
        </div>
    </div>
</template>

<style scoped>
    :root { --panel-height: 560px; }
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px; align-items: stretch; }
    .left, .right { height: var(--panel-height); min-height: var(--panel-height); padding: 2em; }
    .left { overflow: auto; border-right: 1px solid #e5e7eb; padding-right: 8px; }
    .right { display: flex; flex-direction: column; }
    .panel { flex: 1 1 auto; display: flex; flex-direction: column; gap: 8px; }
    .controls { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    label { font-size: 0.9rem; color: #374151; }
    .hint { color: #374151; font-size: 0.9rem; padding: 0 16px; }
    .warn { color: #b45309; font-size: 0.85rem; padding: 4px 16px 0; }
    table { border-collapse: collapse; width: 100%; }
    td { padding: 5px; }
    td:first-child { background-color: lightcyan; font: 0.8em sans-serif; white-space: nowrap; }
    td:nth-child(2) { background-color: aliceblue; }
    tr:nth-child(-n + 3) > td { background-color: transparent; }
    nightingale-structure { display: block; width: 100%; height: 100%; border: 1px solid #e5e7eb; border-radius: 8px; }
    .legend { font-size: 12px; color: #374151; margin: 6px 0; }
    
    .flex-container {
        width: 100%;
        display: flex;
        min-height: 300px;
    }

    .flex-item {
        flex-grow: 1;
        flex-shrink: 1;
        width: calc(100% / 2);
        padding: 1em;
    }
    
    .left-side {
        background-color: beige;
    }
    
    .right-side {
        background-color: antiquewhite;
    }
</style>
