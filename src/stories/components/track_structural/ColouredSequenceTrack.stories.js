import ColouredSequenceTrack from "@/components/track_structural/1d_3d/ColouredSequenceTrack.vue";


export default {
  title: 'Tracks/Structural/ColouredSequenceTrack',
  component: ColouredSequenceTrack,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    sequence: {
      label: "Protein Sequence",
      description: 'The SEQUENCE text to display'
    },
    height: {
      label: "Track height",
      description: "Track height"
    }
  }
};

/**
 * Primary template with red background
 */
export const Track = {
  args: {
    sequence: 'SEQUENCESEQUENCESEQUENCESEQUENCE',
    height: 40
  }
};
