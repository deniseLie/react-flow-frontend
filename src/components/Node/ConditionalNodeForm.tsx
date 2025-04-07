import React, { useState } from "react";
import { Branch } from "../../types/types";

interface ConditionalNodeFormProps {
    branches: Branch[]
    setBranches: Function
}

const ConditionalNodeForm: React.FC<ConditionalNodeFormProps> = ({ branches, setBranches }) => {

    // Function : Handle Branch Name Change
    const handleBranchName = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setBranches((prev: Branch[]) => prev.map((b: Branch) => 
            b.id == id 
                ? { ...b, label: event.target.value }
                : b
            )
        )
    }

    // Function: Handle Else Branch Name Change
    const updateElseBr = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBranches((prev: Branch[]) => prev.map((b: Branch) => 
            b.type == 'else'
                ? { ...b, label: event.target.value }
                : b
           )
        )
    }

    // Function : Handle Add Branch
    const addBranch = (event: React.MouseEvent) => {
        event.preventDefault();
        setBranches((prev: Branch[]) => [
            ...prev, 
            { id: crypto.randomUUID(), label: `Branch #${prev.length}`, type: 'branch' }
        ]);
    };   

    // Function : Handle Delete Branch
    const handleDeleteBranch = (id: string) => {
        setBranches((prev: Branch[]) => prev.filter((branch: Branch) => branch.id !== id))
    }

    // Function : Add Filter on branhc
    const addFilter = (branch: any) => {
        console.log("FILTER", branch);
    }

    return (
        <div>
            {/* Branch */}
            <label className="block text-sm font-medium mb-1">BRANCHES</label>
            
            {/* {branches?.map((branch: Branch, index: any) => ( */}
            {branches
                ?.filter((branch: Branch) => branch.type !== 'else')
                ?.map((branch: Branch, index: any) => (
                    <div key={index} className="border p-4 my-2 rounded">
                        <div className="flex flex-row">
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 mb-4 mr-5"
                                value={branch?.label}
                                onChange={(event) => handleBranchName(event, branch.id)}
                            />
                            <button
                                onClick={() => handleDeleteBranch(branch.id)}
                            >
                                X
                            </button>
                        </div>
                        {/* <button onClick={() => addFilter(branch)}>
                            + Add filter
                        </button> */}
                    </div>
                )
            )}

            <div className="mb-10">
                <button onClick={(e) => addBranch(e)}>+ Add branch</button>
            </div>

            {/* Else */}
            <label className="block text-sm font-medium mb-1">ELSE</label>
            <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                value={branches.find(branch => branch.type === 'else')?.label || ''}
                onChange={(e) => updateElseBr(e)}
            />
        </div>
    )
}

export default ConditionalNodeForm;