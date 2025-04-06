import React, { useState } from "react";

interface ConditionalNodeFormProps {
    nodeName: string;
    setNodeName: React.Dispatch<React.SetStateAction<string>>;
}

const ConditionalNodeForm: React.FC<ConditionalNodeFormProps> = ({ 
    nodeName, setNodeName
}) => {

    const [branches, setBranches] = useState([{ id: crypto.randomUUID(), name: 'Branch 1' }]);
    const [elseBr, setElseBr] = useState('Else');

    // Function : Handle Branch Name Change
    const handleBranchName = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setBranches((prev) => prev.map((b) => 
            b.id == id 
                ? { ...b, name: event.target.value }
                : b
            )
        )
    }

    // Function : Handle Add Branch
    const addBranch = () => {
        console.log('add')
        setBranches((prevBr: any[]) => [
            ...prevBr, 
            { id: crypto.randomUUID(), name: `Branch #${prevBr.length + 1}`}
        ]);
    };   

    // Function : Handle Delete Branch
    const handleDeleteBranch = (id: string) => {
        setBranches(prevBrs => prevBrs.filter(prevBr => prevBr.id !== id))
    }

    // Function : Add Filter on branhc
    const addFilter = (branch: any) => {
        console.log(branch)
    }

    return (
        <div>
            {/* Branch */}
            <label className="block text-sm font-medium mb-1">BRANCHES</label>
            
            {branches?.map((branch, index) => (
                <div key={index} className="border p-4 my-2 rounded">
                    <div className="flex flex-row">
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 mr-5"
                            value={branch?.name}
                            onChange={(event) => handleBranchName(event, branch.id)}
                        />
                        <button
                            onClick={() => handleDeleteBranch(branch.id)}
                        >
                            X
                        </button>
                    </div>
                    <button
                        onClick={() => addFilter(branch)}
                    >
                        + Add filter
                    </button>
                </div>
            ))}

            <div className="mb-10">
                <button onClick={addBranch}>
                    + Add branch
                </button>
            </div>

            {/* Else */}
            <label className="block text-sm font-medium mb-1">ELSE</label>
            <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                value={elseBr}
                onChange={(e) => setElseBr(e.target.value)}
            />
        </div>
    )
}

export default ConditionalNodeForm;