'use client';

// @ts-expect-error TS(2792): Cannot find module '@radix-ui/react-aspect-ratio'.... Remove this comment to see the full error message
import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

const AspectRatio = AspectRatioPrimitive.Root;

export { AspectRatio };
