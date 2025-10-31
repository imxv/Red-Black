import { NextRequest, NextResponse } from "next/server";

const FREEIMAGE_API_URL = "https://freeimage.host/api/1/upload";
const API_KEY = process.env.FREEIMAGE_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // 验证 API 密钥是否配置
    if (!API_KEY) {
      return NextResponse.json(
        { success: false, error: "服务器配置错误：未找到 API 密钥" },
        { status: 500 }
      );
    }

    // 解析 FormData 请求体
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { success: false, error: "请求格式错误：需要 FormData" },
        { status: 400 }
      );
    }

    // 检查是否有文件上传，或 base64 source
    const file = formData.get("file") as File | null;
    const source = formData.get("source") as string | null;

    if (!file && !source) {
      return NextResponse.json(
        { success: false, error: "请求参数错误：缺少图片数据（文件或 base64）" },
        { status: 400 }
      );
    }

    // 构造 FormData 发送到 Freeimage.host
    const uploadFormData = new FormData();
    uploadFormData.append("key", API_KEY);
    uploadFormData.append("action", "upload");
    uploadFormData.append("format", "json");

    if (file) {
      // 如果有文件对象，直接使用文件上传（推荐方式）
      // Freeimage.host 支持 FILES["source"]，所以我们使用 "source" 作为字段名
      uploadFormData.append("source", file);
      console.log('使用文件上传方式，文件名:', file.name, '大小:', file.size, '类型:', file.type);
    } else if (source) {
      // 使用 base64 字符串上传
      // Freeimage.host 需要纯 base64，不带 data URI 前缀
      const base64Data = source.trim();
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
        console.error('无效的 base64 格式');
        return NextResponse.json(
          { success: false, error: "无效的 base64 图片数据格式" },
          { status: 400 }
        );
      }
      uploadFormData.append("source", base64Data);
      console.log('使用 base64 上传方式，数据长度:', base64Data.length);
    }

    // 调用 Freeimage.host API，设置 30 秒超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(FREEIMAGE_API_URL, {
        method: "POST",
        body: uploadFormData,
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if ((fetchError as Error).name === "AbortError") {
        return NextResponse.json(
          { success: false, error: "上传超时，请稍后重试" },
          { status: 408 }
        );
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    // 解析响应
    let data: {
      status_code?: number;
      success?: { message?: string; code?: number };
      image?: { url?: string; thumb?: { url?: string }; display_url?: string };
      error?: { message?: string; error_message?: string };
      status_txt?: string;
    };
    try {
      const responseText = await response.text();
      console.log('Freeimage.host API 响应状态:', response.status);
      console.log('Freeimage.host API 响应头:', Object.fromEntries(response.headers.entries()));
      console.log('Freeimage.host API 响应体:', responseText.substring(0, 500));
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('解析响应失败:', parseError);
      return NextResponse.json(
        { success: false, error: "无法解析服务器响应" },
        { status: 500 }
      );
    }

    // 检查 API 响应状态
    if (!response.ok || data.status_code !== 200) {
      console.error('Freeimage.host API 错误:', data);
      const errorMessage = data.error?.message || data.status_txt || data.error?.error_message || "上传失败";
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status || 500 }
      );
    }

    // 提取图片 URL
    if (!data.image || !data.image.url) {
      return NextResponse.json(
        { success: false, error: "上传响应格式异常" },
        { status: 500 }
      );
    }

    // 返回成功响应
    console.log('图片上传成功，URL:', data.image.url);
    return NextResponse.json({
      success: true,
      url: data.image.url,
      thumbnailUrl: data.image.thumb?.url || data.image.url,
      displayUrl: data.image.display_url || data.image.url,
    });
  } catch (error) {
    console.error("图片上传失败:", error);
    const errorMessage = error instanceof Error ? error.message : "上传过程中发生未知错误";
    console.error("错误详情:", { 
      name: error instanceof Error ? error.name : 'Unknown',
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

