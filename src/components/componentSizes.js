// Shared size configuration for all components
export const componentSizes = {
  sm: {
    height: "min-h-[48px]",
    labelHeight: "min-h-[48px]",
    textSize: "text-xs"
  },
  md: {
    height: "min-h-[60px]",
    labelHeight: "min-h-[60px]", 
    textSize: "text-sm"
  },
  lg: {
    height: "min-h-[72px]",
    labelHeight: "min-h-[72px]",
    textSize: "text-base"
  }
};

// Helper function to get size classes
export const getSizeClasses = (size = "md") => {
  const sizeConfig = componentSizes[size] || componentSizes.md;
  
  return {
    container: sizeConfig.height,
    label: `${sizeConfig.labelHeight} ${sizeConfig.textSize}`
  };
};
