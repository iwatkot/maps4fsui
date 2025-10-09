'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import HelpStructuredData from '@/components/HelpStructuredData';
import TextInput from '@/components/TextInput';
import Checkbox from '@/components/Checkbox';
import JSONEditorModal from '@/components/JSONEditorModal';
import TextEditorModal from '@/components/TextEditorModal';
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

  // Troubleshooting states
  const [troubleshootingStep, setTroubleshootingStep] = useState(1);
  const [troubleshootingChecklist, setTroubleshootingChecklist] = useState({
    systemRequirements: false,
    dockerVersion: false,
    dockerProperlyInstalled: false,
    containerStatus: false,
    containerLogs: false,
    resourceUsage: false,
    dockerEvents: false,
    accessibility: false
  });
  
  const [troubleshootingData, setTroubleshootingData] = useState({
    hardwareSpecs: '',
    dockerVersionOutput: '',
    containerStatusOutput: '',
    apiContainerLogs: '',
    uiContainerLogs: '',
    dockerEventsLog: '',
    apiAccessibilityCheck: '',
    uiAccessibilityCheck: ''
  });
  
  const [textModal, setTextModal] = useState({
    isOpen: false,
    title: '',
    field: '',
    data: ''
  });

  const [copySuccess, setCopySuccess] = useState(false);

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

  // Troubleshooting helper functions
  const handleTroubleshootingChecklistChange = (key, value) => {
    setTroubleshootingChecklist(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const isTroubleshootingChecklistComplete = () => {
    return Object.values(troubleshootingChecklist).every(Boolean);
  };

  const isTroubleshootingDataCollectionComplete = () => {
    return Object.values(troubleshootingData).every(data => data && data.trim());
  };

  const isTroubleshootingFullyComplete = () => {
    return isTroubleshootingChecklistComplete() && isTroubleshootingDataCollectionComplete();
  };

  const getTroubleshootingCompletionPercentage = () => {
    const checklistCompleted = Object.values(troubleshootingChecklist).filter(Boolean).length;
    const dataCompleted = Object.values(troubleshootingData).filter(data => data && data.trim()).length;
    const totalItems = Object.keys(troubleshootingChecklist).length + Object.keys(troubleshootingData).length;
    return Math.round(((checklistCompleted + dataCompleted) / totalItems) * 100);
  };

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

  const openTextEditor = (field, title) => {
    setTextModal({
      isOpen: true,
      title,
      field,
      data: troubleshootingData[field] || ''
    });
  };

  const handleTextSave = (textData) => {
    setTroubleshootingData(prev => ({
      ...prev,
      [textModal.field]: textData
    }));
    setTextModal({ isOpen: false, title: '', field: '', data: '' });
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

## Pre-submission Checklist

- [x] I have read the FAQ
- [x] I understand that map data comes from OpenStreetMap
- [x] I have verified that the required data exists on OpenStreetMap for my area
- [x] I understand what a texture schema is
- [x] I have verified that my texture schema contains the OSM tags for the objects I'm missing (if texture-related)

## Basic Information

- **Map coordinates:** ${formData.coordinates}
- **Map size:** ${formData.mapSize}
- **Game version:** ${formData.gameVersion}
- **Maps4FS version:** ${formData.maps4fsVersion}

## Technical Files

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

  const generateTroubleshootingReport = () => {
    const timestamp = new Date().toISOString();
    
    let report = `# Maps4FS Troubleshooting Report\n\n`;
    report += `**Generated on:** ${timestamp}\n`;
    report += `**Completion:** ${getTroubleshootingCompletionPercentage()}%\n\n`;
    
    // Add checklist status
    report += `## Troubleshooting Checklist Status\n\n`;
    const reportChecklistItems = [
      { key: 'systemRequirements', label: 'My machine meets the system requirements' },
      { key: 'dockerVersion', label: 'I have checked the Docker version and run the hello-world container' },
      { key: 'dockerProperlyInstalled', label: 'I have ensured that Docker is properly installed and configured' },
      { key: 'containerStatus', label: 'I have checked the status of both containers (API and UI) and they are running' },
      { key: 'containerLogs', label: 'I have checked the logs for both containers' },
      { key: 'resourceUsage', label: 'I have checked the resource usage (CPU, RAM) during the container runtime' },
      { key: 'dockerEvents', label: 'I have checked the Docker events for any relevant information' },
      { key: 'accessibility', label: 'I have checked accessibility of both containers (API and UI)' }
    ];
    
    reportChecklistItems.forEach(item => {
      const status = troubleshootingChecklist[item.key] ? '✅' : '❌';
      report += `- ${status} ${item.label}\n`;
    });
    
    // Add collected data
    report += `\n## System Information and Command Outputs\n\n`;
    
    if (troubleshootingData.hardwareSpecs) {
      report += `### Hardware Specifications and OS Information\n\`\`\`\n${troubleshootingData.hardwareSpecs}\n\`\`\`\n\n`;
    }
    
    if (troubleshootingData.dockerVersionOutput) {
      report += `### Docker Version and Hello-World Test\n\`\`\`\n${troubleshootingData.dockerVersionOutput}\n\`\`\`\n\n`;
    }
    
    if (troubleshootingData.containerStatusOutput) {
      report += `### Container Status\n\`\`\`\n${troubleshootingData.containerStatusOutput}\n\`\`\`\n\n`;
    }
    
    if (troubleshootingData.apiContainerLogs) {
      report += `### API Container Logs\n\`\`\`\n${troubleshootingData.apiContainerLogs}\n\`\`\`\n\n`;
    }
    
    if (troubleshootingData.uiContainerLogs) {
      report += `### UI Container Logs\n\`\`\`\n${troubleshootingData.uiContainerLogs}\n\`\`\`\n\n`;
    }
    
    if (troubleshootingData.dockerEventsLog) {
      report += `### Docker Events Log\n\`\`\`\n${troubleshootingData.dockerEventsLog}\n\`\`\`\n\n`;
    }
    
    if (troubleshootingData.apiAccessibilityCheck) {
      report += `### API Accessibility Check\n\`\`\`\n${troubleshootingData.apiAccessibilityCheck}\n\`\`\`\n\n`;
    }
    
    if (troubleshootingData.uiAccessibilityCheck) {
      report += `### UI Accessibility Check\n\`\`\`\n${troubleshootingData.uiAccessibilityCheck}\n\`\`\`\n\n`;
    }
    
    report += `---\n*This troubleshooting report was generated using the Maps4FS Docker Troubleshooting Helper.*\n`;
    
    return report;
  };

  const downloadTroubleshootingReport = () => {
    const report = generateTroubleshootingReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maps4fs_troubleshooting_report_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyTroubleshootingReportToClipboard = async () => {
    try {
      const report = generateTroubleshootingReport();
      await navigator.clipboard.writeText(report);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error('Error copying report:', error);
      // Instead of alert, we'll show an error message in the UI
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Step 1: Which version are you using?
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
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-4 flex-shrink-0"></div>
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
            <div className="w-4 h-4 bg-gray-500 rounded-full mr-4 flex-shrink-0"></div>
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
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentStep(1)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          title="Go Back"
        >
          <i className="zmdi zmdi-arrow-left text-xl"></i>
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Step 2: Is the tool working?
        </h2>
      </div>
      <div className="space-y-4">
        <button
          onClick={() => {
            setIsToolWorking(true);
            setCurrentStep(3);
          }}
          className="w-full p-4 text-left border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors bg-white dark:bg-gray-800"
        >
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-4 flex-shrink-0"></div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">Yes, it&apos;s working</div>
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
              // Local deployment not working - show troubleshooting options
              setCurrentStep('local-not-working');
            }
          }}
          className="w-full p-4 text-left border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 dark:hover:border-red-400 transition-colors bg-white dark:bg-gray-800"
        >
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-4 flex-shrink-0"></div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">No, it&apos;s not working</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isPublicVersion 
                  ? 'Tool doesn&apos;t load or crashes immediately' 
                  : 'Setup issues, crashes, or won&apos;t start'
                }
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const checklistItems = [
    {
      key: 'systemRequirements',
      label: 'My machine meets the system requirements',
      description: 'Ensure your hardware and OS meet minimum requirements'
    },
    {
      key: 'dockerVersion',
      label: 'I have checked the Docker version and run the hello-world container',
      description: 'Run: docker --version && docker run --rm hello-world'
    },
    {
      key: 'dockerProperlyInstalled',
      label: 'I have ensured that Docker is properly installed and configured',
      description: 'Docker should be running without issues'
    },
    {
      key: 'containerStatus',
      label: 'I have checked the status of both containers (API and UI) and they are running',
      description: 'Run: docker ps --filter "name=maps4fs"'
    },
    {
      key: 'containerLogs',
      label: 'I have checked the logs for both containers',
      description: 'Run: docker logs maps4fsapi && docker logs maps4fsui'
    },
    {
      key: 'resourceUsage',
      label: 'I have checked the resource usage (CPU, RAM) during the container runtime',
      description: 'Monitor system resources during container operation'
    },
    {
      key: 'dockerEvents',
      label: 'I have checked the Docker events for any relevant information',
      description: 'Run: docker events --since 24h'
    },
    {
      key: 'accessibility',
      label: 'I have checked accessibility of both containers (API and UI)',
      description: 'Test API: curl http://localhost:8000/info/version and UI: curl http://localhost:3000'
    }
  ];

  const renderLocalNotWorking = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentStep(2)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          title="Go Back"
        >
          <i className="zmdi zmdi-arrow-left text-xl"></i>
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Docker Troubleshooting Helper
        </h2>
      </div>

      {/* Progress indicator */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{getTroubleshootingCompletionPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getTroubleshootingCompletionPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Step 1: Checklist */}
      {troubleshootingStep === 1 && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Step 1: Complete Troubleshooting Checklist
            </h2>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Check off each item as you complete the troubleshooting steps. Click the commands to see what to run.
            </p>
          </div>

          <div className="space-y-4">
            {checklistItems.map((item) => (
              <div key={item.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <Checkbox
                  label={item.label}
                  checked={troubleshootingChecklist[item.key]}
                  onChange={(value) => handleTroubleshootingChecklistChange(item.key, value)}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-6">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {!isTroubleshootingChecklistComplete() && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <i className="zmdi zmdi-info mr-2"></i>
                Complete all checklist items to continue to the next step.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setTroubleshootingStep(2)}
              disabled={!isTroubleshootingChecklistComplete()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isTroubleshootingChecklistComplete()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue to Data Collection
              <i className="zmdi zmdi-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Data Collection */}
      {troubleshootingStep === 2 && (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              Step 2: Collect System Information and Command Outputs
            </h2>
            <p className="text-green-800 dark:text-green-200 text-sm">
              Run the suggested commands and paste their outputs using the text editors below.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { key: 'hardwareSpecs', title: 'Hardware Specifications and OS Information', command: 'Include hardware specs and OS version' },
              { key: 'dockerVersionOutput', title: 'Docker Version and Hello-World Test', command: 'docker --version && docker run --rm hello-world' },
              { key: 'containerStatusOutput', title: 'Container Status', command: 'docker ps --filter "name=maps4fs"' },
              { key: 'apiContainerLogs', title: 'API Container Logs', command: 'docker logs maps4fsapi > maps4fsapi.log' },
              { key: 'uiContainerLogs', title: 'UI Container Logs', command: 'docker logs maps4fsui > maps4fsui.log' },
              { key: 'dockerEventsLog', title: 'Docker Events Log', command: 'docker events --since 24h > docker_events.log' },
              { key: 'apiAccessibilityCheck', title: 'API Accessibility Check', command: 'Invoke-WebRequest -Uri http://localhost:8000/info/version -UseBasicParsing' },
              { key: 'uiAccessibilityCheck', title: 'UI Accessibility Check', command: 'Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing' }
            ].map((item) => (
              <div key={item.key} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.title}</h4>
                      {troubleshootingData[item.key] && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded">
                          <i className="zmdi zmdi-check-circle mr-1"></i>
                          Added
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Command: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{item.command}</code></p>
                  </div>
                  <button
                    onClick={() => openTextEditor(item.key, item.title)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      troubleshootingData[item.key] 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {troubleshootingData[item.key] ? 'Edit' : 'Add Output'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setTroubleshootingStep(1)}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              <i className="zmdi zmdi-arrow-left mr-2"></i>
              Back to Checklist
            </button>
            <button
              onClick={() => setTroubleshootingStep(3)}
              disabled={!isTroubleshootingDataCollectionComplete()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isTroubleshootingDataCollectionComplete()
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Generate Report
              <i className="zmdi zmdi-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Report Generation */}
      {troubleshootingStep === 3 && (
        <div className="space-y-6">
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
              Step 3: Generate Troubleshooting Report
            </h2>
            <p className="text-purple-800 dark:text-purple-200 text-sm">
              Your troubleshooting report is ready. Download it and share it when asking for help.
            </p>
          </div>

          {/* Warning if not fully complete */}
          {!isTroubleshootingFullyComplete() && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <i className="zmdi zmdi-alert-triangle text-red-600 dark:text-red-400 mr-3"></i>
                <div>
                  <h3 className="text-red-800 dark:text-red-200 font-medium">Incomplete Data</h3>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    Your report may be incomplete. Please go back and ensure all checklist items are checked and all data is collected.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success message for copy */}
          {copySuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <i className="zmdi zmdi-check-circle text-green-600 dark:text-green-400 mr-3"></i>
                <div>
                  <h3 className="text-green-800 dark:text-green-200 font-medium">Report Copied!</h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    The troubleshooting report has been copied to your clipboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Report Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Checklist Completion:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {Object.values(troubleshootingChecklist).filter(Boolean).length}/{Object.keys(troubleshootingChecklist).length} items
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Data Collection:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {Object.values(troubleshootingData).filter(data => data && data.trim()).length}/{Object.keys(troubleshootingData).length} fields
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Overall Progress:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{getTroubleshootingCompletionPercentage()}%</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                <span className={`ml-2 ${isTroubleshootingFullyComplete() ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {isTroubleshootingFullyComplete() ? 'Complete' : 'Incomplete'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setTroubleshootingStep(2)}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              <i className="zmdi zmdi-arrow-left mr-2"></i>
              Back to Data Collection
            </button>
            <div className="flex space-x-3">
              <button
                onClick={copyTroubleshootingReportToClipboard}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                <i className="zmdi zmdi-copy mr-2"></i>
                Copy Report
              </button>
              <button
                onClick={downloadTroubleshootingReport}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                <i className="zmdi zmdi-download mr-2"></i>
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPublicNotWorking = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentStep(2)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          title="Go Back"
        >
          <i className="zmdi zmdi-arrow-left text-xl"></i>
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Public App Issues
        </h2>
      </div>
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
              If the public app is not working (won&apos;t load, crashes immediately), I don&apos;t accept reports for these issues. 
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
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentStep(2)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          title="Go Back"
        >
          <i className="zmdi zmdi-arrow-left text-xl"></i>
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Step 3: DTM Provider Check
        </h2>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Please confirm which DTM provider you are using:
      </p>
      <div className="space-y-4">
        <Checkbox
          label="I am using SRTM30 DTM provider"
          checked={dtmProvider === 'SRTM30'}
          onChange={(checked) => setDtmProvider(checked ? 'SRTM30' : '')}
          size="md"
        />
      </div>
      {!dtmProvider && (
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
                I only provide support for the <strong>SRTM30</strong> DTM provider. For issues with other providers, 
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
      {dtmProvider === 'SRTM30' && (
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
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentStep(3)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          title="Go Back"
        >
          <i className="zmdi zmdi-arrow-left text-xl"></i>
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Step 4: Pre-submission Checklist
        </h2>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Before submitting your issue, you MUST confirm ALL of the following:
      </p>
      
      <div className="space-y-4">
        {[
          { key: 'readFaq', label: 'I have read the FAQ', link: 'https://maps4fs.gitbook.io/docs/getting-started/faq' },
          { key: 'understandOsm', label: 'I understand that map data comes from OpenStreetMap', link: 'https://www.openstreetmap.org/' },
          { key: 'verifiedOsmData', label: 'I have verified that the required data exists on OpenStreetMap for my area', link: null },
          { key: 'understandTextureSchema', label: 'I understand what a texture schema is', link: 'https://maps4fs.gitbook.io/docs/understanding-the-basics/texture_schema' },
          { key: 'verifiedTextureSchema', label: 'I have verified that my texture schema contains the OSM tags for the objects I\'m missing (if texture-related)', link: null }
        ].map(({ key, label, link }) => (
          <Checkbox
            key={key}
            id={key}
            label={(
              <span>
                {label}
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="zmdi zmdi-link text-xs"></i>
                  </a>
                )}
              </span>
            )}
            checked={checklist[key]}
            onChange={(checked) => handleChecklistChange(key)}
            size="md"
            className="mb-4"
          />
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
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentStep(4)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          title="Go Back"
        >
          <i className="zmdi zmdi-arrow-left text-xl"></i>
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Step 5: Information Collection
        </h2>
      </div>
      
      {!isFormComplete && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Please fill out all fields below to proceed with generating your help request.
          </p>
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Required Information</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please locate these JSON files in your map generation output folder and copy their contents:
          </p>
          <div className="space-y-4">
            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">generation_info.json</h4>
                    {formData.generationInfo && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded">
                        <i className="zmdi zmdi-check-circle mr-1"></i>
                        Added
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contains technical details about your map</p>
                </div>
                <button
                  onClick={() => openJsonEditor('generationInfo', 'Generation Info')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    formData.generationInfo 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {formData.generationInfo ? 'Edit' : 'Add Content'}
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">main_settings.json</h4>
                    {formData.mainSettings && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded">
                        <i className="zmdi zmdi-check-circle mr-1"></i>
                        Added
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Main configuration settings</p>
                </div>
                <button
                  onClick={() => openJsonEditor('mainSettings', 'Main Settings')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    formData.mainSettings 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {formData.mainSettings ? 'Edit' : 'Add Content'}
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">generation_settings.json</h4>
                    {formData.generationSettings && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded">
                        <i className="zmdi zmdi-check-circle mr-1"></i>
                        Added
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your map generation settings</p>
                </div>
                <button
                  onClick={() => openJsonEditor('generationSettings', 'Generation Settings')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    formData.generationSettings 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {formData.generationSettings ? 'Edit' : 'Add Content'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isFormComplete && (
          <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              Ready to Submit!
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              All information has been collected. Generate your help report below and share it in Discord when asking for assistance.
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
    <>
      <HelpStructuredData />
      <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden" style={{ minWidth: '1000px' }}>
        {/* Shared App Header */}
        <AppHeader 
          showTabs={false}
          customTitle="Get Help"
          onBackClick={() => router.back()}
        />

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 'local-not-working' && renderLocalNotWorking()}
            {currentStep === 'public-not-working' && renderPublicNotWorking()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>
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
      
      {/* Text Editor Modal */}
      <TextEditorModal
        isOpen={textModal.isOpen}
        onClose={() => setTextModal({ isOpen: false, title: '', field: '', data: '' })}
        onSave={handleTextSave}
        textData={textModal.data}
        title={textModal.title}
      />
      </div>
    </>
  );
}