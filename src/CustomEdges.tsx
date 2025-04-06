import { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath, useReactFlow } from '@xyflow/react';

const shiftAmount = 200; 
const mainNodeShiftAmount = 120;

export const AddBtnEdge: React.FC<EdgeProps> = ({
    id, source, target, sourceX, sourceY, targetX, targetY 
}) => {
    const { setEdges, setNodes } = useReactFlow();
    const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY });
    
    // Calculate the middle of the edge to position the button
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    // State for menu 
    const [menuVisible, setMenuVisible] = useState(false);
    const toggleMenuVisible = () => setMenuVisible(!menuVisible);

    const handleAddNode = (type: 'action' | 'conditional') => {
        const timestamp = Date.now();

        // Get Node names
        const newNodeId = `node-${timestamp}`;
        const ifBranchId = `if-${newNodeId}-${crypto.randomUUID()}`;
        const elseBranchId = `else-${newNodeId}`;
        const elseEndNodeId = `else-end-${timestamp + 1}`;

        const baseX = (sourceX + targetX) / 2;
    
        // add nodes
        setNodes((nodes: any[]) => {
            const targetNode = nodes.find((node) => node.id === target);
            if (!targetNode) return nodes;
            
            // Target and all nodes after that, move it down
            const shifted = nodes.map((node) => {

                // Action Node
                if (type === 'action') {
                    return node.position.y >= targetNode.position.y
                        ? { ...node, position: { ...node.position, y: node.position.y + shiftAmount } }
                        : node

                } else if (type == 'conditional') {
                    return node.position.y >= targetNode.position.y
                        ? { ...node, position: { x: baseX - 2*mainNodeShiftAmount - 10, y: node.position.y + 2*shiftAmount }}
                        : node
                }
            });
            
            const mainNode = {
                id: newNodeId,
                position: { x: baseX - mainNodeShiftAmount, y: targetNode.position.y },
                type,
                data: {
                    label: type === 'action' ? 'Action Node' : 'If / Else',
                    ...(type === 'conditional' && {
                        branches: [
                            { id: ifBranchId, label: 'Branch 1', type: 'if' },
                            { id: elseBranchId, label: 'Else', type: 'else' },
                        ],
                    }),
                }
            };

            const conditionalBranches = type === 'conditional'
                ? [
                    {
                        id: ifBranchId,
                        position: { x: baseX - 2*mainNodeShiftAmount - 10, y: targetNode.position.y + shiftAmount },
                        type: 'branch',
                        data: { label: 'BRANCH#1' },
                    },
                    {
                        id: elseBranchId,
                        position: { x: baseX + 10, y: targetNode.position.y + shiftAmount },
                        type: 'else',
                        data: { label: 'ELSE' },
                    },
                    {
                        id: elseEndNodeId,
                        position: { x: baseX + 10, y: targetNode.position.y + 2*shiftAmount },
                        type: 'end',
                        data: { label: 'END' },
                    },
                ]
                : [];

            return [...shifted, mainNode, ...conditionalBranches];
        });

        // SET EDGES
        setEdges((edges: any[]) => {
            const cleanedEdges = edges.filter((e: any) => e.id !== id); // remove original edge
            const entryEdge = {
                id: `edge-${source}-${newNodeId}`,
                source,
                target: newNodeId,
                type: 'addBtn',
            };

            // 1) ACTION NODE : Replace edge with two new eges
            if (type === 'action') {
                return [
                    ...cleanedEdges,
                    entryEdge,
                    {
                        id: `edge-${newNodeId}-${target}`,
                        source: newNodeId,
                        target,
                        type: 'addBtn',
                    },
                ];
        
            // 2) IF-ELSE NODE
            } else if (type == 'conditional') {
                return [
                    ...cleanedEdges,
                    entryEdge,
                    {
                        id: `edge-${newNodeId}-${ifBranchId}`, // ifelse-branch1
                        source: newNodeId,
                        target: ifBranchId,
                        type: 'addBtn',
                    },
                    {
                        id: `edge-${newNodeId}-${elseBranchId}`, // ifelse-branch2
                        source: newNodeId,
                        target: elseBranchId,
                        type: 'addBtn',
                    },
                    {
                        id: `edge-${ifBranchId}-${target}`, // branch1-end
                        source: ifBranchId,
                        target: target,
                        type: 'addBtn',
                    },
                    {
                        id: `edge-${elseBranchId}-${elseEndNodeId}`, // else-end
                        source: elseBranchId,
                        target: elseEndNodeId,
                        type: 'addBtn',
                    }
                ];
            }

            return cleanedEdges;
        });

        // Close menu
        toggleMenuVisible();
    };

    return (
        <>
            <BaseEdge id={id} path={edgePath} className='border-4 border-gray-400'/>
            <EdgeLabelRenderer>
            <div
                style={{
                    position: 'absolute',
                    left: `${midX}px`,
                    top: `${midY}px`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'all',
                    zIndex: 1000
                }}
            >
                <button
                    onClick={toggleMenuVisible}
                    className="bg-white px-2 py-1 text-xl text-gray-500 "
                >
                    +
                </button>

                {/* Menu choose actoin */}
                {menuVisible && (
                    <div className="absolute w-40 left-1/2 transform -translate-x-1/2 bg-white shadow rounded p-2 space-y-1 z-50">

                        {/* Close Button */}
                        <button className='absolute right-2 top-0' onClick={toggleMenuVisible}>
                            x
                        </button>

                        {/* Action Node */}
                        <button
                            onClick={() => handleAddNode('action')}
                            className="text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 w-full text-left"
                        >
                            Action Node
                        </button>

                        {/* Conditional node */}
                        <button
                            onClick={() => handleAddNode('conditional')}
                            className="text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 w-full text-left"
                        >
                            If / Else Node
                        </button>
                    </div>
                )}
            </div>
            </EdgeLabelRenderer>
        </>
    )
}

// export const ConditionalEdge: React.FC<EdgeProps> = ({
//     id, source, target, sourceX, sourceY, targetX, targetY 
// }) => {
//     return (
//         <div>
//            <BaseEdge id={id} path={edgePath} className='border-4 border-gray-400'/> 
//         </div>
//     )
// }

export const edgeTypes = {
    addBtn: AddBtnEdge,
}