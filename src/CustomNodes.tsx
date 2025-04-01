import React from "react"
import { Handle, NodeProps, Position } from "@xyflow/react"

export const StartNode: React.FC<NodeProps> = () => {
    return (
        <div >
            {/* Image */}
            <div className="w-10 h-10 mr-2">
                {/* <img src="/start_icon.png" alt="Start Icon" className="w-full h-full object-contain" /> */}
            </div>

            {/* Text */}
            <div>
                <p className="text-sm font-semibold">Start Node</p>
                <p className="text-xs text-gray-600">Start</p>
            </div>

            {/* Handle for connecting edges */}
            <Handle type="source" position={Position.Bottom} className="bg-blue-500" />
        </div>
    )
}

export const EndNode: React.FC<NodeProps> = () => {
    return (
        <>
            <div
                style={{

                }}
            >
                <p>END</p>
            </div>
            <Handle type="source" position={Position.Top} />
        </>
    )
}

export const nodeTypes = {
    start: StartNode,
    end: EndNode
}