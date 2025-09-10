import Expander from '@/components/Expander';
import NumberInput from '@/components/NumberInput';
import Switch from '@/components/Switch';
import { useState, useEffect } from 'react';
import { 
    defaultValues,
    constraints
} from '@/config/validation';

export default function I3dSettingsContent(showAll = false, onPublic = false, initialValues = {}){
    const [addTrees, setAddTrees] = useState(initialValues.add_trees ?? defaultValues.addTrees);
    const addTreesSummary = addTrees ? " │ Add trees" : "";
    const [forestDensity, setForestDensity] = useState(initialValues.forest_density ?? defaultValues.forestDensity);
    const forestDensitySummary = ` │ Forest density: ${forestDensity}`;
    const [treeLimit, setTreeLimit] = useState(initialValues.tree_limit ?? defaultValues.treeLimit);
    const treeLimitSummary = ` │ Tree limit: ${treeLimit}`;

    const [treesRelativeShift, setTreesRelativeShift] = useState(initialValues.trees_relative_shift ?? defaultValues.treesRelativeShift);
    const [splineDensity, setSplineDensity] = useState(initialValues.spline_density ?? defaultValues.splineDensity);

    // Update state when initialValues change (for duplication feature)
    useEffect(() => {
        if (Object.keys(initialValues).length > 0) {
            console.log('I3D Settings: Applying initial values', initialValues);
            setAddTrees(initialValues.add_trees ?? defaultValues.addTrees);
            setForestDensity(initialValues.forest_density ?? defaultValues.forestDensity);
            setTreeLimit(initialValues.tree_limit ?? defaultValues.treeLimit);
            setTreesRelativeShift(initialValues.trees_relative_shift ?? defaultValues.treesRelativeShift);
            setSplineDensity(initialValues.spline_density ?? defaultValues.splineDensity);
        }
    }, [initialValues]);

    const expanderSummary = `${addTreesSummary}${forestDensitySummary}${treeLimitSummary}`.replace(/^ \│ /, '');

    const values = {
        addTrees: addTrees,
        forestDensity: forestDensity,
        treeLimit: treeLimit,
        treesRelativeShift: treesRelativeShift,
        splineDensity: splineDensity,
        addReversedSplines: true, // The setting will be derprecated an not shown in the UI.
        fieldSplines: true // The setting will be derprecated an not shown in the UI.
    };

    return { 
        content: <Expander
            label="I3D Settings"
            summary={expanderSummary}
            tooltip="Settings related to the I3D generation."    
            labelWidth='w-40'
            size="sm"
        >
            <Switch
                label="Add Trees"
                checked={addTrees}
                onChange={setAddTrees}
                size="sm"
                labelWidth='w-40'
                tooltip="Enable this option to add trees to the map."
            />

            <NumberInput
                label="Forest Density"
                value={forestDensity}
                onChange={setForestDensity}
                min={constraints.forestDensity.min}
                max={constraints.forestDensity.max}
                size="sm"
                labelWidth='w-40'
                tooltip="Set the distance between trees."
            />

            <NumberInput
                label="Tree Limit"
                value={treeLimit}
                onChange={setTreeLimit}
                min={constraints.treeLimit.min}
                max={constraints.treeLimit.max}
                size="sm"
                labelWidth='w-40'
                tooltip="Sets the soft limit for the number of trees on the map. If set to 0, there will be no limit."
            />

            {showAll && (
                <>
                </>
            )}
        </Expander>,
        values
    };
}