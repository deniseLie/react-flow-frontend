import { useCallback, useEffect, useState } from 'react';
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

  // Inject setNodes and setEdges to all edges
  const onConnect = useCallback(() => {

  }, [setEdges]);

  
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

const initialNodes = [
  { id: 'start', position: {x: 300, y: 100}, type: 'start', data: {}},
  { id: 'end', position: {x: 300, y: 300}, type: 'end', data: {}},
]

const initialEdges = [
  { id: 'edge-start-end', source: 'start', target: 'end', type: 'addBtn'}
]

export default App;