import Expander from '@/components/Expander';
import NumberInput from '@/components/NumberInput';
import Switch from '@/components/Switch';
import { useState } from 'react';
import { 
    defaultValues,
    constraints
} from '@/config/validation';

export default function demSettings(showAll = false, onPublic = false){
    const [generateBackground, setGenerateBackground] = useState(defaultValues.generateBackground);
    const [generateWater, setGenerateWater] = useState(defaultValues.generateWater);
    const generateBackgroundSummary = generateBackground ? " │ Generate background" : "";
    const generateWaterSummary = generateWater ? " │ Generate water" : "";
    const [waterBlurriness, setWaterBlurriness] = useState(defaultValues.waterBlurriness);
    const [removeCenter, setRemoveCenter] = useState(defaultValues.removeCenter);
    const [flattenRoads, setFlattenRoads] = useState(defaultValues.flattenRoads);
    const [flattenWater, setFlattenWater] = useState(defaultValues.flattenWater);

    const expanderSummary = `${generateBackgroundSummary}${generateWaterSummary}`.replace(/^ \│ /, '');

    const values = {
        generateBackground: generateBackground,
        generateWater: generateWater,
        waterBlurriness: waterBlurriness,
        removeCenter: removeCenter,
        flattenRoads: flattenRoads,
        flattenWater: flattenWater
    };

    return { 
        content: <Expander
            label="Background Settings"
            summary={expanderSummary}
            tooltip="Settings related to the background generation."    
            labelWidth='w-40'
            size="sm"
        >
            <Switch
                label="Generate Background"
                checked={generateBackground}
                onChange={setGenerateBackground}
                size="sm"
                labelWidth='w-40'
                tooltip="Enable this option to generate a background terrain mesh for the map."
            />
            <Switch
                label="Generate Water"
                checked={generateWater}
                onChange={setGenerateWater}
                size="sm"
                labelWidth='w-40'
                tooltip="Enable this option to generate water meshes for the map."
            />


            {showAll && (
                <>
                    <NumberInput
                        label="Water Blurriness"
                        value={waterBlurriness}
                        onChange={setWaterBlurriness}
                        step={1}
                        labelWidth='w-40'
                        tooltip="Use to blur the water mesh. Increasing this value will make the water appear more smooth."
                        size="sm"
                        min={constraints.waterBlurriness.min}
                        max={constraints.waterBlurriness.max}
                    />
                    <Switch
                        label="Remove Center"
                        checked={removeCenter}
                        onChange={setRemoveCenter}
                        labelWidth='w-40'
                        tooltip="Enable this option to remove the center part of the background terrain mesh, which is usually covered by the main terrain."
                        size="sm"
                    />
                    <Switch
                        label="Flatten Roads"
                        checked={flattenRoads}
                        onChange={setFlattenRoads}
                        labelWidth='w-40'
                        tooltip="Enable this option to flatten the terrain under the roads, making them more drivable."
                        size="sm"
                    />
                    <Switch
                        label="Flatten Water"
                        checked={flattenWater}
                        onChange={setFlattenWater}
                        labelWidth='w-40'
                        tooltip="Enable this option to flatten the bottom under the water resources."
                        size="sm"
                    />
                </>
            )}
        </Expander>,
        values
    };
}