import Expander from '../../components/Expander';
import NumberInput from '../../components/NumberInput';
import Switch from '../../components/Switch';
import { useState, useEffect } from 'react';
import { 
  defaultValues,
  constraints 
} from '../../config/validation';
import { getProviderSetting } from '../../config/providerSettings';

export default function DemSettingsContent(showAll = true, initialValues = {}, providerCode = null){
    // Track the provider that was set during duplication to avoid overriding duplication values
    const [duplicationProvider, setDuplicationProvider] = useState(null);
    const [initialValuesProcessed, setInitialValuesProcessed] = useState(false);
    
    // Helper function to get initial value with provider override consideration
    const getInitialValue = (settingName, defaultValue) => {
        // If we have initial values (duplication) with actual data, use them and ignore provider overrides
        if (Object.keys(initialValues).length > 0 && initialValues.hasOwnProperty(settingName)) {
            console.log(`DEM Settings: Using duplicated value for ${settingName}:`, initialValues[settingName]);
            return initialValues[settingName];
        }
        
        // Apply provider-specific override if available (only when not duplicating)
        const providerValue = getProviderSetting(providerCode, 'dem', settingName, defaultValue);
        if (providerValue !== defaultValue) {
            console.log(`DEM Settings: Using provider override for ${settingName}:`, providerValue);
        }
        return providerValue;
    };

    const [blurRadius, setBlurRadius] = useState(getInitialValue('blur_radius', defaultValues.blurRadius));
    const [waterDepth, setWaterDepth] = useState(getInitialValue('water_depth', defaultValues.waterDepth));
    const [addFoundations, setAddFoundations] = useState(getInitialValue('add_foundations', defaultValues.addFoundations));
    const addFoundationsSummary = addFoundations ? " │ Add foundations" : "";
    const [plateau, setPlateau] = useState(getInitialValue('plateau', defaultValues.plateau));
    const [ceiling, setCeiling] = useState(getInitialValue('ceiling', defaultValues.ceiling));

    // Update state when initialValues change (for duplication feature)
    useEffect(() => {
        if (Object.keys(initialValues).length > 0 && !initialValuesProcessed) {
            console.log('DEM Settings: Applying initial values from duplication', initialValues);
            setDuplicationProvider(providerCode); // Remember which provider was active during duplication
            setInitialValuesProcessed(true);
            setBlurRadius(initialValues.blur_radius ?? defaultValues.blurRadius);
            setWaterDepth(initialValues.water_depth ?? defaultValues.waterDepth);
            setAddFoundations(initialValues.add_foundations ?? defaultValues.addFoundations);
            setPlateau(initialValues.plateau ?? defaultValues.plateau);
            setCeiling(initialValues.ceiling ?? defaultValues.ceiling);
        }
    }, [initialValues, providerCode, initialValuesProcessed]);

    // Apply provider-specific overrides when provider changes
    useEffect(() => {
        // Only apply provider overrides if:
        // 1. We have a provider code
        // 2. We don't currently have initial values (not during duplication)
        if (providerCode && Object.keys(initialValues).length === 0) {
            // Skip provider overrides if this is the same provider that was active during duplication
            if (duplicationProvider === providerCode && initialValuesProcessed) {
                console.log('DEM Settings: Skipping provider overrides - same provider as during duplication');
                return;
            }
            
            // If user manually changed provider after duplication, reset duplication tracking
            if (duplicationProvider !== null && duplicationProvider !== providerCode) {
                console.log('DEM Settings: User changed provider after duplication, resetting duplication tracking');
                setDuplicationProvider(null);
                setInitialValuesProcessed(false);
            }
            
            console.log('DEM Settings: Applying provider-specific overrides for', providerCode);
            
            // Apply provider-specific overrides
            const providerBlurRadius = getProviderSetting(providerCode, 'dem', 'blurRadius', defaultValues.blurRadius);
            const providerWaterDepth = getProviderSetting(providerCode, 'dem', 'waterDepth', defaultValues.waterDepth);
            const providerAddFoundations = getProviderSetting(providerCode, 'dem', 'addFoundations', defaultValues.addFoundations);
            const providerPlateau = getProviderSetting(providerCode, 'dem', 'plateau', defaultValues.plateau);
            const providerCeiling = getProviderSetting(providerCode, 'dem', 'ceiling', defaultValues.ceiling);
            
            setBlurRadius(providerBlurRadius);
            setWaterDepth(providerWaterDepth);
            setAddFoundations(providerAddFoundations);
            setPlateau(providerPlateau);
            setCeiling(providerCeiling);
        }
    }, [providerCode, initialValues, duplicationProvider, initialValuesProcessed]);

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
            label="DEM Settings"
            summary={expanderSummary}
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