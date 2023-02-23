export const none = Symbol();

export type None = typeof none;

type GetFunctionResultType<T> = T extends (...arg: infer Params) => infer ResultType
  ? ResultType
  : undefined;

type GetFunctionArgumentType<T> = T extends (...arg: infer Params) => infer ResultType ? Params : T;

export type DefineMatchObjectReturnType<
  Target extends Record<Readonly<string>, None | ((...args: Array<unknown>) => unknown)>,
> = Target extends any
  ? {
      [key in keyof Target]: {
        match: <T>(
          param:
            | {
                [key in keyof Target]: (args: GetFunctionResultType<Target[key]>) => T;
              }
            | {
                [key in keyof (Target & { _: unknown })]: (
                  args: GetFunctionResultType<Target[key]>,
                ) => T;
              },
        ) => T;
      };
    }
  : never;
