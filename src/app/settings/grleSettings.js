import Expander from '@/components/Expander';
import NumberInput from '@/components/NumberInput';
import Switch from '@/components/Switch';
import Selector  from '@/components/Selector';  
import { useState, useEffect } from 'react';
import { 
    defaultValues,
    constraints
} from '@/config/validation';

export default function GrleSettingsContent(showAll = false, onPublic = false, initialValues = {}, t = (_, fb) => fb) {
    const [farmlandMargin, setFarmlandMargin] = useState(initialValues.farmland_margin ?? defaultValues.farmlandMargin);
    const [addGrass, setAddGrass] = useState(initialValues.add_grass ?? defaultValues.addGrass);
    const addGrassSummary = addGrass ? " │ Add grass" : "";
    const [randomPlants, setRandomPlants] = useState(initialValues.random_plants ?? defaultValues.randomPlants);
    const randomPlantsSummary = randomPlants ? " │ Random plants" : "";

    const [baseGrass, setBaseGrass] = useState(initialValues.base_grass ?? defaultValues.baseGrass);
    const [addFarmyards, setAddFarmyards] = useState(initialValues.add_farmyards ?? defaultValues.addFarmyards);
    const [basePrice, setBasePrice] = useState(initialValues.base_price ?? defaultValues.basePrice);

    // Update state when initialValues change (for duplication feature)
    useEffect(() => {
        if (Object.keys(initialValues).length > 0) {
            setFarmlandMargin(initialValues.farmland_margin ?? defaultValues.farmlandMargin);
            setAddGrass(initialValues.add_grass ?? defaultValues.addGrass);
            setRandomPlants(initialValues.random_plants ?? defaultValues.randomPlants);
            setBaseGrass(initialValues.base_grass ?? defaultValues.baseGrass);
            setAddFarmyards(initialValues.add_farmyards ?? defaultValues.addFarmyards);
            setBasePrice(initialValues.base_price ?? defaultValues.basePrice);
        }
    }, [initialValues]);

    const expanderSummary = `Farmland margin: ${farmlandMargin}${addGrassSummary}${randomPlantsSummary}`;

    const values = {
        farmlandMargin: farmlandMargin,
        addGrass: addGrass,
        randomPlants: randomPlants,
        baseGrass: baseGrass,
        addFarmyards: addFarmyards,
        fillEmptyFarmlands: true, // The setting will be derprecated an not shown in the UI.
        priceScale: 100, // The setting will be derprecated an not shown in the UI.
        basePrice: basePrice
    };

    return { 
        content: <Expander
            label={t('generation_settings.grle.label', 'GRLE Settings')}
            summary={expanderSummary}
            tooltip={t('generation_settings.grle.tooltip', 'Settings related to the GRLE generation.')}
            labelWidth='w-40'
            size="sm"
        >

            <NumberInput
                label={t('generation_settings.grle.fields.farmland_margin.label', 'Farmland Margin')}
                value={farmlandMargin}
                onChange={setFarmlandMargin}
                step={1}
                labelWidth='w-40'
                tooltip={t('generation_settings.grle.fields.farmland_margin.tooltip', 'The farmland margin value will make the farmlands bigger than on the OSM data.')}
                size="sm"
                min={constraints.farmlandMargin.min}
                max={constraints.farmlandMargin.max}
            />
            <Switch
                label={t('generation_settings.grle.fields.add_grass.label', 'Add Grass')}
                checked={addGrass}
                onChange={setAddGrass}
                tooltip={t('generation_settings.grle.fields.add_grass.tooltip', 'Enable or disable grass generation.')}
                size="sm"
                labelWidth='w-40'
            />
            <Switch
                label={t('generation_settings.grle.fields.random_plants.label', 'Random Plants')}
                checked={randomPlants}
                onChange={setRandomPlants}
                tooltip={t('generation_settings.grle.fields.random_plants.tooltip', 'Enable or disable random plant generation.')}
                size="sm"
                labelWidth='w-40'
            />

            {showAll && (
                <>
                    <Selector
                        label={t('generation_settings.grle.fields.base_grass.label', 'Base Grass')}
                        value={baseGrass}
                        onChange={setBaseGrass}
                        options={[
                            { value: "smallDenseMix", label: "Small Dense Mix" , description: "Decorative grass that can not be collected after mowing."},
                            { value: "meadow", label: "Meadow", description: "Can be mowed and collected."},
                        ]}
                        tooltip={t('generation_settings.grle.fields.base_grass.tooltip', 'Select the base grass type.')}
                        size="sm"
                        labelWidth='w-40'
                    />
                    <Switch
                        label={t('generation_settings.grle.fields.add_farmyards.label', 'Add Farmyards')}
                        checked={addFarmyards}
                        onChange={setAddFarmyards}
                        tooltip={t('generation_settings.grle.fields.add_farmyards.tooltip', 'If enabled, regions marked as farmyards on OSM data, will be added to the in-game buyable farmlands.')}
                        size="sm"
                        labelWidth='w-40'
                    />
                    <NumberInput
                        label={t('generation_settings.grle.fields.base_price.label', 'Base Price')}
                        value={basePrice}
                        onChange={setBasePrice}
                        step={1000}
                        labelWidth='w-40'
                        tooltip={t('generation_settings.grle.fields.base_price.tooltip', 'The base price for the farmland.')}
                        size="sm"
                        min={constraints.basePrice.min}
                        max={constraints.basePrice.max}
                    />
                </>
            )}
        </Expander>,
        values
    };
}