import Expander from '@/components/Expander';
import NumberInput from '@/components/NumberInput';
import Switch from '@/components/Switch';
import { useState, useEffect } from 'react';
import { 
    defaultValues,
    constraints
} from '@/config/validation';

export default function SatelliteSettingsContent(showAll = false, onPublic = false, initialValues = {}){
    const [downloadImages, setDownloadImages] = useState(initialValues.download_images ?? defaultValues.downloadImages);
    const downloadImagesSummary = downloadImages ? "Download images     " : "";
    const [zoomLevel, setZoomLevel] = useState(initialValues.zoom_level ?? defaultValues.zoomLevel);

    // Update state when initialValues change (for duplication feature)
    useEffect(() => {
        if (Object.keys(initialValues).length > 0) {
            setDownloadImages(initialValues.download_images ?? defaultValues.downloadImages);
            setZoomLevel(initialValues.zoom_level ?? defaultValues.zoomLevel);
        }
    }, [initialValues]);

    const expanderSummary = `${downloadImagesSummary} | Zoom level: ${zoomLevel}`.replace(/^ \| /, '');
    const maxZoomLevel = onPublic ? 16 : constraints.zoomLevel.max;

    const values = {
        downloadImages: downloadImages,
        zoomLevel: zoomLevel
    };

    return { 
        content: <Expander
            label="Satellite Settings"
            summary={expanderSummary}
            tooltip="Settings related to the satellite imagery."
            labelWidth='w-40'
            size="sm"
        >
            <Switch
                label="Download Images"
                checked={downloadImages}
                onChange={setDownloadImages}
                labelWidth='w-40'
                tooltip="Enable this option to download satellite images."
                size="sm"
            />

            <NumberInput
                label="Zoom Level"
                value={zoomLevel}
                onChange={setZoomLevel}
                step={1}
                labelWidth='w-40'
                tooltip="Adjust the zoom level for satellite imagery."
                size="sm"
                min={constraints.zoomLevel.min}
                max={maxZoomLevel}
            />

            {showAll && (
                <>
                </>
            )}
        </Expander>,
        values
    };
}