import Expander from '@/components/Expander';
import NumberInput from '@/components/NumberInput';
import Switch from '@/components/Switch';
import { useState, useEffect } from 'react';
import { 
    defaultValues,
    constraints
} from '@/config/validation';

export default function TextureSettingsContent(showAll = false, onPublic = false, initialValues = {}){
    const [fieldsPadding, setFieldsPadding] = useState(initialValues.fields_padding ?? defaultValues.fieldsPadding);
    const [dissolve, setDissolve] = useState(initialValues.dissolve ?? defaultValues.dissolve);
    const dissolveSummary = dissolve ? " │ Dissolve" : "";
    const [skipDrains, setSkipDrains] = useState(initialValues.skip_drains ?? defaultValues.skipDrains);
    const skipDrainsSummary = skipDrains ? " │ Skip drains" : "";
    const [useCache, setUseCache] = useState(initialValues.use_cache ?? defaultValues.useCache);
    const [usePreciseTags, setUsePreciseTags] = useState(initialValues.use_precise_tags ?? defaultValues.usePreciseTags);

    // Update state when initialValues change (for duplication feature)
    useEffect(() => {
        if (Object.keys(initialValues).length > 0) {
            setFieldsPadding(initialValues.fields_padding ?? defaultValues.fieldsPadding);
            setDissolve(initialValues.dissolve ?? defaultValues.dissolve);
            setSkipDrains(initialValues.skip_drains ?? defaultValues.skipDrains);
            setUseCache(initialValues.use_cache ?? defaultValues.useCache);
            setUsePreciseTags(initialValues.use_precise_tags ?? defaultValues.usePreciseTags);
        }
    }, [initialValues]);

    const expanderSummary = `Fields padding: ${fieldsPadding}${dissolveSummary}${skipDrainsSummary}`;

    const values = {
        fieldsPadding: fieldsPadding,
        dissolve: dissolve,
        skipDrains: skipDrains,
        useCache: useCache,
        usePreciseTags: usePreciseTags
    };

    return { 
        content: <Expander
            label="Texture Settings"
            summary={expanderSummary}
            tooltip="Settings related to the texture generation."
            labelWidth='w-40'
            size="sm"
        >
            <NumberInput
                label="Fields Padding"
                value={fieldsPadding}
                onChange={setFieldsPadding}
                step={1}
                labelWidth='w-40'
                tooltip="Makes the fields region bigger."
                size="sm"
                min={constraints.fieldsPadding.min}
                max={constraints.fieldsPadding.max}
            />
            <Switch
                label="Dissolve"
                checked={dissolve}
                onChange={setDissolve}
                labelWidth='w-40'
                tooltip="Enable this option to dissolve the texture edges."
                size="sm"
                disabled={onPublic}
                disabledTooltip="This setting is not available in the public version of the app."
            />
            <Switch
                label="Skip Drains"
                checked={skipDrains}
                onChange={setSkipDrains}
                labelWidth='w-40'
                tooltip="Enable this option to skip the drains in the texture generation."
                size="sm"
            />


            {showAll && (
                <>
                <Switch
                    label="Use Cache"
                    checked={useCache}
                    onChange={setUseCache}
                    labelWidth='w-40'
                    tooltip="Enable this option to use cached textures."
                    size="sm"
                />
                <Switch
                    label="Use Precise Tags"
                    checked={usePreciseTags}
                    onChange={setUsePreciseTags}
                    labelWidth='w-40'
                    tooltip="Enable this option to use precise tags for texture generation."
                    size="sm"
                />
                </>
            )}
        </Expander>,
        values
    };
}