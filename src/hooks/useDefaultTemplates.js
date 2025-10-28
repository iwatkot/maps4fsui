'use client';

import { useState, useEffect } from 'react';

/**
 * Hook for managing default templates from localStorage
 * Returns default template filenames for the current game
 */
export function useDefaultTemplates(gameVersion = 'fs25') {
  const [defaultTemplates, setDefaultTemplates] = useState({
    texture_schemas: null,
    tree_schemas: null,
    buildings_schemas: null,
    map_templates: null
  });

  // Load default templates from localStorage when game version changes
  useEffect(() => {
    const loadDefaults = () => {
      const templates = {
        texture_schemas: localStorage.getItem(`defaultTemplate_${gameVersion}_texture_schemas`),
        tree_schemas: localStorage.getItem(`defaultTemplate_${gameVersion}_tree_schemas`),
        buildings_schemas: localStorage.getItem(`defaultTemplate_${gameVersion}_buildings_schemas`),
        map_templates: localStorage.getItem(`defaultTemplate_${gameVersion}_map_templates`)
      };
      setDefaultTemplates(templates);
    };

    loadDefaults();

    // Listen for localStorage changes (when defaults are set in SettingsTab)
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith(`defaultTemplate_${gameVersion}_`)) {
        loadDefaults();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomEvent = () => loadDefaults();
    window.addEventListener('defaultTemplateChanged', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('defaultTemplateChanged', handleCustomEvent);
    };
  }, [gameVersion]);

  /**
   * Get template API payload for map generation
   * Returns object with custom_*_path fields set to filename (not full path)
   */
  const getTemplatePayload = () => {
    const payload = {};
    
    if (defaultTemplates.texture_schemas) {
      payload.custom_texture_schema_path = defaultTemplates.texture_schemas;
    }
    
    if (defaultTemplates.tree_schemas && gameVersion === 'fs25') {
      payload.custom_tree_schema_path = defaultTemplates.tree_schemas;
    }
    
    if (defaultTemplates.buildings_schemas && gameVersion === 'fs25') {
      payload.custom_buildings_schema_path = defaultTemplates.buildings_schemas;
    }
    
    if (defaultTemplates.map_templates) {
      payload.custom_map_template_path = defaultTemplates.map_templates;
    }
    
    return payload;
  };

  /**
   * Check if any templates are set
   */
  const hasTemplates = () => {
    return Boolean(
      defaultTemplates.texture_schemas || 
      defaultTemplates.tree_schemas || 
      defaultTemplates.buildings_schemas ||
      defaultTemplates.map_templates
    );
  };

  /**
   * Get summary of set templates for display
   */
  const getTemplateSummary = () => {
    const summary = [];
    
    if (defaultTemplates.texture_schemas) {
      summary.push(`Texture Schema: ${defaultTemplates.texture_schemas}`);
    }
    
    if (defaultTemplates.tree_schemas && gameVersion === 'fs25') {
      summary.push(`Tree Schema: ${defaultTemplates.tree_schemas}`);
    }
    
    if (defaultTemplates.buildings_schemas && gameVersion === 'fs25') {
      summary.push(`Buildings Schema: ${defaultTemplates.buildings_schemas}`);
    }
    
    if (defaultTemplates.map_templates) {
      summary.push(`Map Template: ${defaultTemplates.map_templates}`);
    }
    
    return summary;
  };

  return {
    defaultTemplates,
    getTemplatePayload,
    hasTemplates,
    getTemplateSummary
  };
}