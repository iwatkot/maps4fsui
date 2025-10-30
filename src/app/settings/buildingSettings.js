import Expander from '@/components/Expander';
import NumberInput from '@/components/NumberInput';
import Switch from '@/components/Switch';
import Selector from '@/components/Selector';
import { useState, useEffect } from 'react';
import { 
    defaultValues,
    constraints
} from '@/config/validation';

const regionOptions = [
  { value: 'auto', label: 'Auto', description: 'Automatically select appropriate region based on coordinates' },
  { value: 'all', label: 'All', description: 'Mix buildings from all regions' },
  { value: 'EU', label: 'Europe', description: 'Use European buildings only' },
  { value: 'US', label: 'United States', description: 'Use US buildings only' }
];

export default function BuildingSettingsContent(showAll = false, onPublic = false, initialValues = {}){
    const [generateBuildings, setGenerateBuildings] = useState(initialValues.generate_buildings ?? defaultValues.generateBuildings);
    const [region, setRegion] = useState(initialValues.region ?? defaultValues.region);
    const [toleranceFactor, setToleranceFactor] = useState(initialValues.tolerance_factor ?? defaultValues.toleranceFactor);

    // Update state when initialValues change (for duplication feature)
    useEffect(() => {
        if (Object.keys(initialValues).length > 0) {
            console.log('Building Settings: Applying initial values', initialValues);
            setGenerateBuildings(initialValues.generate_buildings ?? defaultValues.generateBuildings);
            setRegion(initialValues.region ?? defaultValues.region);
            setToleranceFactor(initialValues.tolerance_factor ?? defaultValues.toleranceFactor);
        }
    }, [initialValues]);

    const generateBuildingsSummary = generateBuildings ? " │ Generate buildings" : "";
    const regionSummary = generateBuildings ? ` │ Region: ${region}` : "";
    const expanderSummary = `${generateBuildingsSummary}${regionSummary}`.replace(/^ \│ /, '');

    const values = {
        generateBuildings: generateBuildings,
        region: region,
        // Convert percentage to decimal for API (70 -> 0.7)
        toleranceFactor: toleranceFactor / 100
    };

    return { 
        content: <Expander
            label="Building Settings"
            summary={expanderSummary}
            tooltip="Settings related to building generation from OpenStreetMap data."    
            labelWidth='w-40'
            size="sm"
        >
            <Switch
                label="Generate Buildings"
                checked={generateBuildings}
                onChange={setGenerateBuildings}
                size="sm"
                labelWidth='w-40'
                tooltip="Enable this option to generate buildings from OpenStreetMap data."
            />
            <Selector
                label="Region"
                options={regionOptions}
                value={region}
                onChange={setRegion}
                placeholder="Select region..."
                labelWidth='w-40'
                tooltip="Choose which regional building styles to use. Auto selects based on coordinates, All mixes all regions."
                size="sm"
            />
            <NumberInput
                label="Tolerance Factor (%)"
                value={toleranceFactor}
                onChange={setToleranceFactor}
                step={1}
                labelWidth='w-40'
                tooltip="Affects building size precision. Lower values = more precise but may skip buildings. Higher values = more buildings but less accurate sizes."
                size="sm"
                min={constraints.toleranceFactor.min}
                max={constraints.toleranceFactor.max}
            />
        </Expander>,
        values
    };
}