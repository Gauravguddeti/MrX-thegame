import { MapNode, TransportType } from '../types/game';

// Define the map nodes with their positions and connections
export const MAP_NODES: MapNode[] = [
  // Major Landmarks
  {
    id: '2',
    label: 'Deccan Gymkhana',
    type: 'start',
    x: 250,
    y: 400,
    connections: [
      { to: '18', transportTypes: ['rickshaw', 'bus'] },
      { to: '21', transportTypes: ['metro'] },
      { to: '24', transportTypes: ['bus', 'rickshaw'] }
    ]
  },
  {
    id: '18',
    label: 'Saras Baug',
    type: 'normal',
    x: 300,
    y: 500,
    connections: [
      { to: '2', transportTypes: ['rickshaw', 'bus'] },
      { to: '24', transportTypes: ['rickshaw'] },
      { to: '88', transportTypes: ['metro'] }
    ]
  },
  {
    id: '21',
    label: 'Shaniwar Wada',
    type: 'normal',
    x: 400,
    y: 300,
    connections: [
      { to: '2', transportTypes: ['metro'] },
      { to: '22', transportTypes: ['rickshaw'] },
      { to: '23', transportTypes: ['bus'] },
      { to: '31', transportTypes: ['train'] }
    ]
  },
  {
    id: '22',
    label: 'Pashan Lake',
    type: 'escape',
    x: 200,
    y: 200,
    connections: [
      { to: '21', transportTypes: ['rickshaw'] },
      { to: '31', transportTypes: ['bus'] }
    ]
  },
  {
    id: '23',
    label: 'Laxmi Road',
    type: 'normal',
    x: 500,
    y: 400,
    connections: [
      { to: '21', transportTypes: ['bus'] },
      { to: '24', transportTypes: ['rickshaw'] },
      { to: '28', transportTypes: ['metro'] }
    ]
  },
  {
    id: '24',
    label: 'Chaturshringi Temple',
    type: 'normal',
    x: 350,
    y: 200,
    connections: [
      { to: '2', transportTypes: ['bus', 'rickshaw'] },
      { to: '23', transportTypes: ['rickshaw'] },
      { to: '31', transportTypes: ['metro'] }
    ]
  },
  {
    id: '28',
    label: 'Laxmi Road',
    type: 'normal',
    x: 600,
    y: 350,
    connections: [
      { to: '23', transportTypes: ['metro'] },
      { to: '37', transportTypes: ['rickshaw', 'bus'] },
      { to: '38', transportTypes: ['train'] }
    ]
  },
  {
    id: '31',
    label: 'Viman Nagar',
    type: 'start',
    x: 700,
    y: 200,
    connections: [
      { to: '21', transportTypes: ['train'] },
      { to: '24', transportTypes: ['metro'] },
      { to: '22', transportTypes: ['bus'] },
      { to: '67', transportTypes: ['rickshaw'] }
    ]
  },
  {
    id: '37',
    label: 'Koregaon Park',
    type: 'normal',
    x: 750,
    y: 300,
    connections: [
      { to: '28', transportTypes: ['rickshaw', 'bus'] },
      { to: '26', transportTypes: ['metro'] },
      { to: '64', transportTypes: ['train'] }
    ]
  },
  {
    id: '38',
    label: 'Aga Khan Palace',
    type: 'escape',
    x: 800,
    y: 400,
    connections: [
      { to: '28', transportTypes: ['train'] },
      { to: '62', transportTypes: ['bus'] },
      { to: '68', transportTypes: ['metro'] }
    ]
  },
  {
    id: '62',
    label: 'Magar Patta',
    type: 'normal',
    x: 850,
    y: 500,
    connections: [
      { to: '38', transportTypes: ['bus'] },
      { to: '68', transportTypes: ['rickshaw'] }
    ]
  },
  {
    id: '64',
    label: 'Rajiv Gandhi Zoo',
    type: 'normal',
    x: 900,
    y: 350,
    connections: [
      { to: '37', transportTypes: ['train'] },
      { to: '66', transportTypes: ['metro'] },
      { to: '68', transportTypes: ['bus'] }
    ]
  },
  {
    id: '66',
    label: 'Airport',
    type: 'escape',
    x: 950,
    y: 200,
    connections: [
      { to: '64', transportTypes: ['metro'] },
      { to: '68', transportTypes: ['train'] }
    ]
  },
  {
    id: '67',
    label: 'Railway Station',
    type: 'start',
    x: 900,
    y: 100,
    connections: [
      { to: '31', transportTypes: ['rickshaw'] },
      { to: '68', transportTypes: ['train', 'metro'] }
    ]
  },
  {
    id: '68',
    label: 'Bus Terminal',
    type: 'normal',
    x: 950,
    y: 300,
    connections: [
      { to: '62', transportTypes: ['rickshaw'] },
      { to: '64', transportTypes: ['bus'] },
      { to: '66', transportTypes: ['train'] },
      { to: '67', transportTypes: ['train', 'metro'] }
    ]
  },
  {
    id: '88',
    label: 'Sinhagad Fort',
    type: 'escape',
    x: 100,
    y: 500,
    connections: [
      { to: '18', transportTypes: ['metro'] },
      { to: '2', transportTypes: ['train'] }
    ]
  }
]; 