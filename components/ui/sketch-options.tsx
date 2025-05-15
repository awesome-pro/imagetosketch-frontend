"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SketchMethod, SketchConfig } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Define the form schema
const sketchOptionsSchema = z.object({
  method: z.enum([SketchMethod.BASIC, SketchMethod.ADVANCED, SketchMethod.ARTISTIC]),
  config: z.object({
    sigma_s: z.number().min(1).max(200).optional(),
    sigma_r: z.number().min(0.01).max(1).optional(),
    shade_factor: z.number().min(0.01).max(1).optional(),
    kernel_size: z.number().min(3).max(51).optional(),
    blur_type: z.enum(["gaussian", "median", "bilateral"]).optional(),
    edge_preserve: z.boolean().optional(),
    texture_enhance: z.boolean().optional(),
    contrast: z.number().min(0.5).max(3).optional(),
    brightness: z.number().min(-50).max(50).optional(),
    smoothing_factor: z.number().min(0).max(1).optional(),
  }).optional(),
});

type SketchOptionsValues = z.infer<typeof sketchOptionsSchema>;

interface SketchOptionsProps {
  onOptionsChange: (options: { method: SketchMethod; config?: SketchConfig }) => void;
  defaultMethod?: SketchMethod;
  defaultConfig?: SketchConfig;
}

export function SketchOptions({
  onOptionsChange,
  defaultMethod = SketchMethod.ADVANCED,
  defaultConfig,
}: SketchOptionsProps) {
  // Initialize form with default values
  const form = useForm<SketchOptionsValues>({
    resolver: zodResolver(sketchOptionsSchema),
    defaultValues: {
      method: defaultMethod,
      config: defaultConfig || {
        sigma_s: 60,
        sigma_r: 0.07,
        shade_factor: 0.05,
        kernel_size: 21,
        blur_type: "gaussian",
        edge_preserve: true,
        texture_enhance: true,
        contrast: 1.5,
        brightness: 0,
        smoothing_factor: 0.9,
      },
    },
  });

  // Watch for changes and notify parent component
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onOptionsChange({
        method: value.method as SketchMethod,
        config: value.config as SketchConfig,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onOptionsChange]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sketch Method</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sketch method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={SketchMethod.BASIC}>Basic</SelectItem>
                  <SelectItem value={SketchMethod.ADVANCED}>Advanced</SelectItem>
                  <SelectItem value={SketchMethod.ARTISTIC}>Artistic</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the sketch style you prefer. Advanced and Artistic methods provide more realistic results.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="advanced-options">
            <AccordionTrigger>Advanced Options</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {/* Edge Preservation */}
                <FormField
                  control={form.control}
                  name="config.edge_preserve"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Edge Preservation</FormLabel>
                        <FormDescription>
                          Preserve edges for more natural-looking sketches
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Texture Enhancement */}
                <FormField
                  control={form.control}
                  name="config.texture_enhance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Texture Enhancement</FormLabel>
                        <FormDescription>
                          Enhance texture details in the sketch
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Blur Type */}
                <FormField
                  control={form.control}
                  name="config.blur_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blur Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blur type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gaussian">Gaussian</SelectItem>
                          <SelectItem value="median">Median</SelectItem>
                          <SelectItem value="bilateral">Bilateral</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Different blur types affect the sketch texture
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contrast */}
                <FormField
                  control={form.control}
                  name="config.contrast"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contrast: {field.value?.toFixed(1)}</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value || 1.5]}
                          min={0.5}
                          max={3}
                          step={0.1}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Adjust the contrast of the sketch
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Shade Factor */}
                <FormField
                  control={form.control}
                  name="config.shade_factor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shade Intensity: {field.value?.toFixed(2)}</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value || 0.05]}
                          min={0.01}
                          max={0.5}
                          step={0.01}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Controls the pencil shade intensity
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Smoothing Factor */}
                <FormField
                  control={form.control}
                  name="config.smoothing_factor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Smoothing: {field.value?.toFixed(1)}</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value || 0.9]}
                          min={0}
                          max={1}
                          step={0.1}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Adjust the smoothness of the sketch
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </Form>
  );
}
