import Expander from '../../components/Expander';
import NumberInput from '../../components/NumberInput';
import Switch from '../../components/Switch';
import { useState, useEffect } from 'react';
import { 
  defaultValues,
  constraints 
} from '../../config/validation';

export default function DemSettingsContent(showAll = true, initialValues = {}, t = (_, fb) => fb) {
    const [blurRadius, setBlurRadius] = useState(initialValues.blur_radius ?? defaultValues.blurRadius);
    const [waterDepth, setWaterDepth] = useState(initialValues.water_depth ?? defaultValues.waterDepth);
    const [addFoundations, setAddFoundations] = useState(initialValues.add_foundations ?? defaultValues.addFoundations);
    const addFoundationsSummary = addFoundations ? " │ Add foundations" : "";
    const [plateau, setPlateau] = useState(initialValues.plateau ?? defaultValues.plateau);
    const [ceiling, setCeiling] = useState(initialValues.ceiling ?? defaultValues.ceiling);

    // Update state when initialValues change (for duplication feature)
    useEffect(() => {
        if (Object.keys(initialValues).length > 0) {
            setBlurRadius(initialValues.blur_radius ?? defaultValues.blurRadius);
            setWaterDepth(initialValues.water_depth ?? defaultValues.waterDepth);
            setAddFoundations(initialValues.add_foundations ?? defaultValues.addFoundations);
            setPlateau(initialValues.plateau ?? defaultValues.plateau);
            setCeiling(initialValues.ceiling ?? defaultValues.ceiling);
        }
    }, [initialValues]);

    const expanderSummary = `Blur radius: ${blurRadius} │ Water depth: ${waterDepth}${addFoundationsSummary}`;

    const values = {
        blurRadius: blurRadius,
        waterDepth: waterDepth,
        addFoundations: addFoundations,
        plateau: plateau,
        ceiling: ceiling,
    };

    return { 
        content: <Expander
            label={t('generation_settings.dem.label', 'DEM Settings')}
            summary={expanderSummary}
            tooltip={t('generation_settings.dem.tooltip', 'Settings related to the Digital Elevation Model (DEM) generation.')}
            labelWidth='w-40'
            size="sm"
        >
            <NumberInput
                label={t('generation_settings.dem.fields.blur_radius.label', 'Blur radius')}
                value={blurRadius}
                onChange={setBlurRadius}
                step={1}
                labelWidth='w-40'
                tooltip={t('generation_settings.dem.fields.blur_radius.tooltip', 'Use to blur the elevation map. Without blurring the terrain may look too sharp and unrealistic. You can increase this value to make the terrain more smooth. Or make it smaller to make the terrain more sharp.')}
                size="sm"
                min={constraints.blurRadius.min}
                max={constraints.blurRadius.max}
            />
            <NumberInput
                label={t('generation_settings.dem.fields.water_depth.label', 'Water Depth')}
                value={waterDepth}
                onChange={setWaterDepth}
                step={1}
                labelWidth='w-40'
                tooltip={t('generation_settings.dem.fields.water_depth.tooltip', 'Water depth value will be subtracted from the DEM image, making the water deeper. The pixel value used for this is calculated based on the heightScale value for your map.')}
                size="sm"
                min={constraints.waterDepth.min}
                max={constraints.waterDepth.max}
            />
            <Switch
                label={t('generation_settings.dem.fields.add_foundations.label', 'Add Foundations')}
                checked={addFoundations}
                onChange={setAddFoundations}
                labelWidth='w-40'
                tooltip={t('generation_settings.dem.fields.add_foundations.tooltip', 'Enable this option to add foundations to the terrain.')}
                size="sm"
            />

            {showAll && (
                <>
                    <NumberInput
                        label={t('generation_settings.dem.fields.plateau.label', 'Plateau')}
                        value={plateau}
                        onChange={setPlateau}
                        step={1}
                        labelWidth='w-40'
                        tooltip={t('generation_settings.dem.fields.plateau.tooltip', 'Custom plateau value.')}
                        size="sm"
                        min={constraints.plateau.min}
                        max={constraints.plateau.max}
                    />
                    <NumberInput
                        label={t('generation_settings.dem.fields.ceiling.label', 'Ceiling')}
                        value={ceiling}
                        onChange={setCeiling}
                        step={1}
                        labelWidth='w-40'
                        tooltip={t('generation_settings.dem.fields.ceiling.tooltip', 'Custom ceiling value.')}
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