import Manager from "@/components/track_structural/1d_3d/Manager.vue";


export default {
  title: 'Tracks/Structural/Manager',
  component: Manager,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    moleculeId: {}
  }
};

/**
 * Primary template with red background
 */
export const Main = {
  args: {
    moleculeId: '1CBS',
  }
};
