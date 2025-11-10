import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  performOCR as performImageOCR,
  describeImage as describeImageAI,
  getImageMetadata,
  resizeImage as resizeImageFile,
  convertImage as convertImageFile
} from "@/lib/image-processor";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

// POST /api/tools/image - Process images
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const action = formData.get("action") as string; // analyze, ocr, describe, resize, convert

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join("/tmp", `${Date.now()}-${file.name}`);
    await writeFile(tempPath, buffer);

    try {
      let result: any = {};

      switch (action) {
        case "analyze":
          result = await analyzeImage(tempPath, buffer);
          break;
        case "ocr":
          result = await performOCR(tempPath);
          break;
        case "describe":
          result = await describeImage(tempPath, buffer);
          break;
        case "resize":
          const width = parseInt(formData.get("width") as string || "800");
          const height = parseInt(formData.get("height") as string || "600");
          result = await resizeImage(tempPath, width, height);
          break;
        case "convert":
          const format = formData.get("format") as string || "png";
          result = await convertImage(tempPath, format);
          break;
        default:
          result = await analyzeImage(tempPath, buffer);
      }

      // Clean up temp file
      await unlink(tempPath);

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "process_image",
        resource_type: "tool",
        details: { 
          filename: file.name,
          action,
          size: file.size
        }
      });

      return NextResponse.json({
        success: true,
        filename: file.name,
        action,
        result
      });

    } catch (error) {
      // Clean up temp file on error
      try {
        await unlink(tempPath);
      } catch (e) {
        // Ignore cleanup errors
      }
      throw error;
    }

  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Failed to process image", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Helper function to analyze image
async function analyzeImage(imagePath: string, buffer: Buffer): Promise<any> {
  try {
    // Get basic image info
    const stats = await import("fs/promises").then(fs => fs.stat(imagePath));
    
    // For more detailed analysis, we would use a library like sharp
    // For now, return basic info
    return {
      size: stats.size,
      format: imagePath.split(".").pop(),
      // TODO: Add width, height, color space, etc. using sharp
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image");
  }
}

// Helper function to perform OCR
async function performOCR(imagePath: string): Promise<{ text: string }> {
  try {
    const result = await performImageOCR(imagePath);
    return {
      text: result.text
    };
  } catch (error) {
    console.error("Error performing OCR:", error);
    throw new Error("Failed to perform OCR");
  }
}

// Helper function to describe image using AI
async function describeImage(imagePath: string, buffer: Buffer): Promise<{ description: string; labels: string[] }> {
  try {
    const result = await describeImageAI(imagePath);
    return {
      description: result.description,
      labels: result.objects
    };
  } catch (error) {
    console.error("Error describing image:", error);
    throw new Error("Failed to describe image");
  }
}

// Helper function to resize image
async function resizeImage(imagePath: string, width: number, height: number): Promise<any> {
  try {
    const outputPath = imagePath.replace(/\.(\w+)$/, `_resized_${width}x${height}.$1`);
    const result = await resizeImageFile(imagePath, outputPath, width, height);
    return {
      width: result.width,
      height: result.height,
      size: result.size,
      path: outputPath
    };
  } catch (error) {
    console.error("Error resizing image:", error);
    throw new Error("Failed to resize image");
  }
}

// Helper function to convert image format
async function convertImage(imagePath: string, format: string): Promise<any> {
  try {
    const outputPath = imagePath.replace(/\.\w+$/, `.${format}`);
    const result = await convertImageFile(imagePath, outputPath, format as any);
    return {
      format: result.format,
      size: result.size,
      path: outputPath
    };
  } catch (error) {
    console.error("Error converting image:", error);
    throw new Error("Failed to convert image");
  }
}
