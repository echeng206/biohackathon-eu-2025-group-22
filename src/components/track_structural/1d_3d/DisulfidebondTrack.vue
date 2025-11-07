<script setup>
    import { ref, onMounted } from 'vue';
    import '@nightingale-elements/nightingale-track';  // Import defines the custom element
    
    const props = defineProps({
        id: { type: String, required: false, default: 'Disulfide Bonds' },
        minWidth: { type: Number, required: false, default: 800 },
        height: { type: Number, required: false, default: 15 },
        length: { type: Number, required: false, default: 1114 },
        displayStart: { type: Number, required: false, default: 1.0000000000000004 },
        displayEnd: { type: Number, required: false, default: 1113.3285730609223 },
        marginColor: { type: String, required: false, default: 'aliceblue' },
        highlightEvent: { type: String, required: false, default: 'onclick' },
        highlightColor: { type: String, required: false, default: '#FFEB3B66' },
        minHeight: { type: Number, required: false, default: 10 },
        highlight: { type: String, required: false, default: '' },
        disulfideBonds: {
          type: Array,
          default: ()=> [],
          required: false
        }
    });

    const disulfidebondsEl = ref(null);  
    onMounted(() => {
        if (disulfidebondsEl.value) 
          disulfidebondsEl.value.data = props.disulfideBonds.map(d => ({
            start: d.start,
            end: d.end,
            color: d.color || "blue",
            label: d.label || "label",
          }));
    });
</script>

<template>
    <nightingale-track
      ref="disulfidebondsEl"
      :id="props.id"
      :height="props.height"
      :length="props.length"
      :display-start="props.displayStart"
      :display-end="props.displayEnd"
      :margin-color="props.marginColor"
      :highlight-event="props.highlightEvent"
      :highlight-color="props.highlightColor"
      :min-width="props.minWidth"
      :min-height="props.minHeight"
      :highlight="props.highlight"

    />
</template>

<style scoped></style>
