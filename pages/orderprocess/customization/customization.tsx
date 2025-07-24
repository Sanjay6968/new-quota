"use client";

import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PrinterIcon } from "lucide-react";

interface CustomizeDetailsProps {
  setActiveTab: (tabIndex: number) => void;
  setFurthestAccessibleTab: (tabIndex: number) => void;
  customizationDetails?: {
    selectedTechnology: string;
    selectedMaterial: string;
    layerThickness: string;
    filling: number;
    colorFinish: string;
    scale: number;
    selectedPrinterOption: string;
  };
  onCustomizationChange: (key: string, value: string | number) => void;
  fileUrl: string;
}

function CustomizeDetails({
  setActiveTab,
  setFurthestAccessibleTab,
  customizationDetails = {
    selectedTechnology: '',
    selectedMaterial: '',
    layerThickness: '',
    filling: 0,
    colorFinish: '',
    scale: 1,
    selectedPrinterOption: ''
  },
  onCustomizationChange,
  fileUrl,
}: CustomizeDetailsProps) {
  useEffect(() => {
    setFurthestAccessibleTab(1);
  }, [setFurthestAccessibleTab]);

  const goToNextTab = () => {
    setActiveTab(2);
  };

  const handleToggleChange = (key: string, value: string) => {
    onCustomizationChange(key, value);
  };

  return (
    <div className="space-y-8">
      {/* Technology */}
      <div className="space-y-2">
        <Label className="text-base">Select Technology</Label>
        <ToggleGroup
          type="single"
          className="flex flex-wrap gap-2"
          value={customizationDetails.selectedTechnology}
          onValueChange={(value) => handleToggleChange("selectedTechnology", value)}
        >
          <ToggleGroupItem value="FDM">FDM</ToggleGroupItem>
          <ToggleGroupItem value="SLA">SLA</ToggleGroupItem>
          <ToggleGroupItem value="SLS">SLS</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Material */}
      <div className="space-y-2">
        <Label className="text-base">Select Material</Label>
        <ToggleGroup
          type="single"
          className="flex flex-wrap gap-2"
          value={customizationDetails.selectedMaterial}
          onValueChange={(value) => handleToggleChange("selectedMaterial", value)}
        >
          <ToggleGroupItem value="PLA">PLA</ToggleGroupItem>
          <ToggleGroupItem value="ABS">ABS</ToggleGroupItem>
          <ToggleGroupItem value="PETG">PETG</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Layer Thickness */}
      <div className="space-y-2">
        <Label className="text-base">Layer Thickness</Label>
        <ToggleGroup
          type="single"
          className="flex flex-wrap gap-2"
          value={customizationDetails.layerThickness}
          onValueChange={(value) => handleToggleChange("layerThickness", value)}
        >
          <ToggleGroupItem value="0.1mm">0.1mm</ToggleGroupItem>
          <ToggleGroupItem value="0.2mm">0.2mm</ToggleGroupItem>
          <ToggleGroupItem value="0.3mm">0.3mm</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Infill */}
      <div className="space-y-2">
        <Label className="text-base">Infill Percentage</Label>
        <Slider
          defaultValue={[customizationDetails.filling]}
          min={0}
          max={100}
          step={10}
          onValueChange={(value) => onCustomizationChange("filling", value[0])}
        />
        <div className="text-sm text-muted-foreground">{customizationDetails.filling}%</div>
      </div>

      {/* Color Finish */}
      <div className="space-y-2">
        <Label className="text-base">Color Finish</Label>
        <ToggleGroup
          type="single"
          className="flex flex-wrap gap-2"
          value={customizationDetails.colorFinish}
          onValueChange={(value) => handleToggleChange("colorFinish", value)}
        >
          <ToggleGroupItem value="Matte">Matte</ToggleGroupItem>
          <ToggleGroupItem value="Glossy">Glossy</ToggleGroupItem>
          <ToggleGroupItem value="Neutral">Neutral</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Scale */}
      <div className="space-y-2">
        <Label className="text-base">Scale</Label>
        <Slider
          defaultValue={[customizationDetails.scale]}
          min={0.1}
          max={2}
          step={0.1}
          onValueChange={(value) => onCustomizationChange("scale", value[0])}
        />
        <div className="text-sm text-muted-foreground">{customizationDetails.scale}x</div>
      </div>

      {/* Printer Option */}
      <div className="space-y-2">
        <Label className="text-base">Printer Option</Label>
        <ToggleGroup
          type="single"
          className="flex flex-wrap gap-2"
          value={customizationDetails.selectedPrinterOption}
          onValueChange={(value) => handleToggleChange("selectedPrinterOption", value)}
        >
          <ToggleGroupItem value="Fastest">
            <PrinterIcon className="mr-2 h-4 w-4" />
            Fastest
          </ToggleGroupItem>
          <ToggleGroupItem value="Best Quality">
            <PrinterIcon className="mr-2 h-4 w-4" />
            Best Quality
          </ToggleGroupItem>
          <ToggleGroupItem value="Balanced">
            <PrinterIcon className="mr-2 h-4 w-4" />
            Balanced
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <Button onClick={goToNextTab}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default CustomizeDetails;
