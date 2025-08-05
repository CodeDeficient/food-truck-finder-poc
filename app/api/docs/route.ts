import { NextResponse } from 'next/server';

/**
 * API Documentation Route - DISABLED FOR SECURITY
 * 
 * This route has been disabled to prevent public access to API documentation.
 * For development purposes, API documentation should be maintained in the 
 * docs_v2/ directory or through external tools.
 */

export function GET() {
  return NextResponse.json(
    { 
      error: 'API documentation is not publicly accessible',
      message: 'For security reasons, API documentation has been removed from public access.'
    },
    { status: 404 }
  );
}
