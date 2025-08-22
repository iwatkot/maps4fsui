import Expander from '../../components/Expander';
import NumberInput from '../../components/NumberInput';
import Switch from '../../components/Switch';
import { useState } from 'react';
import { 
  defaultValues,
  constraints 
} from '../../config/validation';

export default function demSettings(showAll = true){
    const [blurRadius, setBlurRadius] = useState(defaultValues.blurRadius);
    const [waterDepth, setWaterDepth] = useState(defaultValues.waterDepth);
    const [addFoundations, setAddFoundations] = useState(defaultValues.addFoundations);
    const addFoundationsSummary = addFoundations ? " │ Add foundations" : "";
    const [plateau, setPlateau] = useState(defaultValues.plateau);
    const [ceiling, setCeiling] = useState(defaultValues.ceiling);


    const values = {
        blurRadius: blurRadius,
        waterDepth: waterDepth,
        addFoundations: addFoundations,
        plateau: plateau,
        ceiling: ceiling,
    };

    return { 
        content: <Expander
            label="DEM Settings"
            summary={`Blur radius: ${blurRadius} │ Water depth: ${waterDepth}${addFoundationsSummary}`}
            tooltip="Settings related to the Digital Elevation Model (DEM) generation."
            labelWidth='w-40'
            size="sm"
        >
            <NumberInput
                label="Blur radius"
                value={blurRadius}
                onChange={setBlurRadius}
                step={1}
                labelWidth='w-40'
                tooltip="Use to blur the elevation map. Without blurring the terrain may look too sharp and unrealistic. You can increase this value to make the terrain more smooth. Or make it smaller to make the terrain more sharp."
                size="sm"
                min={constraints.blurRadius.min}
                max={constraints.blurRadius.max}
            />
            <NumberInput
                label="Water Depth"
                value={waterDepth}
                onChange={setWaterDepth}
                step={1}
                labelWidth='w-40'
                tooltip="Water depth value will be subtracted from the DEM image, making the water deeper. The pixel value used for this is calculated based on the heightScale value for your map."
                size="sm"
                min={constraints.waterDepth.min}
                max={constraints.waterDepth.max}
            />
            <Switch
                label="Add Foundations"
                checked={addFoundations}
                onChange={setAddFoundations}
                labelWidth='w-40'
                tooltip="Enable this option to add foundations to the terrain."
                size="sm"
            />

            {showAll && (
                <>
                    <NumberInput
                        label="Plateau"
                        value={plateau}
                        onChange={setPlateau}
                        step={1}
                        labelWidth='w-40'
                        tooltip="Custom plateau value."
                        size="sm"
                        min={constraints.plateau.min}
                        max={constraints.plateau.max}
                    />
                    <NumberInput
                        label="Ceiling"
                        value={ceiling}
                        onChange={setCeiling}
                        step={1}
                        labelWidth='w-40'
                        tooltip="Custom ceiling value."
                        size="sm"
                        min={constraints.ceiling.min}
                        max={constraints.ceiling.max}
                    />
                </>
            )}
        </Expander>,
        values
    };
}