// src/stories/Manager.stories.js
import Manager from '@/components/track_structural/1d_3d/Manager.vue';
import { reactive, onMounted } from 'vue';

export default {
  title: 'Tracks/Structural/Manager',
  component: Manager,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Wrapper around MolstarMVSViewer. Supports `representation`, `defaultColor`, and per-residue overrides via `colorByResidue`.',
      },
    },
  },
  argTypes: {
    moleculeId: {
      control: 'text',
      description: 'PDB/PDBe molecule identifier used by the Manager to resolve the structure URL.',
      table: { category: 'Data' },
    },
    sequence: {
      control: 'text',
      description: 'Sequence used by the Manager for auxiliary features.',
      table: { category: 'Data' },
    },
    representation: {
      control: { type: 'select' },
      options: [
        'cartoon',
        'backbone',
        'ball_and_stick',
        'line',
        'spacefill',
        'carbohydrate',
        'surface',
      ],
      description: 'Polymer representation passed down to MolstarMVSViewer.',
      table: { category: 'Style' },
    },
    defaultColor: {
      control: 'color',
      description: 'Default polymer color (applied first).',
      table: { category: 'Color' },
    },
    colorByResidue: {
      control: 'object',
      description:
        'Per-residue color overrides. Keys like "A:42" (label_) or "auth:B:100" (auth_) map to CSS colors.',
      table: { category: 'Color' },
    },
  },
};

/**
 * Primary example with defaults and a couple of residue overrides.
 */
export const Main = {
  args: {
    moleculeId: '1CBS',
    sequence: 'SEQUENCEEXAMPLEBIOHACKATHONBERLIN',
    representation: 'cartoon',
    defaultColor: '#66aa66',
    colorByResidue: {
      'A:42': '#cc3399',
      'A:57': '#ff9900',
    },
  },
};

/**
 * Demonstrates reactively changing representation and colors.
 * Useful to verify that Manager passes updates through to MolstarMVSViewer.
 */
export const DynamicColors = () => ({
  components: { Manager },
  setup() {
    const args = reactive({
      moleculeId: '1CBS',
      sequence: 'SEQUENCEEXAMPLEBIOHACKATHONBERLIN',
      representation: 'cartoon',
      defaultColor: '#66aa66',
    });

    onMounted(() => {
      setTimeout(() => {
        args.representation = 'surface';
        args.defaultColor = '#777777';
        args.colorByResidue = { 'A:42': '#ffcc00', 'A:57': '#3366ff' };
      }, 2500);

      setTimeout(() => {
        args.representation = 'ball_and_stick';
        args.defaultColor = '#99ccee';
        args.colorByResidue = { 'auth:B:10': '#ff6666', 'auth:B:25': '#33cc99' };
      }, 5000);
    });

    return { args };
  },
  template: `
    <div style="width: 680px;">
      <p style="font: 14px/1.4 sans-serif; margin: 0 0 8px;">
        Representation and colors update over time to validate reactive rebuilds.
      </p>
      <Manager v-bind="args" />
    </div>
  `,
});
