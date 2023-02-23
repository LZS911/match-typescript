import { DefineMatchObjectReturnType, None, none } from '.';

const isNone = <T1 extends Array<unknown>, T2 = unknown>(
  val: None | ((...args: T1) => T2),
): val is None => {
  return typeof val !== 'function';
};

const defineMatch = <
  Target extends Record<Readonly<string>, None | ((...args: Array<unknown>) => unknown)>,
>(
  param: Target,
): DefineMatchObjectReturnType<Target> => {
  const matchObj: any = {};

  Object.keys(param).forEach((key) => {
    const value = param[key];

    if (isNone(value)) {
      matchObj[key] = {
        match: createMatchFunction(key),
      };
    } else {
      matchObj[key] = (...args: any) => {
        return {
          match: createMatchFunction(key, value(...args)),
        };
      };
    }
  });

  return matchObj;
};

const createMatchFunction = (key: string, value?: any) => {
  const match = (cases: any) => {
    const matchingHandle = cases[key];

    if (matchingHandle) {
      return matchingHandle(value);
    }

    if (typeof cases['_'] === 'function') {
      return cases['_'](value);
    }

    throw new Error(`Match did not handle variant: '${key}'`);
  };

  return match;
};

const par = { None: none, Some: () => 3 } as const;

const a = defineMatch<typeof par>(par);

let c = a.None;

console.log(c.match);

const d = c.match({
  None: () => 1,
  Some: (val) => 2,
});

c = a.Some;

const e = c.match({
  None: () => 1,
  Some: (val) => 2,
});

console.log(d, e);

export default defineMatch;
