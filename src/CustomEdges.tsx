import { BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath, useReactFlow } from '@xyflow/react';

const shiftAmount = 200; 

export const AddBtnEdge: React.FC<EdgeProps> = ({
    id, source, target, sourceX, sourceY, targetX, targetY 
}) => {
    const { setEdges, setNodes } = useReactFlow();
    const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY });
    
    // Calculate the middle of the edge to position the button
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    const handleClick = () => {
        // console.log("\n");
        // console.log("ID", id)

        const newNodeId = `node-${Date.now()}`;
        const newEdge1Id = `edge-${source}-${newNodeId}`;
        const newEdge2Id = `edge-${newNodeId}-${target}`;
        
        // console.log("TARGET", target)
        // console.log("NODES")

        // add nodes
        setNodes((nodes: any[]) => {
            // First, find the target node to know its Y position
            const targetNode = nodes.find((node) => node.id === target);
            if (!targetNode) return nodes;

            // console.log("targetNode", targetNode);

            return nodes.map((node: any) => {
                // console.log(node)

                // If it's target node, move it down
                if (node.position.y >= targetNode.position.y) {
                    return {
                        ...node,
                        position: { 
                            ...node.position, 
                            y: node.position.y + shiftAmount 
                        },
                    };
                }

                return node;
            }).concat({
                id: newNodeId,
                position: { 
                    x: (targetNode.position.x + sourceX) / 2 - 60, 
                    y: targetNode.position.y,
                    // x: sourceX - 120, 
                    // y: sourceY + 100 
                },
                type: 'action',
                data: {}
            })
        })

        // Replace edge with two new eges
        setEdges((edges: any[]) => [
            ...edges.filter((e: any) => e.id !== id), // remove original edge
            {
                id: newEdge1Id,
                source,
                target: newNodeId,
                type: 'addBtn',
            }, 
            {
                id: newEdge2Id,
                source: newNodeId,
                target,
                type: 'addBtn',
            },
        ]);
    };

    return (
        <>
            <BaseEdge id={id} path={edgePath} className='border-4 border-gray-400'/>
            <EdgeLabelRenderer>
                <button
                    onClick={handleClick}
                    style={{
                        position: 'absolute',
                        left: `${midX}px`,
                        top: `${midY}px`,
                        transform: `translate(-50%, -50%)`, // Center the button,
                        pointerEvents: 'all',
                    }}
                >
                    <p className='text-gray-400 text-2xl p-1 bg-white'>+</p>
                </button>
            </EdgeLabelRenderer>
        </>
    )
}

export const edgeTypes = {
    addBtn: AddBtnEdge,
}