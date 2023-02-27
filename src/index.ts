type GetFunctionResultType<T> = T extends (...arg: any) => infer ResultType ? ResultType : T;

type GetFunctionArgumentType<T> = T extends (...arg: infer Params) => any ? Params : T;

type TargetSuper = Record<string, None | ((...args: any) => any)>;

type Values<T> = T[keyof T];

export const none = Symbol();

export type None = typeof none;

export type MatchFunctionParamsType<
  Target extends TargetSuper,
  ResultType extends unknown = unknown,
> =
  | {
      [key in keyof Target]: (args: GetFunctionResultType<Target[key]>) => ResultType;
    }
  | ({
      [key in keyof Target]?: (args: GetFunctionResultType<Target[key]>) => ResultType;
    } & {
      _: (args: any) => ResultType;
    });

export type MatchFunctionType<Target extends TargetSuper, T extends unknown = unknown> = <
  ResultType extends unknown = T,
>(
  param: MatchFunctionParamsType<Target, ResultType>,
) => ResultType;

export type DefineMatchObjectReturnType<Target extends TargetSuper> = Target extends any
  ? {
      [key in keyof Target]: Target[key] extends None
        ? {
            match: MatchFunctionType<Target>;
          }
        : (...args: GetFunctionArgumentType<Target[key]>) => {
            match: MatchFunctionType<Target>;
          };
    }
  : never;

export type MatchObjectType<Target extends TargetSuper> = Values<
  GetFunctionResultType<DefineMatchObjectReturnType<Target>>
>;

export const defineMatchObject = <Target extends TargetSuper>(
  param: Target,
): DefineMatchObjectReturnType<Target> => {
  const matchObj: any = {};

  Object.keys(param).forEach((key) => {
    const value = param[key];

    if (isNone(value)) {
      matchObj[key] = {
        match: createMatchFunction<Target>(key),
      };
    } else {
      matchObj[key] = (...args: any) => {
        return {
          match: createMatchFunction<Target>(key, value(...args)),
        };
      };
    }
  });

  return matchObj;
};

const isNone = (val: None | ((...args: any) => any)): val is None => {
  return typeof val !== 'function';
};

const createMatchFunction = <Target extends TargetSuper>(
  key: string,
  value?: any,
): MatchFunctionType<Target> => {
  return function (cases) {
    const matchingHandle = cases[key];

    if (typeof matchingHandle === 'function') {
      return matchingHandle(value);
    }

    if (typeof cases['_'] === 'function') {
      return cases['_'](value);
    }

    throw new Error(`Match did not handle key: '${key}'`);
  };
};
