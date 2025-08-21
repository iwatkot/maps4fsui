import { useState, useCallback, useRef } from 'react';
import { startMapGeneration, checkTaskStatus, downloadGeneratedMap } from '@/api/generation';

export function useMapGeneration() {
  const [status, setStatus] = useState("Ready");
  const [progress, setProgress] = useState(0);
  const [isDownloadMode, setIsDownloadMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Start the generation process with real API
  const startGeneration = useCallback(async (settings) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setStatus("Starting");
    setProgress(5);
    setIsDownloadMode(false);
    setError(null);
    setTaskId(null);

    try {
      // Step 1: Start generation with real API
      setStatus("Initializing");
      const startResult = await startMapGeneration(settings);
      
      if (!startResult.success) {
        throw new Error(startResult.error || "Failed to start generation");
      }

      const generationTaskId = startResult.taskId;
      setTaskId(generationTaskId);
      setStatus("Processing");
      setProgress(10);

      // Step 2: Poll task status every 10 seconds
      let currentProgress = 10;
      let hasStartedProcessing = false;
      
      intervalRef.current = setInterval(async () => {
        try {
          const statusResult = await checkTaskStatus(generationTaskId);
          
          if (statusResult.status === 'failed') {
            clearInterval(intervalRef.current);
            setStatus("Failed");
            setError(statusResult.error);
            setProgress(0);
            setIsGenerating(false);
            return;
          }
          
          if (statusResult.status === 'queued') {
            // Task is still in queue - fake progress up to 50%
            if (currentProgress < 50) {
              currentProgress = Math.min(currentProgress + Math.random() * 8 + 2, 50);
              setProgress(currentProgress);
              setStatus("In queue");
            }
          } else if (statusResult.status === 'processing') {
            // Task is being processed - allow progress up to 90%
            hasStartedProcessing = true;
            setStatus("Processing");
            if (currentProgress < 90) {
              currentProgress = Math.min(currentProgress + Math.random() * 10 + 5, 90);
              setProgress(currentProgress);
            }
          } else if (statusResult.status === 'completed') {
            // Task completed successfully
            clearInterval(intervalRef.current);
            setProgress(100);
            setStatus("Completed");
            setIsGenerating(false);
            
            // Switch to download mode after a brief delay
            timeoutRef.current = setTimeout(() => {
              setIsDownloadMode(true);
            }, 1500);
          }
        } catch (error) {
          console.error('Error checking task status:', error);
          // Continue polling unless it's a critical error
        }
      }, 3000); // Poll every 3 seconds

    } catch (error) {
      console.error('Generation start failed:', error);
      setStatus("Failed");
      setError(error.message);
      setProgress(0);
      setIsGenerating(false);
    }
  }, [isGenerating]);

  // Download the generated file
  const downloadMap = useCallback(async () => {
    if (!taskId) {
      console.error('No task ID available for download');
      return;
    }

    try {
      await downloadGeneratedMap(taskId);
      
      // Reset to ready state after download
      setTimeout(() => {
        setStatus("Ready");
        setProgress(0);
        setIsDownloadMode(false);
        setIsGenerating(false);
        setError(null);
        setTaskId(null);
      }, 1000);
    } catch (error) {
      console.error('Download failed:', error);
      setError(`Download failed: ${error.message}`);
    }
  }, [taskId]);

  // Reset the generation state
  const resetGeneration = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setStatus("Ready");
    setProgress(0);
    setIsDownloadMode(false);
    setIsGenerating(false);
    setError(null);
    setTaskId(null);
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    status,
    progress,
    isDownloadMode,
    isGenerating,
    error,
    taskId,
    startGeneration,
    downloadMap,
    resetGeneration,
    cleanup
  };
}
