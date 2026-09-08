/**
 * Gemini AI 模型統一管理
 *
 * 目的：所有可供選擇的 Gemini 模型版本、預設值與快速模型都集中於此檔案維護，
 * 避免同樣的模型字串（如 'gemini-2.5-flash'）散落在各個元件與服務中。
 *
 * 新增、更新或下架 Gemini 模型版本時，只需修改本檔案，
 * SettingsModal 下拉選單與所有 AI 呼叫點都會自動同步。
 */

export interface AiModelOption {
    /** 傳給 Gemini API 的模型代號 */
    value: string
    /** 顯示於「設定」→「模型選擇」下拉選單的名稱 */
    label: string
}

/** 使用者可於「設定」中選擇的模型清單（SettingsModal 下拉選單的唯一資料來源）
 *  穩定版（GA）排在前面優先推薦；Preview 版本的免費配額通常非常有限甚至為 0，
 *  未綁定 Google Cloud 帳單的 API Key 使用 Preview 模型很容易遇到 429 配額錯誤，故加上提示標籤。
 */
export const AI_MODEL_OPTIONS: AiModelOption[] = [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (推薦・穩定版)' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite (最快速・穩定版)' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (進階思考・穩定版)' },
    { value: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash (最新旗艦・Preview，免費額度有限)' },
    { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview (深度推理・Preview，免費額度有限)' },
]

/** 使用者尚未於設定中選擇模型時的預設值，也是新使用者/重置資料後的初始設定值 */
export const DEFAULT_AI_MODEL = 'gemini-2.5-flash'

/** 固定用於輕量、即時任務（例如即時翻譯）的模型，不受使用者設定影響 */
export const FAST_AI_MODEL = 'gemini-2.5-flash-lite'

/** 使用者尚未於設定中設定「Google 即時搜尋」開關時的預設值（維持既有行為：預設開啟） */
export const DEFAULT_ENABLE_GOOGLE_SEARCH = true

/**
 * 解析實際要使用的模型名稱：
 * 優先使用傳入的模型（例如使用者於設定中選擇的值），若為空則回退至 {@link DEFAULT_AI_MODEL}。
 */
export function resolveAiModel(model?: string | null): string {
    return model || DEFAULT_AI_MODEL
}

/**
 * 根據使用者設定組出 Gemini API 呼叫用的 tools 參數。
 * 免費版 API Key 對「Grounding with Google Search」的配額非常有限（尤其 Gemini 3 系列），
 * 讓使用者可於設定中關閉此功能以節省配額；未設定時預設開啟（維持既有行為）。
 */
export function buildAiTools(enableGoogleSearch?: boolean): { googleSearch: {} }[] {
    const enabled = enableGoogleSearch ?? DEFAULT_ENABLE_GOOGLE_SEARCH
    return enabled ? [{ googleSearch: {} }] : []
}

/**
 * 將 Gemini API 拋出的錯誤轉換為對使用者友善、可理解的中文說明。
 *
 * Gemini API 的錯誤內容通常是一段 JSON 字串（包在 Error.message 裡），
 * 直接顯示給使用者難以理解。此函式嘗試解析出 code/status，
 * 並針對常見情況（配額用盡、API Key 無效、模型不存在等）給出明確、可採取行動的說明，
 * 而非直接把原始錯誤訊息丟給使用者。
 */
export function getAiErrorMessage(error: unknown): string {
    const raw = error instanceof Error ? error.message : String(error)

    let code: number | undefined
    let status: string | undefined
    let apiMessage: string | undefined
    try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            code = parsed?.error?.code
            status = parsed?.error?.status
            apiMessage = parsed?.error?.message
        }
    } catch {
        // 無法解析成 JSON 就直接使用原始訊息
    }

    if (code === 429 || status === 'RESOURCE_EXHAUSTED') {
        return '已超過 Gemini API 使用配額（429 Quota Exceeded）。常見原因：① 此 API Key 尚未在 Google Cloud 綁定帳單，較新的 Preview 模型（如 Gemini 3 系列）在免費額度下配額非常有限，很容易被用完；② 短時間內請求過於頻繁。建議：改用「設定」中標示「穩定版」的 Gemini 2.5 系列模型，或至 Google AI Studio 綁定帳單以提高配額。'
    }
    if (code === 401 || code === 403 || status === 'PERMISSION_DENIED' || status === 'UNAUTHENTICATED') {
        return 'API Key 無效或權限不足，請至「設定」重新確認 Gemini API Key 是否正確、是否已啟用。'
    }
    if (code === 404 || status === 'NOT_FOUND') {
        return `找不到指定的模型（404），該模型可能已下架或名稱已變更。詳細訊息：${apiMessage || raw}`
    }
    if (code === 400 || status === 'INVALID_ARGUMENT') {
        return `請求參數有誤（400）：${apiMessage || raw}`
    }

    return apiMessage || raw || '發生未知錯誤，請稍後再試。'
}
