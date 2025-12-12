import Expander from '@/components/Expander';
import NumberInput from '@/components/NumberInput';
import Switch from '@/components/Switch';
import { useState, useEffect } from 'react';
import { 
    defaultValues,
    constraints
} from '@/config/validation';

export default function BackgroundSettingsContent(showAll = false, onPublic = false, initialValues = {}){
    const [generateBackground, setGenerateBackground] = useState(initialValues.generate_background ?? defaultValues.generateBackground);
    const [generateWater, setGenerateWater] = useState(initialValues.generate_water ?? defaultValues.generateWater);
    const generateBackgroundSummary = generateBackground ? " │ Generate background" : "";
    const generateWaterSummary = generateWater ? " │ Generate water" : "";
    const [waterBlurriness, setWaterBlurriness] = useState(initialValues.water_blurriness ?? defaultValues.waterBlurriness);
    const [removeCenter, setRemoveCenter] = useState(initialValues.remove_center ?? defaultValues.removeCenter);
    const [flattenRoads, setFlattenRoads] = useState(initialValues.flatten_roads ?? defaultValues.flattenRoads);
    const [flattenWater, setFlattenWater] = useState(initialValues.flatten_water ?? defaultValues.flattenWater);

    // Update state when initialValues change (for duplication feature)
    useEffect(() => {
        if (Object.keys(initialValues).length > 0) {
            setGenerateBackground(initialValues.generate_background ?? defaultValues.generateBackground);
            setGenerateWater(initialValues.generate_water ?? defaultValues.generateWater);
            setWaterBlurriness(initialValues.water_blurriness ?? defaultValues.waterBlurriness);
            setRemoveCenter(initialValues.remove_center ?? defaultValues.removeCenter);
            setFlattenRoads(initialValues.flatten_roads ?? defaultValues.flattenRoads);
            setFlattenWater(initialValues.flatten_water ?? defaultValues.flattenWater);
        }
    }, [initialValues]);

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
                        disabled={onPublic}
                        disabledTooltip="This setting is not available in the public version of the app."
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