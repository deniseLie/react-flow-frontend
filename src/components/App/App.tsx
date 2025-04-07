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
import { nodeTypes } from '../Node/CustomNodes';
import { edgeTypes } from '../Node/CustomEdges';
import EditNodeForm from '../Node/EditNodeForm';

// npm run build:css

function App() {

  // States
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Selected Node State
  const [selectedNode, setselectedNode] = useState<string | null>(null);

  // Function : 
  const handleNodeClick = useCallback((_: any, node: any) => {
    if (node.type == 'action' || node.type == 'conditional') {
      setselectedNode(node);
    }
  }, []);

  const closeModal = () => setselectedNode(null);
  
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
          {selectedNode && (
            <EditNodeForm
              selectedNode={selectedNode}
              onClose={closeModal}
              setNodes={setNodes}
              setEdges={setEdges}
              edges={edges}
              nodes={nodes}
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