import { useState, useCallback, useRef } from 'react';

export function useMapGeneration() {
  const [status, setStatus] = useState("Ready");
  const [progress, setProgress] = useState(0);
  const [isDownloadMode, setIsDownloadMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fake backend call to start generation
  const fakeStartGeneration = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, taskId: 'fake-task-123' });
      }, 500);
    });
  };

  // Fake backend call to check if task started
  const fakeCheckTaskStarted = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ started: true });
      }, 1000);
    });
  };

  // Fake backend call to check generation status
  const fakeCheckGenerationStatus = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Randomly simulate completion after some time
        const isComplete = Math.random() > 0.3; // 70% chance to complete
        const isFailed = !isComplete && Math.random() > 0.8; // 20% chance to fail if not complete
        
        resolve({ 
          completed: isComplete, 
          failed: isFailed,
          error: isFailed ? "Generation failed due to server error" : null
        });
      }, 800);
    });
  };

  // Start the generation process
  const startGeneration = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setStatus("Starting");
    setProgress(0);
    setIsDownloadMode(false);

    try {
      // Step 1: Start generation
      const startResult = await fakeStartGeneration();
      if (!startResult.success) {
        throw new Error("Failed to start generation");
      }

      setStatus("Processing");
      setProgress(5);

      // Step 2: Wait for task to be picked up from queue
      await fakeCheckTaskStarted();
      setProgress(15);

      // Step 3: Simulate progress updates every 3 seconds
      let currentProgress = 15;
      intervalRef.current = setInterval(async () => {
        // Increment progress
        currentProgress += Math.random() * 15 + 5; // 5-20% increments
        currentProgress = Math.min(currentProgress, 90); // Cap at 90%
        setProgress(currentProgress);

        // Check if generation is complete
        const statusResult = await fakeCheckGenerationStatus();
        
        if (statusResult.completed) {
          clearInterval(intervalRef.current);
          setProgress(100);
          setStatus("Completed");
          setIsGenerating(false);
          
          // Switch to download mode after a brief delay
          timeoutRef.current = setTimeout(() => {
            setIsDownloadMode(true);
          }, 1500);
        } else if (statusResult.failed) {
          clearInterval(intervalRef.current);
          setStatus("Failed");
          setProgress(0);
          setIsGenerating(false);
        }
      }, 3000);

    } catch (error) {
      setStatus("Failed");
      setProgress(0);
      setIsGenerating(false);
    }
  }, [isGenerating]);

  // Download the generated file
  const downloadMap = useCallback(() => {
    // For now, download the next.svg file from public
    const link = document.createElement('a');
    link.href = '/next.svg';
    link.download = 'generated-map.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset to ready state after download
    setTimeout(() => {
      setStatus("Ready");
      setProgress(0);
      setIsDownloadMode(false);
      setIsGenerating(false);
    }, 1000);
  }, []);

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
    startGeneration,
    downloadMap,
    resetGeneration,
    cleanup
  };
}
