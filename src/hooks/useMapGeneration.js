import { useState, useCallback, useRef } from 'react';
import { startMapGeneration, checkTaskStatus, downloadGeneratedMap } from '@/api/generation';
import { STATUS_TYPES } from '@/config/statusConfig';
import logger from '@/utils/logger';

export function useMapGeneration() {
  const [statusType, setStatusType] = useState(STATUS_TYPES.IDLE);
  const [statusText, setStatusText] = useState("Ready");
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
    setStatusType(STATUS_TYPES.PROCESSING);
    setStatusText("Map generation started...");
    setProgress(5);
    setIsDownloadMode(false);
    setError(null);
    setTaskId(null);

    try {
      // Step 1: Start generation with real API
      setStatusText("Initializing");
      const startResult = await startMapGeneration(settings);
      
      if (!startResult.success) {
        throw new Error(startResult.error || "Failed to start generation");
      }

      const generationTaskId = startResult.taskId;
      setTaskId(generationTaskId);
      setStatusText("Generating the map...");
      setProgress(10);

      // Step 2: Poll task status every 10 seconds
      let currentProgress = 10;
      let hasStartedProcessing = false;
      
      intervalRef.current = setInterval(async () => {
        try {
          const statusResult = await checkTaskStatus(generationTaskId);
          
          if (statusResult.status === 'failed') {
            clearInterval(intervalRef.current);
            setStatusType(STATUS_TYPES.ERROR);
            setStatusText("Failed");
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
              setStatusText("In queue");
            }
          } else if (statusResult.status === 'processing') {
            // Task is being processed - allow progress up to 90%
            hasStartedProcessing = true;
            setStatusText("Generating the map...");
            if (currentProgress < 90) {
              currentProgress = Math.min(currentProgress + Math.random() * 10 + 5, 90);
              setProgress(currentProgress);
            }
          } else if (statusResult.status === 'completed') {
            // Task completed successfully
            clearInterval(intervalRef.current);
            setProgress(100); // Show 100% immediately
            setStatusType(STATUS_TYPES.SUCCESS);
            setStatusText("Map generation completed");
            setIsGenerating(false);
            setIsDownloadMode(true); // Enable download immediately
          }
        } catch (error) {
          logger.error('Error checking task status:', error.message);
          // Continue polling unless it's a critical error
        }
      }, 3000); // Poll every 3 seconds

    } catch (error) {
      logger.error('Generation start failed:', error.message);
      setStatusType(STATUS_TYPES.ERROR);
      setStatusText("Failed");
      setError(error.message);
      setProgress(0);
      setIsGenerating(false);
    }
  }, [isGenerating]);

  // Download the generated file
  const downloadMap = useCallback(async () => {
    if (!taskId) {
      logger.error('No task ID available for download');
      return;
    }

    try {
      await downloadGeneratedMap(taskId);
      
      // Reset to ready state after download
      setTimeout(() => {
        setStatusType(STATUS_TYPES.IDLE);
        setStatusText("Ready");
        setProgress(0);
        setIsDownloadMode(false);
        setIsGenerating(false);
        setError(null);
        setTaskId(null);
      }, 1000);
    } catch (error) {
      logger.error('Download failed:', error.message);
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
    
    setStatusType(STATUS_TYPES.IDLE);
    setStatusText("Ready");
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
    statusType,
    statusText,
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
