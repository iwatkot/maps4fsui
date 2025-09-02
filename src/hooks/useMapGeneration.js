import { useState, useCallback, useRef, useEffect } from 'react';
import { startMapGeneration, checkTaskStatus, downloadGeneratedMap } from '@/api/generation';
import { STATUS_TYPES } from '@/config/statusConfig';
import logger from '@/utils/logger';

export function useMapGeneration() {
  const [statusType, setStatusType] = useState(STATUS_TYPES.IDLE);
  const [statusText, setStatusText] = useState("Ready");
  const [progress, setProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(0); // Target for smooth animation
  const [isDownloadMode, setIsDownloadMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const animationRef = useRef(null);

  // Smooth progress animation
  useEffect(() => {
    if (Math.abs(progress - targetProgress) < 0.2) return;

    const animateProgress = () => {
      setProgress(current => {
        const diff = targetProgress - current;
        if (Math.abs(diff) < 0.2) {
          return targetProgress; // Close enough, snap to target
        }
        // Simple smooth movement - 8% closer each frame
        return current + diff * 0.08;
      });
    };

    const animate = () => {
      animateProgress();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetProgress, progress]);

  // Start the generation process with real API
  const startGeneration = useCallback(async (settings, osmData = null) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setStatusType(STATUS_TYPES.PROCESSING);
    setStatusText("Map generation started...");
    setTargetProgress(5);
    setIsDownloadMode(false);
    setError(null);
    setTaskId(null);

    try {
      // Step 1: Start generation with real API
      setStatusText("Initializing");
      const startResult = await startMapGeneration(settings, osmData);
      
      if (!startResult.success) {
        throw new Error(startResult.error || "Failed to start generation");
      }

      const generationTaskId = startResult.taskId;
      setTaskId(generationTaskId);
      setStatusText("Generating the map...");
      setTargetProgress(10);

      // Step 2: Poll task status every 3 seconds
      let currentTargetProgress = 10;
      let hasStartedProcessing = false;
      let queueTime = 0;
      let processingTime = 0;
      
      intervalRef.current = setInterval(async () => {
        try {
          const statusResult = await checkTaskStatus(generationTaskId);
          
          if (statusResult.status === 'failed') {
            clearInterval(intervalRef.current);
            setStatusType(STATUS_TYPES.ERROR);
            setStatusText("Failed");
            setError(statusResult.error);
            setTargetProgress(0);
            setIsGenerating(false);
            return;
          }
          
          if (statusResult.status === 'queued') {
            // Task is still in queue - smooth progress up to 45%
            queueTime += 3; // 3 seconds per poll
            const queueProgress = Math.min(10 + (queueTime / 2), 45); // Slower progress in queue
            currentTargetProgress = queueProgress;
            setTargetProgress(currentTargetProgress);
            setStatusText("In queue");
          } else if (statusResult.status === 'processing') {
            // Task is being processed - smooth progress up to 85%
            if (!hasStartedProcessing) {
              hasStartedProcessing = true;
              currentTargetProgress = 50; // Jump to 50% when processing starts
            }
            
            processingTime += 3; // 3 seconds per poll
            const processingProgress = Math.min(50 + (processingTime / 1.5), 85); // Faster progress when processing
            currentTargetProgress = processingProgress;
            setTargetProgress(currentTargetProgress);
            setStatusText("Generating the map...");
          } else if (statusResult.status === 'completed') {
            // Task completed successfully
            clearInterval(intervalRef.current);
            setTargetProgress(100); // Animate to 100%
            setStatusType(STATUS_TYPES.SUCCESS);
            setStatusText("Map generation completed");
            setIsGenerating(false);
            setIsDownloadMode(true);
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
      setTargetProgress(0);
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
        setTargetProgress(0);
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
    setTargetProgress(0);
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
