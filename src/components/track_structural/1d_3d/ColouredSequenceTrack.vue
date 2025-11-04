<script setup>
    import { computed, ref, watchEffect } from 'vue';
    import '@nightingale-elements/nightingale-colored-sequence';  // Import defines the custom element
    
    const props = defineProps({
        sequence: { type: String, required: true },
        height: { type: Number, default: 40 },
        scale: { type: String, default: "hydrophobicity-scale" }
    });

    const navEl = ref(null);

    const height = computed(() => props.height ?? 40);
    const scale = computed(() => props.scale ?? "hydrophobicity-scale");
    const sequenceLength = computed(() => (props.sequence ? props.sequence.length : 0));
    const displayStart = 1; // inclusive start
    const displayEnd = computed(() => Math.max(1, sequenceLength.value)); // inclusive end
    
    watchEffect(() => {
        const el = navEl.value;
        if (!el) return;

        // Set DOM **properties** (not attributes) so the custom element reacts.
        el.length = sequenceLength.value;
        el.displayStart = displayStart;
        el.displayEnd = displayEnd.value;
        el.height = height.value;
        el.scale = scale.value
    });
</script>

<template>
    <nightingale-colored-sequence 
        id="colored-sequence"
        min-width="400" 
        margin-color="white" 
    ></nightingale-colored-sequence>
</template>

<style scoped></style>
