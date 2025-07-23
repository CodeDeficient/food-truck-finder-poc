export async function submitTestPipeline({ useRawText, url, rawText, isDryRun, }) {
    var _a;
    const payload = {
        url: useRawText ? undefined : url,
        rawText: useRawText ? rawText : undefined,
        isDryRun,
    };
    const response = await fetch('/api/test-pipeline-run', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = (await response.json());
    if (!response.ok) {
        throw new Error((_a = data.error) !== null && _a !== void 0 ? _a : 'Test run failed');
    }
    return data;
}
