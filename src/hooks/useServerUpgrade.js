/**
 * Custom hook for managing server upgrade functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { getServerUpgradable, triggerServerUpgrade } from '@/api/service';
import logger from '@/utils/logger';

export const useServerUpgrade = () => {
  const [isUpgradable, setIsUpgradable] = useState(null); // null = loading, true = upgradable, false = not upgradable
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const checkUpgradable = useCallback(async () => {
    try {
      logger.info('Checking if server is upgradable');
      setUpgradeError(null);
      
      const response = await getServerUpgradable();
      setIsUpgradable(response.upgradable);
      
      logger.info(`Server upgradable check result: ${response.upgradable}`);
    } catch (error) {
      logger.error('Failed to check upgradable status:', error.message);
      setIsUpgradable(false);
      setUpgradeError(error.message);
    }
  }, []);

  const performUpgrade = useCallback(async () => {
    try {
      logger.info('Starting server upgrade');
      setIsUpgrading(true);
      setUpgradeError(null);
      setUpgradeSuccess(false);
      
      const response = await triggerServerUpgrade();
      
      logger.info(`Server upgrade initiated: ${response.message}`);
      
      // Check if the response indicates success
      if (response.success) {
        setUpgradeSuccess(true);
        logger.info('Server upgrade initiated successfully');
      } else {
        throw new Error(response.message || 'Upgrade failed');
      }
      
      // After successful upgrade trigger, the server might restart
      // so we should handle this appropriately
      return response;
    } catch (error) {
      logger.error('Failed to perform upgrade:', error.message);
      setUpgradeError(error.message);
      setUpgradeSuccess(false);
      throw error;
    } finally {
      setIsUpgrading(false);
    }
  }, []);

  return {
    isUpgradable,
    isUpgrading,
    upgradeError,
    upgradeSuccess,
    checkUpgradable,
    performUpgrade
  };
};