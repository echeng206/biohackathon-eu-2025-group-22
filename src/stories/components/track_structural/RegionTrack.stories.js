import RegionTrack from "@/components/track_structural/1d_3d/RegionTrack.vue";


export default {
  title: 'Tracks/Structural/RegionTrack',
  component: RegionTrack,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    id: { control: 'text', description: 'Element ID' },
    minWidth: { control: 'number', description: 'Minimum width' },
    height: { control: 'number', description: 'Track height' },
    length: { control: 'number', description: 'Track length' },
    displayStart: { control: 'number', description: 'Display start coordinate' },
    displayEnd: { control: 'number', description: 'Display end coordinate' },
    marginColor: { control: 'color', description: 'Margin background color' },
    highlightEvent: { control: 'text', description: 'Event that triggers highlight (e.g. click)' },
    highlightColor: { control: 'color', description: 'Highlight color' },
    minHeight: { control: 'number', description: 'Minimum height' },
    highlight: { control: 'text', description: 'Current highlight label or ID' },
    regions: {
      control: 'object',
      description: 'Array with parameters start, end, color, label'
    }
  },
};

/**
 * Primary template with red background
 */
export const Region = {
  args:{
    regions:[
      { start: 1, end: 100, color: "red", label: "Region A" },
      { start: 200, end: 900, color: "blue", label: "Region B" }
    ],
    id: 'region',
    minWidth: 800,
    height: 15,
    length: 1114,
    displayStart: 1.0000000000000004,
    displayEnd: 1113.3285730609223,
    marginColor: 'aliceblue',
    highlightEvent: 'onclick',
    highlightColor: '#FFEB3B66',
  }
};
