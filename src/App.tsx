import { useCallback, useState } from 'react';
import { 
  ReactFlow, 
  Background,
  Controls, 
  useEdgesState, 
  useNodesState, 
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './CustomNodes';
import { edgeTypes } from './CustomEdges';
import EditNodeForm from './EditNodeForm';

// npm run build:css

function App() {

  // States
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Selected Node State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleNodeClick = useCallback((_: any, node: any) => {
    if (node.id !== 'start' && node.id !== 'end') {
      setSelectedNodeId(node.id);
      console.log("Selected Node ID", node)
    }
  }, []);

  const closeModal = () => setSelectedNodeId(null);
  
  return (
    <ReactFlowProvider>
      <div style={{ height: '100vh', width: '100vw' }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
        >
          {/* Render form when node is selected */}
          {selectedNodeId && (
            <EditNodeForm
              nodeId={selectedNodeId}
              onClose={closeModal}
              setNodes={setNodes}
            />
          )}
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}

const initialNodes = [
  { id: 'start', position: {x: 300, y: 100}, type: 'start', data: { label: 'start' }},
  { id: 'end', position: {x: 300, y: 300}, type: 'end', data: { label: 'end' }},
]

const initialEdges = [
  { id: 'edge-start-end', source: 'start', target: 'end', type: 'addBtn'}
]

export default App;