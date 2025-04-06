import React, { useState, useEffect } from 'react';
import { Node, useReactFlow } from '@xyflow/react';

interface EditNodeFormProps {
    nodeId: string;
    onClose: () => void;
    setNodes: (setter: (nodes: any[]) => any[]) => void;
}

const EditNodeForm: React.FC<EditNodeFormProps> = ({ nodeId, onClose, setNodes }) => {

    // Hook to interact with React Flow
    const { getNode } = useReactFlow(); 
    const node: Node | undefined = getNode(nodeId); 

    const [nodeName, setNodeName] = useState('');

    useEffect(() => {
        console.log("EDIT NODE OFRM", JSON.stringify(node));
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
            n.id === nodeId 
                ? { ...n, data: { ...n.data, label: nodeName } } 
                : n
          )
        );
        onClose();
    };
    
    // Function: Handle Delete
    const handleDelete = () => {
        setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
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
                <h2 className="text-xl font-semibold mb-4">Action</h2>

                {/* FORM */}
                <form onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium mb-1">Action Name</label>
                    <label className="block text-xs font-medium mb-1">Update contact</label>

                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                        value={nodeName}
                        onChange={handleChange}
                    />

                    {/* Placeholder for + Add field */}
                    <button
                        type="button"
                        className="text-blue-600 text-sm mb-4"
                        onClick={() => alert('Add field clicked!')}
                    >
                        + Add field
                    </button>

                    <div className='position bottom-0 flex flex-row'>
                        <div className='position left-0'>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="mt-4 text-red-600 text-sm"
                            >
                                Delete
                            </button>
                        </div>

                        <div className="position right-0 justify-between">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-200 px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-purple-600 text-white px-4 py-2 rounded"
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
