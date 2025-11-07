import BindingsiteTrack from "@/components/track_structural/1d_3d/BindingsiteTrack.vue";


export default {
  title: 'Tracks/Structural/BindingsiteTrack',
  component: BindingsiteTrack,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    height: {
      label: "Track height",
      description: "Height"
    },
    length: {
      label: "Track length",
      description: "Length"
    },
    displayStart: {
      label: "Display start",
      description: "Start"
    },
    displayEnd: {
      label: "Display end",
      description: "End"
    },
    marginColor: {
      label: "Margin color",
      description: "margin color"
    },
    displayLabels: {
      label: "Show labels",
      description: "labels"
    },
    highlightEvent: {
      label: "Highlight event",
      description: "highlightEvent"
    },
    highlightColor: {
      label: "Highlight event",
      description: "highlight color"
    },
    minWidth: {
      label: "Min width",
      description: "minWidth"
    },
    minHeight: {
      label: "Min height",
      description: "minHeight"
    },
    bindingSites: {
      control: 'object',
      description: 'Array with parameters start, end, color, label'
    }
  }
};

/**
 * Primary template with red background
 */
export const BindingSite = {
  args:{
    bindingSites:[
      { start: 80, end: 100, color: "red", label: "Binding Site A" },
      { start: 110, end: 100, color: "blue", label: "Binding Site B" }
    ],
    id:'Binding sites',
    height:18,
    length:770,
    displayStart:1,
    displayEnd:769,
    marginColor:"aliceblue",
    displayLabels: true,
    highlightEvent: "onclick", highlightColor: "#ffff00",
    minWidth:800,
    minHeight:10,
  }
};
