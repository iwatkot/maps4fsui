'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TextInput from '@/components/TextInput';
import JSONEditorModal from '@/components/JSONEditorModal';
import config from '@/app/config';

export default function HelpPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublicVersion, setIsPublicVersion] = useState(null);
  const [isToolWorking, setIsToolWorking] = useState(null);
  const [dtmProvider, setDtmProvider] = useState('');
  
  // Checklist states
  const [checklist, setChecklist] = useState({
    readFaq: false,
    understandOsm: false,
    verifiedOsmData: false,
    understandTextureSchema: false,
    verifiedTextureSchema: false
  });
  
  // Form data
  const [formData, setFormData] = useState({
    coordinates: '',
    mapSize: '',
    gameVersion: '',
    maps4fsVersion: '',
    generationInfo: '',
    mainSettings: '',
    generationSettings: ''
  });
  
  // JSON Editor modal states
  const [jsonModal, setJsonModal] = useState({
    isOpen: false,
    type: '',
    title: '',
    data: ''
  });

  // Determine if we're on public version
  useEffect(() => {
    setIsPublicVersion(config.isPublicVersion);
  }, []);

  const handleChecklistChange = (key) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isChecklistComplete = Object.values(checklist).every(Boolean);
  const isFormComplete = Object.values(formData).every(value => value.trim() !== '');

  const openJsonEditor = (type, title) => {
    // Try to parse existing data as JSON, or use empty object if invalid/empty
    let initialData = {};
    if (formData[type]) {
      try {
        initialData = JSON.parse(formData[type]);
      } catch (e) {
        initialData = {}; // Use empty object if parsing fails
      }
    }
    
    setJsonModal({
      isOpen: true,
      type,
      title,
      data: initialData
    });
  };

  const handleJsonSave = (jsonData) => {
    const jsonString = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData, null, 2);
    setFormData(prev => ({
      ...prev,
      [jsonModal.type]: jsonString
    }));
    setJsonModal({ isOpen: false, type: '', title: '', data: '' });
  };

  const generateMarkdownReport = () => {
    const timestamp = new Date().toISOString();
    const appType = isPublicVersion ? 'Public App' : 'Local Deployment';
    const toolStatus = isToolWorking ? 'Working' : 'Not Working';
    
    const markdown = `# Maps4FS Help Request

**Generated on:** ${timestamp}
**App Type:** ${appType}
**Tool Status:** ${toolStatus}
${dtmProvider ? `**DTM Provider:** ${dtmProvider}` : ''}

## Pre-submission Checklist ✅

- [x] I have read the FAQ
- [x] I understand that map data comes from OpenStreetMap
- [x] I have verified that the required data exists on OpenStreetMap for my area
- [x] I understand what a texture schema is
- [x] I have verified that my texture schema contains the OSM tags for the objects I'm missing (if texture-related)

## Basic Information 📍

- **Map coordinates:** ${formData.coordinates}
- **Map size:** ${formData.mapSize}
- **Game version:** ${formData.gameVersion}
- **Maps4FS version:** ${formData.maps4fsVersion}

## Technical Files 📁

### generation_info.json
\`\`\`json
${formData.generationInfo}
\`\`\`

### main_settings.json
\`\`\`json
${formData.mainSettings}
\`\`\`

### generation_settings.json
\`\`\`json
${formData.generationSettings}
\`\`\`

---
*This report was generated using the Maps4FS interactive help system.*
`;

    // Create and download the markdown file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maps4fs-help-request-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        🚀 Step 1: Which version are you using?
      </h2>
      <div className="space-y-4">
        <button
          onClick={() => {
            setIsPublicVersion(true);
            setCurrentStep(2);
          }}
          className="w-full p-4 text-left border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-white dark:bg-gray-800"
        >
          <div className="flex items-center">
            <div className="text-2xl mr-4">🌐</div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">Public App</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Using the online version at maps4fs.xyz</div>
            </div>
          </div>
        </button>
        <button
          onClick={() => {
            setIsPublicVersion(false);
            setCurrentStep(2);
          }}
          className="w-full p-4 text-left border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-white dark:bg-gray-800"
        >
          <div className="flex items-center">
            <div className="text-2xl mr-4">💻</div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">Local Deployment</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Running the tool on your own machine</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Step 2: Is the tool working?
      </h2>
      <div className="space-y-4">
        <button
          onClick={() => {
            setIsToolWorking(true);
            setCurrentStep(3);
          }}
          className="w-full p-4 text-left border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors bg-white dark:bg-gray-800"
        >
          <div className="flex items-center">
            <div className="text-2xl mr-4">✅</div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">Yes, it's working</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tool loads and functions, but has issues with results</div>
            </div>
          </div>
        </button>
        <button
          onClick={() => {
            setIsToolWorking(false);
            if (isPublicVersion) {
              // Public version not working - show info about reports not being accepted
              setCurrentStep('public-not-working');
            } else {
              // Local deployment not working - link to troubleshooting
              window.open('https://maps4fs.gitbook.io/docs/setup-and-installation/local_deployment#troubleshooting', '_blank');
            }
          }}
          className="w-full p-4 text-left border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 dark:hover:border-red-400 transition-colors bg-white dark:bg-gray-800"
        >
          <div className="flex items-center">
            <div className="text-2xl mr-4">❌</div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">No, it's not working</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isPublicVersion 
                  ? 'Tool doesn\'t load or crashes immediately' 
                  : 'Setup issues, crashes, or won\'t start'
                }
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderPublicNotWorking = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        ℹ️ Public App Issues
      </h2>
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex">
          <div className="text-yellow-600 dark:text-yellow-400 mr-3">
            <i className="zmdi zmdi-info text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Reports Not Accepted for Public App Issues
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              If the public app is not working (won't load, crashes immediately), we don't accept reports for these issues. 
              This is typically due to server maintenance or temporary outages.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                <strong>Recommended solutions:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
                <li>Try again later when the service is restored</li>
                <li>Deploy the tool locally for consistent availability</li>
                <li>Check our Discord for service status updates</li>
              </ul>
            </div>
            <div className="mt-4 flex space-x-3">
              <a
                href="https://maps4fs.gitbook.io/docs/setup-and-installation/local_deployment"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <i className="zmdi zmdi-download mr-2"></i>
                Local Deployment Guide
              </a>
              <a
                href="https://discord.gg/Sj5QKKyE42"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <i className="zmdi zmdi-comments mr-2"></i>
                Discord Server
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        🗺️ Step 3: DTM Provider Check
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Which DTM provider are you using for your map generation?
      </p>
      <TextInput
        label="DTM Provider"
        value={dtmProvider}
        onChange={setDtmProvider}
        placeholder="e.g., SRTM30, ASTER, Copernicus..."
        labelWidth="w-32"
        size="sm"
      />
      {dtmProvider && dtmProvider.toLowerCase() !== 'srtm30' && (
        <div className="p-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex">
            <div className="text-orange-600 dark:text-orange-400 mr-3">
              <i className="zmdi zmdi-alert-triangle text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
                Unsupported DTM Provider
              </h3>
              <p className="text-orange-700 dark:text-orange-300 mb-4">
                We only provide support for the <strong>SRTM30</strong> DTM provider. For issues with other providers like {dtmProvider}, 
                please contact the authors of the pydtmdl library directly.
              </p>
              <a
                href="https://github.com/iwatkot/pydtmdl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <i className="zmdi zmdi-github mr-2"></i>
                Visit pydtmdl Repository
              </a>
            </div>
          </div>
        </div>
      )}
      {dtmProvider.toLowerCase() === 'srtm30' && (
        <div className="flex justify-end">
          <button
            onClick={() => setCurrentStep(4)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        ✅ Step 4: Pre-submission Checklist
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Before submitting your issue, you MUST confirm ALL of the following:
      </p>
      
      <div className="space-y-4">
        {[
          { key: 'readFaq', label: '📚 I have read the FAQ', link: 'https://maps4fs.gitbook.io/docs/getting-started/faq' },
          { key: 'understandOsm', label: '🗺️ I understand that map data comes from OpenStreetMap', link: 'https://www.openstreetmap.org/' },
          { key: 'verifiedOsmData', label: '🔍 I have verified that the required data exists on OpenStreetMap for my area', link: null },
          { key: 'understandTextureSchema', label: '🎨 I understand what a texture schema is', link: 'https://maps4fs.gitbook.io/docs/understanding-the-basics/texture_schema' },
          { key: 'verifiedTextureSchema', label: '🏷️ I have verified that my texture schema contains the OSM tags for the objects I\'m missing (if texture-related)', link: null }
        ].map(({ key, label, link }) => (
          <div key={key} className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={key}
              checked={checklist[key]}
              onChange={() => handleChecklistChange(key)}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor={key} className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-300">
              {label}
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <i className="zmdi zmdi-link text-xs"></i>
                </a>
              )}
            </label>
          </div>
        ))}
      </div>

      {isChecklistComplete && (
        <div className="flex justify-end">
          <button
            onClick={() => setCurrentStep(5)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Continue to Form
          </button>
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        📋 Step 5: Information Collection
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📍 Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Map Coordinates"
              value={formData.coordinates}
              onChange={(value) => setFormData(prev => ({ ...prev, coordinates: value }))}
              placeholder="45.2841, 20.2370"
              labelWidth="w-32"
              size="sm"
            />
            <TextInput
              label="Map Size"
              value={formData.mapSize}
              onChange={(value) => setFormData(prev => ({ ...prev, mapSize: value }))}
              placeholder="4x4 km"
              labelWidth="w-32"
              size="sm"
            />
            <TextInput
              label="Game Version"
              value={formData.gameVersion}
              onChange={(value) => setFormData(prev => ({ ...prev, gameVersion: value }))}
              placeholder="FS22 or FS25"
              labelWidth="w-32"
              size="sm"
            />
            <TextInput
              label="Maps4FS Version"
              value={formData.maps4fsVersion}
              onChange={(value) => setFormData(prev => ({ ...prev, maps4fsVersion: value }))}
              placeholder="Check in app footer"
              labelWidth="w-32"
              size="sm"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📁 Required Files</h3>
          <div className="space-y-4">
            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">generation_info.json</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contains technical details about your map</p>
                </div>
                <button
                  onClick={() => openJsonEditor('generationInfo', 'Generation Info')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {formData.generationInfo ? 'Edit JSON' : 'Add JSON'}
                </button>
              </div>
            </div>

            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">main_settings.json</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Main configuration settings</p>
                </div>
                <button
                  onClick={() => openJsonEditor('mainSettings', 'Main Settings')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {formData.mainSettings ? 'Edit JSON' : 'Add JSON'}
                </button>
              </div>
            </div>

            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">generation_settings.json</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your map generation settings</p>
                </div>
                <button
                  onClick={() => openJsonEditor('generationSettings', 'Generation Settings')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {formData.generationSettings ? 'Edit JSON' : 'Add JSON'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isFormComplete && (
          <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              🚀 Ready to Submit!
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              All information has been collected. Click the button below to generate a markdown report and get the Discord link.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={generateMarkdownReport}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center"
              >
                <i className="zmdi zmdi-download mr-2"></i>
                Generate Help Report
              </button>
              <a
                href="https://discord.gg/Sj5QKKyE42"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center"
              >
                <i className="zmdi zmdi-comments mr-2"></i>
                Open Discord
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                title="Go Back"
              >
                <i className="zmdi zmdi-arrow-left text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Maps4FS - Get Help
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 'public-not-working' && renderPublicNotWorking()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>
      </div>

      {/* JSON Editor Modal */}
      <JSONEditorModal
        isOpen={jsonModal.isOpen}
        onClose={() => setJsonModal({ isOpen: false, type: '', title: '', data: '' })}
        onSave={handleJsonSave}
        jsonData={jsonModal.data}
        title={jsonModal.title}
      />
    </div>
  );
}