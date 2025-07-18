declare module 'class-variance-authority' {
  import { type ClassValue } from 'clsx';
  import { type VariantProps as VP } from 'class-variance-authority';

  export const cva: <T>(
    base?: ClassValue,
    config?: T,
  ) => (props?: T extends { variants: infer V } ? VP<V> : never) => string;

  export type VariantProps<T> = T extends (props?: infer P) => string ? P : never;
}
