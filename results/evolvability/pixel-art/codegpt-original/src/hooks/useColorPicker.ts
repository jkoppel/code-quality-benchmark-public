import { useState, useCallback } from "react";
import { RGBColor } from "../types";
import { ColorUtility } from "../utils";
import { DEFAULT_RGB_COLOR } from "../config/constants";

/**
 * Custom hook for managing color picker state
 * Encapsulates color selection and manipulation logic
 */
export const useColorPicker = (initialColor: RGBColor = DEFAULT_RGB_COLOR) => {
  const [selectedColor, setSelectedColor] = useState<RGBColor>(initialColor);
  const colorUtility = new ColorUtility();

  /**
   * Updates a specific RGB component
   */
  const updateColorComponent = useCallback(
    (component: keyof RGBColor, value: number) => {
      const clampedValue = colorUtility.clampRgbValue(value);
      setSelectedColor((prev) => ({
        ...prev,
        [component]: clampedValue,
      }));
    },
    [colorUtility]
  );

  /**
   * Sets the entire RGB color
   */
  const setColor = useCallback(
    (color: RGBColor) => {
      const clampedColor: RGBColor = {
        r: colorUtility.clampRgbValue(color.r),
        g: colorUtility.clampRgbValue(color.g),
        b: colorUtility.clampRgbValue(color.b),
      };
      setSelectedColor(clampedColor);
    },
    [colorUtility]
  );

  /**
   * Sets color from CSS color string
   */
  const setColorFromString = useCallback(
    (colorString: string) => {
      const rgbColor = colorUtility.stringToRgb(colorString);
      setColor(rgbColor);
    },
    [colorUtility, setColor]
  );

  /**
   * Gets the current color as CSS RGB string
   */
  const getColorString = useCallback((): string => {
    return colorUtility.rgbToString(selectedColor);
  }, [selectedColor, colorUtility]);

  /**
   * Gets the current color as hex string
   */
  const getColorHex = useCallback((): string => {
    return colorUtility.rgbToHex(selectedColor);
  }, [selectedColor, colorUtility]);

  /**
   * Generates and sets a random color
   */
  const setRandomColor = useCallback(() => {
    const randomColor = colorUtility.generateRandomColor();
    setSelectedColor(randomColor);
  }, [colorUtility]);

  /**
   * Resets to default color
   */
  const resetColor = useCallback(() => {
    setSelectedColor(DEFAULT_RGB_COLOR);
  }, []);

  return {
    selectedColor,
    updateColorComponent,
    setColor,
    setColorFromString,
    getColorString,
    getColorHex,
    setRandomColor,
    resetColor,
  };
};
