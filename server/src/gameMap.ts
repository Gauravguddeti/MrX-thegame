import { MapNode, GameMap, NodeType, TransportType } from './types';

const createNode = (
  id: string,
  name: string,
  position: [number, number],
  type: NodeType = 'normal',
  transportTypes: TransportType[] = ['rickshaw', 'bus', 'metro', 'train'],
  connections: string[] = []
): MapNode => ({
  id,
  name,
  position,
  type,
  transportTypes,
  connections
});

export const gameMap: GameMap = {
  nodes: [
    // Starting points (outer ring)
    createNode('start1', 'Connaught Place', [0, 0], 'start'),
    createNode('start2', 'India Gate', [1, 0], 'start'),
    createNode('start3', 'Red Fort', [2, 0], 'start'),
    createNode('start4', 'Qutub Minar', [3, 0], 'start'),
    createNode('start5', 'Lotus Temple', [4, 0], 'start'),
    createNode('start6', 'Humayun\'s Tomb', [5, 0], 'start'),

    // Normal points (middle ring)
    createNode('n1', 'Chandni Chowk', [0, 1]),
    createNode('n2', 'Karol Bagh', [1, 1]),
    createNode('n3', 'Lajpat Nagar', [2, 1]),
    createNode('n4', 'Saket', [3, 1]),
    createNode('n5', 'Nehru Place', [4, 1]),
    createNode('n6', 'Vasant Kunj', [5, 1]),

    // Escape points (inner ring)
    createNode('escape1', 'Airport', [0, 2], 'escape', ['train']),
    createNode('escape2', 'Railway Station', [1, 2], 'escape', ['train']),
    createNode('escape3', 'Bus Terminal', [2, 2], 'escape', ['bus']),
    createNode('escape4', 'Metro Hub', [3, 2], 'escape', ['metro']),
    createNode('escape5', 'Rickshaw Stand', [4, 2], 'escape', ['rickshaw']),
  ]
};

// Add connections
gameMap.nodes[0].connections = ['n1', 'n2', 'start2'];
gameMap.nodes[1].connections = ['start1', 'n2', 'n3', 'start3'];
gameMap.nodes[2].connections = ['start2', 'n3', 'n4', 'start4'];
gameMap.nodes[3].connections = ['start3', 'n4', 'n5', 'start5'];
gameMap.nodes[4].connections = ['start4', 'n5', 'n6', 'start6'];
gameMap.nodes[5].connections = ['start5', 'n6', 'n1'];

gameMap.nodes[6].connections = ['start1', 'n2', 'escape1', 'escape2'];
gameMap.nodes[7].connections = ['n1', 'n3', 'escape2', 'escape3'];
gameMap.nodes[8].connections = ['n2', 'n4', 'escape3', 'escape4'];
gameMap.nodes[9].connections = ['n3', 'n5', 'escape4', 'escape5'];
gameMap.nodes[10].connections = ['n4', 'n6', 'escape5', 'escape1'];
gameMap.nodes[11].connections = ['n5', 'n1', 'escape1', 'escape2'];

gameMap.nodes[12].connections = ['n1', 'n6'];
gameMap.nodes[13].connections = ['n1', 'n2'];
gameMap.nodes[14].connections = ['n2', 'n3'];
gameMap.nodes[15].connections = ['n3', 'n4'];
gameMap.nodes[16].connections = ['n4', 'n5']; 