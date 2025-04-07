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

// Check if a node is downstream of the "else" node
export const isDownstream = (node: Node, elseNode: Node, edges: any[]): boolean => {
    // Find edges originating from the "else" node or leading to the current node
    const downstreamEdges = edges.filter(
        (edge) => edge.source === elseNode.id && edge.target === node.id
    );
    
    // If there are downstream edges, it means the node is downstream of the "else" node
    return downstreamEdges.length > 0;
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