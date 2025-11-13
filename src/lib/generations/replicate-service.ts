import Replicate from "replicate";

/**
 * ReplicateService handles AI generation using Replicate API
 * Supports Stable Diffusion and other models
 */
export class ReplicateService {
  private client: Replicate | null = null;

  constructor() {
    if (!process.env.REPLICATE_API_TOKEN) {
      console.warn("REPLICATE_API_TOKEN is not set - Replicate service will not work");
      return;
    }
    try {
      this.client = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });
      console.log("Replicate client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Replicate client:", error);
    }
  }

  private ensureClient(): Replicate {
    if (!this.client) {
      throw new Error("Replicate client not initialized. Check REPLICATE_API_TOKEN.");
    }
    return this.client;
  }

  /**
   * Generate an image using Stable Diffusion XL
   */
  async generateImage(prompt: string): Promise<string> {
    const client = this.ensureClient();
    
    try {
      console.log("Starting Replicate image generation...");
      console.log("Prompt:", prompt);
      
      // Use predictions.create and wait for completion
      const prediction = await client.predictions.create({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          prompt,
          negative_prompt: "ugly, blurry, low quality, distorted",
          width: 1024,
          height: 1024,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      });

      console.log("Prediction created:", prediction.id);
      console.log("Prediction status:", prediction.status);

      // Wait for the prediction to complete
      const finalPrediction = await client.wait(prediction);
      
      console.log("Final prediction status:", finalPrediction.status);
      console.log("Final prediction output:", finalPrediction.output);

      // Check if generation was successful
      if (finalPrediction.status === 'succeeded' && finalPrediction.output) {
        const output = finalPrediction.output;
        
        // Output should be an array of URLs
        if (Array.isArray(output) && output.length > 0) {
          const url = output[0];
          if (typeof url === 'string' && url.startsWith('http')) {
            console.log("Generated image URL:", url);
            return url;
          }
        }
        
        // Or a single URL string
        if (typeof output === 'string' && output.startsWith('http')) {
          console.log("Generated image URL:", output);
          return output;
        }
      }

      // If we get here, something went wrong
      const errorMsg = finalPrediction.error || 'Unknown error';
      console.error("Replicate generation failed:", errorMsg);
      throw new Error(`Replicate generation failed: ${errorMsg}`);
    } catch (error) {
      console.error("Replicate generation error:", error);
      throw error;
    }
  }

  /**
   * Generate a video using Stable Video Diffusion
   */
  async generateVideo(prompt: string, imageUrl?: string): Promise<string> {
    const client = this.ensureClient();
    
    try {
      // If no image provided, generate one first
      let inputImage = imageUrl;
      if (!inputImage) {
        inputImage = await this.generateImage(prompt);
      }

      const output = await client.run(
        "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
        {
          input: {
            input_image: inputImage,
            sizing_strategy: "maintain_aspect_ratio",
            frames_per_second: 6,
            motion_bucket_id: 127,
          },
        }
      );

      if (typeof output === "string") {
        return output;
      }

      throw new Error("No video output generated");
    } catch (error) {
      console.error("Replicate video generation error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const replicateService = new ReplicateService();
