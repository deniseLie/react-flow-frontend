import { SetStateAction, Dispatch } from 'react';

import { Node, Edge } from "@xyflow/react"

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

// Helper function to check if a node is downstream of the "else" node
export const isDownstream = (node: Node, elseNode: Node, edges: any[]): boolean => {
    // Find edges originating from the "else" node or leading to the current node
    const downstreamEdges = edges.filter(
        (edge) => edge.source === elseNode.id && edge.target === node.id
    );
    
    // If there are downstream edges, it means the node is downstream of the "else" node
    return downstreamEdges.length > 0;
};