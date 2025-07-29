import { NextResponse } from 'next/server';
export declare function handleErrorResponse(error: unknown): NextResponse;
export declare function handleDeprecatedEndpoint(newEndpoint: string, documentation: string): NextResponse;
