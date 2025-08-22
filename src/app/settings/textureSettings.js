import Expander from '@/components/Expander';
import NumberInput from '@/components/NumberInput';
import Switch from '@/components/Switch';
import { useState } from 'react';
import { 
    defaultValues,
    constraints
} from '@/config/validation';

export default function TextureSettingsContent(showAll = false, onPublic = false){
    const [fieldsPadding, setFieldsPadding] = useState(defaultValues.fieldsPadding);
    const [dissolve, setDissolve] = useState(defaultValues.dissolve);
    const dissolveSummary = dissolve ? " │ Dissolve" : "";
    const [skipDrains, setSkipDrains] = useState(defaultValues.skipDrains);
    const skipDrainsSummary = skipDrains ? " │ Skip drains" : "";
    const [useCache, setUseCache] = useState(defaultValues.useCache);
    const [usePreciseTags, setUsePreciseTags] = useState(defaultValues.usePreciseTags);

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