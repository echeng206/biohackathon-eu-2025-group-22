<script setup>
    import StructureViewer from "@/components/track_structural/1d_3d/StructureViewer.vue";
</script>

<template>
    <div class="flex-container">
        <div class="left-side flex-item">
            LEFT
        </div>
        <div class="right-side flex-item">
            RIGHT
            <StructureViewer moleculeId="6MXX" width="200" bgColor="#ffffff"/>
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
    }
    
    .left-side {
        background-color: beige;
    }
    
    .right-side {
        background-color: antiquewhite;
    }
</style>
