import { useCallback, useState } from 'react';
import { 
  ReactFlow, 
  Background, 
  Connection, 
  Controls, 
  useEdgesState, 
  useNodesState 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './CustomNodes';
import { edgeTypes } from './CustomEdges';


function App() {

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // const onConnect = useCallback(
  //   (connection: Connection) => {

  //     const edge = {
  //       id: `edge-${connection.source}-${connection.target}`,
  //       source: connection.source,
  //       target: connection.target,
  //       type: 'addBtn',
  //     }

  //     setEdges((oldEdges) => [...oldEdges, edge]);
    
  //   }, [setEdges],
  // )

  const handleAddConnection = (source: string, target: string) => {
    // Logic to add a new edge
    const newEdge = {
      id: `edge-${source}-${target}`,
      source: source,
      target: target,
      type: 'addBtn', // Use the custom edge type
    };
    setEdges((oldEdges) => [...oldEdges, newEdge]);
  };
  
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

const initialNodes = [
  { id: 'start', data: { label: 'Start Node'}, position: {x: 300, y: 100}, type: 'start'},
  { id: 'end', data: { label: 'End Node'}, position: {x: 300, y: 300}, type: 'end'},
]

const initialEdges = [
  { id: 'edge-start-end', source: 'start', target: 'end', type: 'addBtn'}
]

export default App;