import { useCallback, useState } from 'react';
import { 
  addEdge, 
  Background, 
  Connection, 
  Controls, 
  Edge, 
  ReactFlow, 
  useEdgesState, 
  useNodesState 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './CustomNodes';


function App() {

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )
  
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        nodeTypes={nodeTypes}
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
  { id: 'start', data: { label: 'Start Node'}, position: {x: 300, y: 100}, type: 'start'},
  { id: 'end', data: { label: 'END'}, position: {x: 300, y: 300}, type: 'end'},
]

const initialEdges = [
  { id: 'start-end', source: 'start', target: 'end', }
]

export default App;