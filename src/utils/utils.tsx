import { SetStateAction, Dispatch } from 'react';

import { Node, Edge } from "@xyflow/react"
import { Branch } from '../types/types';

// Delete Down Stream
export const deleteDownstream = (
  startNodeId: string,
  setNodes: (setter: (nodes: any[]) => any[]) => void,
  setEdges: (setter: (edges: any[]) => any[]) => void,
  edges: Edge[]
) => {
  const visitedNodes = new Set<string>(); // To avoid revisiting nodes
  const nodesToDelete: string[] = [];     // List of node IDs to delete
  const edgesToDelete: string[] = [];     // List of edge IDs to delete

  // Recursive function to collect downstream nodes and edges
  const traverseDownstream = (nodeId: string) => {
    
    // Add the current node to the list to delete
    if (visitedNodes.has(nodeId)) return;
    visitedNodes.add(nodeId);
    nodesToDelete.push(nodeId);

    // Find edges connected to this node
    const outgoingEdges = edges.filter((e) => e.source === nodeId);
    const incomingEdges = edges.filter((e) => e.target === nodeId);

    // Collect all outgoing and incoming edges
    outgoingEdges.forEach((edge) => {
      edgesToDelete.push(edge.id); // Add edge to delete
      traverseDownstream(edge.target); // Recursively visit the target node
    });
  };

  // Start traversal from the given node
  traverseDownstream(startNodeId);

  // Remove the downstream nodes and edges
  setNodes((nodes) => nodes.filter((n) => !nodesToDelete.includes(n.id)));
  setEdges((edges) => edges.filter((e) => !edgesToDelete.includes(e.id)));
};


// Delete connected edges and add new edge
export const handleDeleteConnectedEdges = (
  selectedNodeId: string, 
  nodes: any[],
  edges: any[],
  setNodes: (setter: (nodes: any[]) => any[]) => void,
  setEdges: (setter: (edges: any[]) => any[]) => void,
) => {

  // Delete node
  setNodes((prevNodes) => prevNodes.filter((n) => n.id !== selectedNodeId));

  // Find edges connecting to the node
  const remainingEdges = edges.filter(
    (e: any) => e.source !== selectedNodeId && e.target !== selectedNodeId
  );

  // Find edges connected to the selected node
  const connectedEdges = edges.filter(
    (e) => e.source === selectedNodeId || e.target === selectedNodeId
  );

  // IF have 2 edges, source and target from selected node
  // Connect prev - source node
  if (connectedEdges.length === 2) {
    const [sourceEdge, targetEdge] = connectedEdges;
    const newEdge = {
      id: `edge-${sourceEdge.source}-${targetEdge.target}`,
      source: sourceEdge.source,
      target: targetEdge.target,
      type: 'addBtn'
    };
    setEdges((prevEdges) => [...remainingEdges, newEdge]);
  
  // No 2 connected edges
  } else {
    setEdges((prevEdges) => remainingEdges);
  }
}

// Delete downstream and handle end node creatino
export const handleDeleteDownstream = (
  selectedNodeId: string,
  nodes: any[],
  edges: any[],
  setNodes: (setter: (nodes: any[]) => any[]) => void,
  setEdges: (setter: (edges: any[]) => any[]) => void,
) => {
  deleteDownstream(selectedNodeId, setNodes, setEdges, edges);

  // Find the previous node connected to the selected node
  const previousEdge = edges.find((e: any) => e.target === selectedNodeId);
  const previousNodeId = previousEdge ? previousEdge.source : null;

  // If a previous node exists, connect it to a new end node
  if (previousNodeId) {

    // Get the previous node
    const previousNode = nodes.find((n: any) => n.id === previousNodeId);
    if (previousNode) {

      // If a previous node exists, connect it to a new end node
      const newEndNodeId = `${previousNodeId}-end`; 
      const newEndNode = {
        id: newEndNodeId,
        position: { x: previousNode.position.x, y: previousNode.position.y + 150 },
        type: 'end',
        data: { label: 'END' },
      };

      // Create new edge connecting previous node to the new end node
      const newEdge = {
        id: `edge-${previousNodeId}-end`,
        source: previousNodeId,
        target: newEndNodeId,
        type: 'addBtn', // Adjust edge type as needed
      };

      // Add the new end node and the new edge
      setNodes((prevNodes) => [...prevNodes, newEndNode]);
      setEdges((prevEdges) => [...prevEdges, newEdge]);
    }
  }
};

// Function : Find down stream nodes 
export const findDownstreamNodes = (parentId: string, nodes: Node[]): Node[] => {
  const visited = new Set<string>();
  const queue: string[] = [parentId];
  const downstream: Node[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId || visited.has(currentId)) continue;

    visited.add(currentId);

    const children = nodes.filter(node =>
      node.id !== parentId &&
      node.data?.parent === currentId
    );

    children.forEach(child => {
      downstream.push(child);
      queue.push(child.id);
    });
  }

  return downstream;
};


// Distribute nodes evenly starting from the parent
export const distributeNodesEvenly = (
  parentNode: Node, addedBranches: Branch[], branches: Branch[], nodes:Node[],
): Node[] => {
  let total_length = (branches.length * 20 + (branches.length - 1) * 250) / 2;

  let currentX = (parentNode.position.x + 30) - total_length
  let currentY = parentNode.position.x + 200

  // Separate the else nodes from other branches
  const nonElseBranches = branches.filter(branch => branch.type !== 'else');
  const elseBranches = branches.filter(branch => branch.type === 'else');
  // console.log('nonElseBranches', nonElseBranches);
  // console.log('elseBranches', elseBranches);

  const updatedNodes: Node[] = [];

  // Process all non-else branches first
  [...nonElseBranches, ...elseBranches].forEach(branch => {
    updatedNodes.push(...processBranchNode(branch, nodes, currentX, currentY));
    currentX += 250;
  });

  return updatedNodes;
};

// Update or create a branch with end node and adjust positions
const processBranchNode = (
  branch: Branch, existingNodes: Node[], x: number, y: number
): Node[] => {
  const result: Node[] = [];

  const branchNode = existingNodes.find(node => node.id === branch.id);

  if (branchNode) {
    result.push({
      ...branchNode,
      position: { x, y },
    });
  } else {
    result.push(...createBranchAndEndNode(branch, x, y));
  }
  console.log(result);

  return result;
};

// Create a branch node and its corresponding end node
const createBranchAndEndNode = (branch: Branch, currentX: number, currentY: number): Node[] => {
  const branchNode = {
    id: branch.id,
    position: { x: currentX, y: currentY },
    type: 'branch',
    data: { label: branch.label },
  };

  const endNode = {
    id: `${branch.id}-end`,
    position: { x: currentX, y: currentY + 200 }, // Adjust Y for end node
    type: 'end',
    data: { label: 'END' },
  };

  return [branchNode, endNode];
}