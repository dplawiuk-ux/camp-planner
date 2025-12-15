import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Upload, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function PhotoRecognition({ open, onClose, onRecognized }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const analyzeImage = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // Upload the image first
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Analyze the image using LLM
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this camping/outdoor equipment photo and extract the following details:
- name: What is this item? Be specific (e.g., "Coleman 4-Person Tent" not just "Tent")
- type: Choose ONE from: tents, sleeping_pads, sleeping_bags, kitchen, fire, watercraft, other
- capacity: If applicable (e.g., tent capacity in people, watercraft capacity)
- notes: Any visible details like brand, color, condition, features

Return only the equipment details based on what you see in the image.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            capacity: { type: "number" },
            notes: { type: "string" }
          },
          required: ["name", "type"]
        }
      });

      // Call the callback with recognized data and image URL
      onRecognized({
        ...result,
        image_url: file_url
      });

      // Reset and close
      setFile(null);
      setPreview(null);
      onClose();
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            Recognize Equipment from Photo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!preview ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-12 text-center transition-colors
                ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-400'}
              `}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-emerald-100 rounded-full">
                  <Upload className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-slate-700 font-medium mb-1">
                    Drop your photo here
                  </p>
                  <p className="text-sm text-slate-500">
                    or click to browse
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-xl border border-slate-200"
              />
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="flex-1"
                  disabled={isAnalyzing}
                >
                  Change Photo
                </Button>
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Recognize Equipment
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}