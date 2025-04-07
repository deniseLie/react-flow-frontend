import React, { useState, useEffect } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import ConditionalNodeForm from './ConditionalNodeForm';
import { Branch } from '../../types/types';
import { deleteDownstream, isDownstream } from '../../utils/utils';

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

        // Validate the branches for correct configuration
        console.log(branches);
        if (branches.length <= 1) {
            setError('At least one each if and else branch is required.');
            return; // Prevent submission
        }

        // No error, proceed to update nodes
        setError(null); // Reset error state

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

        // Find the rightmost branch excluding the 'else' node
        const rightmostBranch = selectedNode.data.branches
            ?.filter((branchNode: any) => branchNode.type !== 'else')  // Exclude the 'else' node
            .slice(-1)[0];  // Get the last element of the filtered array

        if (!rightmostBranch) {
            console.error('No valid branch node found!');
            return remainingNodes;  // If no valid branch node is found, return the remaining nodes as they are.
        }

        // Find the node corresponding to the rightmost branch
        const rightmostBranchNode = nodes.find((node: any) => node.id === rightmostBranch.id);

        if (!rightmostBranchNode) {
            console.error('No node found for the rightmost branch!');
            return remainingNodes;  // If no node is found for the branch, return the remaining nodes.
        }
        // Calculate even X positions for added branches
        let previousX = rightmostBranchNode.position.x || 100;
        let previousY = rightmostBranchNode.position.y || 200;
        
        // Calculate even X positions for added branches
        const newNodes = addedBranches.map((branch) => {
            const xPosition = previousX; 
            const yPosition = previousY; 
            console.log('Branch X:', branch); 

            const branchNode = {
                id: branch.id,
                position: { x: xPosition, y: yPosition },
                type: 'branch',
                data: { label: branch.label },
            };
    
            const endNode = {
                id: `${branch.id}-end`,
                position: { x: xPosition, y: yPosition + 200 }, // Slightly adjust Y for end node
                type: 'end',
                data: { label: 'END' },
            };

            // Update the previous X and Y for the next branch
            previousX += 250;

            return [branchNode, endNode];
        }).flat();

        // Add the "else" node at the rightmost end
        const elseNodeNew = {
            ...rightmostBranchNode,
            position: { x: previousX + addedBranches.length * 250, y: previousY },  // Position the "else" node after all branches
        };

        // Shift all nodes connected to the "else" node to the same X position
        const updatedNodes = remainingNodes.map((node) => {
            // If the node is connected to the "else" node, move it to the same X position
            if (isDownstream(node, elseNodeNew, edges)) {
                console.log("elseNodeNew", elseNodeNew)
                return {
                    ...node,
                    position: { x: previousX + 250, y: node.position.y },  // Set X to the "else" node's X
                };
            }
            return node;
        });
    
        return [...updatedNodes, ...newNodes, elseNodeNew];
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
            deleteDownstream(selectedNode.id, setNodes, setEdges, edges);

            // Find the previous node connected to the selected node
            const previousEdge = edges.find((e: any) => e.target === selectedNode.id);
            const previousNodeId = previousEdge ? previousEdge.source : null;

            // If a previous node exists, connect it to a new end node
            if (previousNodeId) {
                const previousNode = nodes.find((n: any) => n.id === previousNodeId); // Get the previous node

                if (previousNode) {

                    // If a previous node exists, connect it to a new end node
                    const newEndNodeId = `${previousNodeId}-end`;  // End node ID
                    const newEndNode = {
                        id: newEndNodeId,
                        position: { x: previousNode.position.x, y: previousNode.position.y + 150 },
                        type: 'end',
                        data: { label: 'END' },
                    };

                    // Create new edge connecting previous node to the new end node
                    const newEdge = {
                        id: `edge-${previousNodeId}-end`,  // Unique edge ID
                        source: previousNodeId,            // Source node is the previous node
                        target: newEndNodeId,              // Target is the new end node
                        type: 'addBtn',                    // Edge type (you can adjust this based on your needs)
                    };

                    // Add the new end node and the new edge
                    setNodes((prevNodes) => [...prevNodes, newEndNode]);
                    setEdges((prevEdges) => [...prevEdges, newEdge]);   
                }
            }
        } else {

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
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

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
