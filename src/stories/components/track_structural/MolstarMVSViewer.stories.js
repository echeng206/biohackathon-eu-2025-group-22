// src/stories/MolstarMVSViewer.stories.js
import MolstarMVSViewer from '@/components/track_structural/1d_3d/MolstarMVSViewer.vue';
import { reactive, onMounted } from 'vue';

export default {
  title: 'Tracks/Structural/MolstarMVSViewer',
  component: MolstarMVSViewer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Mol* viewer using Method 2 (builder). Pass a structure `url`; the builder logic stays constant. `representation` controls the polymer representation. `defaultColor` and `colorByResidue` drive the coloring.',
      },
    },
  },
  argTypes: {
    url: {
      control: 'text',
      description: 'URL of structure file (bcif/mmcif/pdb/gz)',
      table: { category: 'Data' },
    },
    format: {
      control: { type: 'select' },
      options: ['bcif', 'mmcif', 'cif', 'pdb'],
      description: 'Explicit format for parsing the structure',
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
      description: 'Polymer representation used by the builder',
      table: { category: 'Style' },
    },
    defaultColor: {
      control: 'color',
      description: 'Default polymer color (applied first)',
      table: { category: 'Color' },
    },
    colorByResidue: {
      control: 'object',
      description:
        'Overrides per residue. Keys: "A:42" (label_asym_id + label_seq_id) or "auth:B:100" (auth_asym_id + auth_seq_id). Values: CSS color strings.',
      table: { category: 'Color' },
    },
    viewerOptions: {
      control: 'object',
      description: 'Options forwarded to molstar.Viewer.create',
      table: { category: 'Viewer' },
    },
  },
};

const defaultStyle =
  'width: 640px; height: 480px; border: 1px solid #eee; border-radius: 8px;';

const renderWithBox = (args) => ({
  components: { MolstarMVSViewer },
  setup() {
    return { args };
  },
  template: `
    <div style="${defaultStyle}">
      <MolstarMVSViewer v-bind="args" />
    </div>
  `,
});

export const Basic = renderWithBox.bind({});
Basic.args = {
  url: 'https://www.ebi.ac.uk/pdbe/entry-files/1cbs.bcif',
  format: 'bcif',
  representation: 'cartoon',
  defaultColor: '#66aa66',
  colorByResidue: {
    'A:42': '#cc3399',
    'A:57': '#ff9900',
  },
  viewerOptions: {
    layoutIsExpanded: false,
    layoutShowControls: false,
  },
};
Basic.parameters = {
  docs: {
    description: {
      story:
        'Loads a BCIF structure with a default polymer color and per-residue overrides (e.g., A:42, A:57).',
    },
  },
};

export const MMCIF = renderWithBox.bind({});
MMCIF.args = {
  url: 'https://files.rcsb.org/download/1CRN.cif',
  format: 'mmcif',
  representation: 'backbone',
  defaultColor: '#4a90e2',
  colorByResidue: {
    'auth:B:100': 'tomato',
  },
  viewerOptions: {
    layoutIsExpanded: false,
    layoutShowControls: false,
  },
};
MMCIF.parameters = {
  docs: {
    description: {
      story:
        'mmCIF input with backbone representation. Demonstrates an auth-based residue selector override.',
    },
  },
};

/**
 * Programmatically swap URL, representation, defaultColor, and residue overrides
 * to ensure the component rebuilds and replaces the view.
 */
export const ReplaceUrlRepresentationAndColors = () => ({
  components: { MolstarMVSViewer },
  setup() {
    const args = reactive({
      url: 'https://www.ebi.ac.uk/pdbe/entry-files/1cbs.bcif',
      format: 'bcif',
      representation: 'cartoon',
      defaultColor: '#66aa66',
      colorByResidue: {
        'A:42': '#cc3399',
      },
      viewerOptions: {
        layoutIsExpanded: false,
        layoutShowControls: false,
      },
    });

    onMounted(() => {
      setTimeout(() => {
        // swap dataset + representation + palette
        args.url = 'https://files.rcsb.org/download/1CRN.cif';
        args.format = 'mmcif';
        args.representation = 'surface';
        args.defaultColor = '#888888';
        args.colorByResidue = {
          'auth:B:10': '#ffcc00',
          'auth:B:25': '#3366ff',
        };
      }, 2500);

      setTimeout(() => {
        // tweak colors again to stress-test reactive rebuilds
        args.representation = 'ball_and_stick';
        args.defaultColor = '#99ccee';
        args.colorByResidue = {
          'auth:B:10': '#ff6666',
          'auth:B:25': '#33cc99',
          'auth:B:46': '#aa66ff',
        };
      }, 5000);
    });

    return { args };
  },
  template: `
    <div>
      <p style="font: 14px/1.4 sans-serif; margin: 0 0 8px;">
        Swaps URL/format/representation and both <code>defaultColor</code> and <code>colorByResidue</code> to verify rebuilds.
      </p>
      <div style="${defaultStyle}">
        <MolstarMVSViewer v-bind="args" />
      </div>
    </div>
  `,
});
ReplaceUrlRepresentationAndColors.parameters = {
  docs: {
    description: {
      story:
        'Verifies that changing `url`, `format`, `representation`, `defaultColor`, and `colorByResidue` triggers a rebuild with the MVS builder.',
    },
  },
};
