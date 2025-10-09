'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import Checkbox from '@/components/Checkbox';
import TextEditorModal from '@/components/TextEditorModal';
import TextInput from '@/components/TextInput';

export default function TroubleshootingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Checklist states
  const [checklist, setChecklist] = useState({
    dockerVersion: false,
    dockerProperlyInstalled: false,
    containersRunning: false,
    logsChecked: false,
    resourceUsageChecked: false,
    dockerEventsChecked: false,
    accessibilityChecked: false
  });

  // Form data for logs and outputs
  const [formData, setFormData] = useState({
    hardwareSpecs: '',
    dockerVersionOutput: '',
    helloWorldOutput: '',
    containerStatusOutput: '',
    apiLogsOutput: '',
    uiLogsOutput: '',
    dockerEventsOutput: '',
    apiAccessibilityOutput: '',
    uiAccessibilityOutput: ''
  });

  // Text Editor modal states
  const [textModal, setTextModal] = useState({
    isOpen: false,
    type: '',
    title: '',
    data: '',
    placeholder: ''
  });

  const checklistItems = [
    {
      key: 'dockerVersion',
      label: 'I have checked the Docker version and run the hello-world container.',
      description: 'Run: docker --version and docker run --rm hello-world'
    },
    {
      key: 'dockerProperlyInstalled',
      label: 'I have ensured that Docker is properly installed and configured.',
      description: 'Docker commands work without errors'
    },
    {
      key: 'containersRunning',
      label: 'I have checked the status of both containers (API and UI) and they are running.',
      description: 'Run: docker ps --filter "name=maps4fs"'
    },
    {
      key: 'logsChecked',
      label: 'I have checked the logs for both containers.',
      description: 'Run: docker logs maps4fsapi and docker logs maps4fsui'
    },
    {
      key: 'resourceUsageChecked',
      label: 'I have checked the resource usage (CPU, RAM) during the container runtime.',
      description: 'Monitor system resources during map generation'
    },
    {
      key: 'dockerEventsChecked',
      label: 'I have checked the Docker events for any relevant information.',
      description: 'Run: docker events --since 24h'
    },
    {
      key: 'accessibilityChecked',
      label: 'I have checked accessibility of both containers (API and UI).',
      description: 'Test API and UI endpoints are responding'
    }
  ];

  const dataItems = [
    {
      key: 'hardwareSpecs',
      title: 'Hardware Specifications and OS Information',
      command: 'Provide your system specifications manually',
      placeholder: 'Paste your hardware specs and OS version information here...'
    },
    {
      key: 'dockerVersionOutput',
      title: 'Docker Version Output',
      command: 'docker --version',
      placeholder: 'Paste the output of: docker --version'
    },
    {
      key: 'helloWorldOutput',
      title: 'Docker Hello-World Output',
      command: 'docker run --rm hello-world',
      placeholder: 'Paste the output of: docker run --rm hello-world'
    },
    {
      key: 'containerStatusOutput',
      title: 'Container Status Output',
      command: 'docker ps --filter "name=maps4fs"',
      placeholder: 'Paste the output of: docker ps --filter "name=maps4fs"'
    },
    {
      key: 'apiLogsOutput',
      title: 'API Container Logs',
      command: 'docker logs maps4fsapi',
      placeholder: 'Paste the output of: docker logs maps4fsapi'
    },
    {
      key: 'uiLogsOutput',
      title: 'UI Container Logs',
      command: 'docker logs maps4fsui',
      placeholder: 'Paste the output of: docker logs maps4fsui'
    },
    {
      key: 'dockerEventsOutput',
      title: 'Docker Events Output',
      command: 'docker events --since 24h > docker_events.log',
      placeholder: 'Paste the output of: docker events --since 24h'
    },
    {
      key: 'apiAccessibilityOutput',
      title: 'API Accessibility Check Output',
      command: 'Invoke-WebRequest -Uri http://localhost:8000/info/version -UseBasicParsing',
      placeholder: 'Paste the output of: Invoke-WebRequest -Uri http://localhost:8000/info/version -UseBasicParsing'
    },
    {
      key: 'uiAccessibilityOutput',
      title: 'UI Accessibility Check Output',
      command: 'Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing',
      placeholder: 'Paste the output of: Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing'
    }
  ];

  const handleChecklistChange = (key, value) => {
    setChecklist(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const openTextModal = (key) => {
    const item = dataItems.find(item => item.key === key);
    setTextModal({
      isOpen: true,
      type: key,
      title: item.title,
      data: formData[key] || '',
      placeholder: item.placeholder
    });
  };

  const handleTextModalSave = (text) => {
    setFormData(prev => ({
      ...prev,
      [textModal.type]: text
    }));
    // Close the modal after saving
    setTextModal({
      isOpen: false,
      type: '',
      title: '',
      data: '',
      placeholder: ''
    });
  };

  const generateMarkdownReport = () => {
    const checkedItems = Object.entries(checklist).filter(([key, value]) => value);
    const uncheckedItems = Object.entries(checklist).filter(([key, value]) => !value);
    
    let report = `# Maps4FS Troubleshooting Report\n\n`;
    report += `Generated on: ${new Date().toISOString()}\n\n`;
    
    report += `## Checklist Status\n\n`;
    report += `### Completed Steps (${checkedItems.length}/${Object.keys(checklist).length})\n\n`;
    checkedItems.forEach(([key]) => {
      const item = checklistItems.find(item => item.key === key);
      report += `- [x] ${item.label}\n`;
    });
    
    if (uncheckedItems.length > 0) {
      report += `\n### Pending Steps\n\n`;
      uncheckedItems.forEach(([key]) => {
        const item = checklistItems.find(item => item.key === key);
        report += `- [ ] ${item.label}\n`;
      });
    }
    
    report += `\n## System Information and Outputs\n\n`;
    
    dataItems.forEach(item => {
      const data = formData[item.key];
      if (data && data.trim()) {
        report += `### ${item.title}\n\n`;
        report += `\`\`\`\n${data}\n\`\`\`\n\n`;
      }
    });
    
    return report;
  };

  const downloadReport = () => {
    try {
      const report = generateMarkdownReport();
      console.log('Generated report:', report); // Debug log
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maps4fs_troubleshooting_report_${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report. Please try again.');
    }
  };

  const copyReportToClipboard = async () => {
    try {
      const report = generateMarkdownReport();
      await navigator.clipboard.writeText(report);
      alert('Report copied to clipboard!');
    } catch (error) {
      console.error('Error copying report:', error);
      alert('Error copying report. Please try the download button instead.');
    }
  };

  const getCompletionPercentage = () => {
    const completed = Object.values(checklist).filter(Boolean).length;
    return Math.round((completed / Object.keys(checklist).length) * 100);
  };

  const isChecklistComplete = () => {
    return Object.values(checklist).every(Boolean);
  };

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden" style={{ minWidth: '1000px' }}>
      <AppHeader 
        customTitle="Troubleshooting Helper"
        onBackClick={() => window.history.back()}
        showTabs={false}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Docker Troubleshooting Helper
              </h1>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Progress: {getCompletionPercentage()}%
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
          </div>

          {/* Step 1: Checklist */}
          {currentStep === 1 && (
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
                      checked={checklist[item.key]}
                      onChange={(value) => handleChecklistChange(item.key, value)}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-6">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              {!isChecklistComplete() && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <i className="zmdi zmdi-info mr-2"></i>
                    Complete all checklist items to continue to the next step.
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!isChecklistComplete()}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isChecklistComplete()
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
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  Step 2: Collect System Information and Command Outputs
                </h2>
                <p className="text-green-800 dark:text-green-200 text-sm">
                  Run the suggested commands and paste their outputs using the text editors below.
                </p>
              </div>

              <div className="grid gap-4">
                {dataItems.map((item) => (
                  <div key={item.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {formData[item.key] ? 'Data collected ✓' : 'No data yet'}
                          </p>
                        </div>
                        <button
                          onClick={() => openTextModal(item.key)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData[item.key] 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          <i className="zmdi zmdi-edit mr-1"></i>
                          {formData[item.key] ? 'Edit Data' : 'Add Data'}
                        </button>
                      </div>
                      
                      {/* Command to run */}
                      {item.command && item.command !== 'Provide your system specifications manually' && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Command to run:</p>
                              <code className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 px-2 py-1 rounded border">
                                {item.command}
                              </code>
                            </div>
                            <button
                              onClick={() => navigator.clipboard.writeText(item.command)}
                              className="ml-3 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                              title="Copy command"
                            >
                              <i className="zmdi zmdi-copy"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  <i className="zmdi zmdi-arrow-left mr-2"></i>
                  Back to Checklist
                </button>
                
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Generate Report
                  <i className="zmdi zmdi-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Report Generation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Step 3: Generate Troubleshooting Report
                </h2>
                <p className="text-purple-800 dark:text-purple-200 text-sm">
                  Your troubleshooting report is ready. Download it and share it when asking for help.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Report Summary
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Object.values(checklist).filter(Boolean).length}/{Object.keys(checklist).length}
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      Checklist items completed
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Object.values(formData).filter(data => data && data.trim()).length}/{dataItems.length}
                    </div>
                    <div className="text-sm text-green-800 dark:text-green-200">
                      Data items collected
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <i className="zmdi zmdi-info mr-2"></i>
                    Make sure to share this report when asking for help in the Discord server. 
                    Include as much information as possible for faster assistance.
                  </p>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                  >
                    <i className="zmdi zmdi-arrow-left mr-2"></i>
                    Back to Data Collection
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={copyReportToClipboard}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <i className="zmdi zmdi-copy mr-2"></i>
                      Copy Report
                    </button>
                    
                    <button
                      onClick={downloadReport}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <i className="zmdi zmdi-download mr-2"></i>
                      Download Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text Editor Modal */}
      <TextEditorModal
        isOpen={textModal.isOpen}
        onClose={() => setTextModal({
          isOpen: false,
          type: '',
          title: '',
          data: '',
          placeholder: ''
        })}
        onSave={handleTextModalSave}
        textData={textModal.data}
        title={textModal.title}
        placeholder={textModal.placeholder}
      />
    </div>
  );
}