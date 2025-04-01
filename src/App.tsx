import { useCallback, useState } from 'react';
import { applyEdgeChanges, applyNodeChanges, Background, Controls, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './CustomNodes';


function App() {

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        nodeTypes={nodeTypes}
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