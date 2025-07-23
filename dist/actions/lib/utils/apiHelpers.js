import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
export function handleErrorResponse(error) {
    console.error('API error:', error);
    if (error instanceof ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
}
export function handleDeprecatedEndpoint(newEndpoint, documentation) {
    return NextResponse.json({
        status: 'DEPRECATED',
        message: `This endpoint has been consolidated into ${newEndpoint}`,
        migration: {
            newEndpoint,
            documentation,
            deprecationDate: '2024-12-09',
            removalDate: '2025-01-01',
        },
    }, { status: 410 });
}
