<script setup>
    import { ref, onMounted } from 'vue';
    import '@nightingale-elements/nightingale-track';  // Import defines the custom element
    
    const props = defineProps({
        height: { type: Number, required: false },
	      length: { type: Number, required: false },
	      displayStart: { type: Number, required: false },
	      displayEnd: { type: Number, required: false },
	      marginColor: { type: String, required: false },
        displayLabels: { type: Boolean, default: false },
        highlightEvent: { type: String, required: false },
        highlightColor: { type: String, required: false },
        minWidth: { type: Number, required: false },
        minHeight: { type: Number, required: false },
        domains: {
          type: Array,
          default: ()=> [],
          required: false
        }
    });

    const trackEl = ref(null);  
    onMounted(() => {
        if (trackEl.value) {
            console.log("Domain track mounted", trackEl.value);
          trackEl.value.data = props.domains.map(d => ({
            start: d.start,
            end: d.end,
            color: d.color || "blue",
            label: d.label || "LABEL",
          }));
	}
    });
</script>

<template>
    <nightingale-track
        ref="trackEl"
        v-bind:id="props.id"
        v-bind:height="props.height"
        v-bind:length="props.length"
        v-bind:display-start="props.displayStart"
        v-bind:display-end="props.displayEnd"
        v-bind:margin-color="props.marginColor"
        v-bind:display-labels="props.displayLabels"
        v-bind:highlight-event="props.highlightEvent"
        v-bind:highlight-color="props.highlightColor"
        v-bind:min-width="props.minWidth"
        v-bind:min-height="props.minHeight"

    />
</template>

<style scoped></style>
