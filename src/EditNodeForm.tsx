import React, { useState, useEffect } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import ConditionalNodeForm from './ConditionalNodeForm';

interface EditNodeFormProps {
    selectedNode: any;
    onClose: () => void;
    setNodes: (setter: (nodes: any[]) => any[]) => void;
    setEdges: (setter: (edges: any[]) => any[]) => void;
}

const EditNodeForm: React.FC<EditNodeFormProps> = ({ selectedNode, onClose, setNodes, setEdges }) => {

    // Hook to interact with React Flow
    const { getNode } = useReactFlow(); 
    const node: Node | undefined = getNode(selectedNode.id); 

    const [nodeName, setNodeName] = useState('');

    useEffect(() => {
        if (node?.data?.label && typeof node.data.label === 'string') {
            setNodeName(node.data.label);
        }
    }, [node]);

    // Function: Handle name input change
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNodeName(event.target.value);
    };

    // Function: Submit updated node name
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setNodes((nodes) =>
          nodes.map((n) =>
            n.id === selectedNode.id 
                ? { ...n, data: { ...n.data, label: nodeName } } 
                : n
          )
        );
        onClose();
    };
    
    // Function: Handle Delete
    const handleDelete = () => {

        // Delete node
        setNodes((nodes) => nodes.filter((n) => n.id !== selectedNode.id));

        // Remove edges
        setEdges((edges: any[]) => {

            // Find edges connecting to the node
            const remainingEdges = edges.filter(
                (e: any) => e.source !== selectedNode.id && e.target !== selectedNode.id
            );

            const connectedEdges = edges.filter(
                (e) => e.source === selectedNode.id || e.target === selectedNode.id
            );

            if (connectedEdges.length == 2) {
                const [sourceEdge, targetEdge] = connectedEdges;
                const newEdge = {
                    id: `edge-${sourceEdge.source}-${targetEdge.target}`,
                    source: sourceEdge.source,
                    target: targetEdge.target,
                    type: 'addBtn',
                };

                return [...remainingEdges, newEdge];
            }

            return remainingEdges;
        })

        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-40 flex z-[99999]"
            onClick={onClose} // Close modal when clicking outside
        >

            {/* Modal */}
            <div 
                className="fixed right-0 h-full bg-white p-6 rounded shadow-md w-96"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >   
                <p className="text-xl font-semibold">Action</p>
                <p className="text-sm font-medium mb-4">{selectedNode?.type == 'action' ? "Update Contact" : "If / else"}</p>

                {/* FORM */}
                <form onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium mb-1">Action Name</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                        value={nodeName}
                        onChange={handleChange}
                    />

                    {/* FOR ACTION NODE */}
                    {selectedNode?.type == 'action' && (
                        <div>
                            {/* Placeholder for + Add field */}
                            <button
                                type="button"
                                className="text-blue-600 text-sm mb-4"
                                onClick={() => alert('Add field clicked!')}
                            >
                                + Add field
                            </button>
                        </div>
                    )}

                    {/* FOR IF ELSE NODE */}
                    {/* Render Conditional Node Form */}
                    {selectedNode?.type === 'conditional' && (
                        <ConditionalNodeForm 
                            nodeName={nodeName} 
                            setNodeName={setNodeName} 
                        />
                    )}

                    <div className='bottom-10 flex flex-row w-full justify-between'>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="border border-color-red-600 bg-red-100 px-4 py-2 rounded text-red-600 text-sm"
                        >
                            Delete
                        </button>

                        <div className="right-30 gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-500 px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-purple-600 px-4 py-2 rounded text-white text-sm"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            </div>
    );
};

export default EditNodeForm;
