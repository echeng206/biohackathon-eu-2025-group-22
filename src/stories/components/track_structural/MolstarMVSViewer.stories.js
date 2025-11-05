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
          'Mol* viewer using Method 2 (builder). Pass a structure `url`; the builder logic stays constant. `representation` controls the polymer representation.',
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
    viewerOptions: {
      control: 'object',
      description: 'Options forwarded to molstar.Viewer.create',
      table: { category: 'Viewer' },
    },
  },
};

const defaultStyle =
  'width: 640px; height: 480px; border: 1px solid #eee; border-radius: 8px;';

/** A tiny helper to render the component inside a sized container. */
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
  viewerOptions: {
    layoutIsExpanded: false,
    layoutShowControls: false,
  },
};
Basic.parameters = {
  docs: {
    description: {
      story:
        'Loads a BCIF structure via the builder (polymer in selected representation; ligand labeled/focused with ball-and-stick internally).',
    },
  },
};

export const MMCIF = renderWithBox.bind({});
MMCIF.args = {
  url: 'https://files.rcsb.org/download/1CRN.cif',
  format: 'mmcif',
  representation: 'backbone',
  viewerOptions: {
    layoutIsExpanded: false,
    layoutShowControls: false,
  },
};
MMCIF.parameters = {
  docs: {
    description: {
      story:
        'Same builder flow but parsing as mmCIF. Representation is switchable via controls.',
    },
  },
};

/**
 * Programmatically swap both the URL and representation to ensure the component
 * rebuilds and replaces the existing view.
 */
export const ReplaceUrlAndRepresentation = () => ({
  components: { MolstarMVSViewer },
  setup() {
    const args = reactive({
      url: 'https://www.ebi.ac.uk/pdbe/entry-files/1cbs.bcif',
      format: 'bcif',
      representation: 'cartoon',
      viewerOptions: {
        layoutIsExpanded: false,
        layoutShowControls: false,
      },
    });

    onMounted(() => {
      setTimeout(() => {
        args.url = 'https://files.rcsb.org/download/1CRN.cif';
        args.format = 'mmcif';
        args.representation = 'surface';
      }, 2500);

      // Optional: cycle again to stress-test
      setTimeout(() => {
        args.representation = 'ball_and_stick';
      }, 5000);
    });

    return { args };
  },
  template: `
    <div>
      <p style="font: 14px/1.4 sans-serif; margin: 0 0 8px;">
        Starts with <code>1cbs.bcif</code> + <code>cartoon</code>, then switches to
        <code>1CRN.cif</code> + <code>surface</code> (~2.5s), then to <code>ball_and_stick</code> (~5s).
      </p>
      <div style="${defaultStyle}">
        <MolstarMVSViewer v-bind="args" />
      </div>
    </div>
  `,
});
ReplaceUrlAndRepresentation.parameters = {
  docs: {
    description: {
      story:
        'Verifies that changing `url`/`format`/`representation` triggers a rebuild via the MVS builder and replaces the existing view.',
    },
  },
};
