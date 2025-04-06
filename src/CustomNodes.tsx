import React, { useState } from "react"
import { Handle, Position, useReactFlow } from "@xyflow/react"

interface NodeProps {
    data: {
      label: string
    }
}

export const StartNode: React.FC = () => {
    return (
        <div className="flex flex-row border border-solid border-gray-300 rounded-lg px-4 py-4 items-center space-x-3 w-60">
            {/* Image Placeholder */}
            <div className="w-10 h-10 bg-green-100 flex items-center justify-center rounded-md">
                <img src="/start_icon.png" alt="Start Icon" className="fit" />
            </div>

            {/* Text */}
            <div>
                <p className="text-green-600 font-bold text-sm">Start Node</p>
                <p className="text-gray-700 font-semibold text-sm">Start</p>
            </div>

            {/* Connection Handle */}
            <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }}/>
        </div>
    )
}

export const EndNode: React.FC = () => {
    return (
        <>
            <div className="border border-gray-400 rounded-4xl px-25 py-4 w-60 bg-gray-200">
                <p className="text-gray-400 text-sm font-semibold">END</p>
            </div>
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }}/>
        </>
    )
}

export const ActionNode: React.FC<NodeProps> = ({ data }) => {
    return (
        <div className="flex flex-row border border-solid border-gray-300 rounded-lg px-4 py-4 items-center space-x-3 w-60">
            {/* Image Placeholder */}
            <div className="w-10 h-10 bg-green-100 flex items-center justify-center rounded-md">
                <img src="/action_icon.png" alt="Action Icon" className="fit" />
            </div>

            {/* Text */}
            <div>
                <p className="text-gray-700 font-semibold text-sm">{data?.label ?? 'Action Node'}</p>
            </div>

            {/* Connection Handle */}
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }}/>
            <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }}/>
        </div>
    )
}

export const ConditionalNode: React.FC<NodeProps> = ({ data }) => {
    return (
        <div className="flex flex-row border border-solid border-gray-300 rounded-lg px-4 py-4 items-center space-x-3 w-60">
            {/* Image Placeholder */}
            <div className="w-10 h-10 bg-green-100 flex items-center justify-center rounded-md">
                <img src="/cond_icon.png" alt="Action Icon" className="fit" />
            </div>

            {/* Text */}
            <div>
                <p className="text-gray-700 font-semibold text-sm">If Else</p>
            </div>

            {/* Connection Handle */}
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }}/>
            <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }}/>
        </div>
    )
}

export const BranchNode: React.FC = () => {
    return (
        <>
            <div className="border border-gray-400 rounded-4xl px-25 py-4 w-60 bg-gray-200">
                <p className="text-gray-400 text-sm font-semibold">BRANCH#</p>
            </div>
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }}/>
            <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }}/>
        </>
    )
}

export const nodeTypes = {
    start: StartNode,
    end: EndNode,
    action: ActionNode,
    conditional: ConditionalNode,
    branch: BranchNode
}