<script setup>
    import StructureViewer from "@/components/track_structural/1d_3d/StructureViewer.vue";
    
    const props = defineProps({
        moleculeId: { type: String, required: true, default: '1CBS' }
    });
</script>

<template>
    <div>
        1D left · 3D right. Click in 1D to select; Scop3P overlay is toggleable. PDB highlights auto-clamped to mapped ranges.
    </div>
    <div class="flex-container">
        <div class="left-side flex-item">
        </div>
        <div class="right-side flex-item">
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
