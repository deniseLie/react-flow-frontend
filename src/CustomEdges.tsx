import { BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath } from '@xyflow/react';
 
export const AddBtnEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, targetX, targetY }) => {
    const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
    
    // Calculate the middle of the edge to position the button
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    const handleClick = () => {
        console.log("BUTTON CLICKED")
    }

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