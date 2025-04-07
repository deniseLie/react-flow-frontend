import React, { useState, useEffect } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import ConditionalNodeForm from './ConditionalNodeForm';
import { Branch } from '../../types/types';
import { deleteDownstream, distributeNodesEvenly, handleDeleteConnectedEdges, handleDeleteDownstream } from '../../utils/utils';

interface EditNodeFormProps {
    selectedNode: any;
    onClose: () => void;
    setNodes: (setter: (nodes: any[]) => any[]) => void;
    setEdges: (setter: (edges: any[]) => any[]) => void;
    edges: any;
    nodes: any;
}

const EditNodeForm: React.FC<EditNodeFormProps> = ({ selectedNode, onClose, setNodes, setEdges, edges, nodes }) => {

    // Hook to interact with React Flow
    const { getNode } = useReactFlow(); 
    const node: Node | undefined = getNode(selectedNode.id); 

    const [nodeName, setNodeName] = useState('');
    const [branches, setBranches] = useState<Branch[]>(
        selectedNode?.data?.branches || [{ id: crypto.randomUUID(), label: 'Branch 1' }]
    );
    const [error, setError] = useState<string | null>(null);

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

        // Validate node name
        if (nodeName == '' || nodeName == null) {
            setError('Node name is required');
            return; // Prevent submission
        }

        // Validate the branches for correct configuration
        if (selectedNode?.type === 'conditional' && branches.length <= 1) {
            setError('At least one each if and else branch is required.');
            return; // Prevent submission
        }

        // No error, reset error state
        setError(null); 

        // Update selected node
        setNodes((nodes) =>
          nodes.map((n) =>
            n.id === selectedNode.id 
                ? { ...n, 
                    data: { ...n.data, label: nodeName, ...(selectedNode?.type === 'conditional' && { branches })} 
                  } 
                : n
          )
        );

        // Add and Delete Branch Nodes
        if (selectedNode?.type === 'conditional') {
            const { addedBranches, deletedBranchIds } = getBranchChanges(selectedNode.data?.branches, branches);
            setNodes((nodes) => updateNodesForBranches(nodes, addedBranches, deletedBranchIds));
            setEdges((edges) => updateEdgesForBranches(edges, addedBranches, deletedBranchIds, selectedNode.id));
        }
        onClose();
    };

    // Function : Get Branch Changes
    const getBranchChanges = (oldBranches: Branch[], newBranches: Branch[]) => {
        const addedBranches = newBranches.filter(
            (branch) => !oldBranches?.find((old) => old.id === branch.id)
        );
        const deletedBranchIds = oldBranches
            ?.filter((old) => !newBranches.find((b) => b.id === old.id))
            .map((b) => b.id) || [];
    
        return { addedBranches, deletedBranchIds };
    };
    
    // Function : Update Node based on Branch
    const updateNodesForBranches = (
        nodes: Node[], addedBranches: Branch[], deletedBranchIds: string[]
    ): Node[] => {

        // If branches are deleted, trigger downstream node deletion
        deletedBranchIds.forEach((deletedBranchId) => {
            deleteDownstream(deletedBranchId, setNodes, setEdges, edges);
        });

        // Update label for existing nodes if needed
        const remainingNodes = nodes
            .map((node) => {
                const matchingBranch = branches.find((branch: Branch) => branch.id === node.id);
                if (matchingBranch) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: matchingBranch.label,
                        },
                    };
                }
                return node;
            });

        if (addedBranches.length == 0 && deletedBranchIds.length == 0) {
            return [...remainingNodes];
        }
        // console.log(remainingNodes);
        // console.log('branches', branches);

        // Now, update or create nodes for added branches
        const updatedNodes = distributeNodesEvenly(selectedNode, addedBranches, branches, remainingNodes, edges);
        
        console.log('\n');
        console.log("updatedNodes", updatedNodes);

        // Filter out any nodes that were just updated so we don't duplicate
        const updatedNodeIds = new Set(updatedNodes.map((n) => n.id));
        const finalRemaining = remainingNodes.filter((n) => !updatedNodeIds.has(n.id));

        return [...finalRemaining, ...updatedNodes];
    };

    // Function : Update Edge based on Branch
    const updateEdgesForBranches = (
        edges: any[],
        addedBranches: Branch[],
        deletedBranchIds: string[],
        conditionalNodeId: string
    ) => {
        const remainingEdges = edges.filter(
            (e) =>
                !deletedBranchIds.includes(e.source) &&
                !deletedBranchIds.includes(e.target) &&
                !deletedBranchIds.some((id) => e.source === `${id}-end` || e.target === `${id}-end`)
        );
    
        const newEdges = addedBranches.flatMap((branch) => [
            {
                id: `edge-${conditionalNodeId}-${branch.id}`,
                source: conditionalNodeId,
                target: branch.id,
                type: 'step',
            },
            {
                id: `edge-${branch.id}-${branch.id}-end`,
                source: branch.id,
                target: `${branch.id}-end`,
                type: 'addBtn',
            },
        ]);
    
        return [...remainingEdges, ...newEdges];
    };    
    
    // Function: Handle Delete
    const handleDelete = () => {

        // IF conditional, delete downstream first
        if (selectedNode.type === 'conditional') {
            handleDeleteDownstream(selectedNode.id, nodes, edges, setNodes, setEdges);

        // Else, delete only node - connect the edge
        } else {
            handleDeleteConnectedEdges(selectedNode.id, nodes, edges, setNodes, setEdges);
        }

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
                    {/* {selectedNode?.type == 'action' && (
                        <div>
                            <button
                                type="button"
                                className="text-blue-600 text-sm mb-4"
                                onClick={() => alert('Add field clicked!')}
                            >
                                + Add field
                            </button>
                        </div>
                    )} */}

                    {/* FOR IF ELSE NODE */}
                    {/* Render Conditional Node Form */}
                    {selectedNode?.type === 'conditional' && (
                        <ConditionalNodeForm 
                            branches={branches}
                            setBranches={setBranches}
                        />
                    )}

                    {/* Error Message */}
                    {error && <p className="text-red-500 text-sm mb-10">{error}</p>}

                    <div className='flex flex-row w-full justify-between'>
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
