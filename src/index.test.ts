import {
  baseTypeMatch,
  BaseTypeMatchPatternType,
  defineMatchObject,
  MatchObjectType,
  none,
} from '.';

describe('test defineMatchObject', () => {
  const Status = defineMatchObject({
    Pre: none,
    Progress: (data: { value: string; show: boolean }) => data,
    Failed: (message: string) => message,
    Success: (message: string) => message,
  });

  const pre = Status.Pre;
  const progress = Status.Progress({ value: '91', show: true });
  const failed = Status.Failed('error message!');
  const success = Status.Success('success message!');

  it('define match object', () => {
    expect(Status.Pre).toBeDefined();
    expect(Status.Progress).toBeDefined();
    expect(Status.Failed).toBeDefined();
    expect(Status.Success).toBeDefined();

    expect(pre.match).toBeDefined();
    expect(typeof pre.match).toBe('function');
  });

  it('matching exhaustively', () => {
    //res type should be equal "string"
    const res = pre.match({
      Pre: () => 'none',
      Progress: ({ value, show }) => {
        if (show) {
          return value;
        }
        return 'unknown';
      },
      Failed: (message) => message,
      Success: (message) => message,
    });

    expect(res).toBe('none');
  });

  it('using placeholder', () => {
    const res1 = progress.match({
      Pre: () => 'none',
      Progress: ({ value, show }) => {
        if (show) {
          return value;
        }
        return 'unknown';
      },
      _: (message) => message,
    });
    expect(res1).toBe('91');

    const res2 = failed.match({
      Pre: () => 'none',
      Progress: ({ value, show }) => {
        if (show) {
          return value;
        }
        return 'unknown';
      },
      _: (message) => message,
    });

    expect(res2).toBe('error message!');
  });

  it('match function uses template', () => {
    //res type should be equal "boolean | string | number"
    const res = success.match<boolean | string | number>({
      Pre: () => false,
      Progress: ({ value }) => parseInt(value),
      _: (message: string) => message,
    });

    expect(res).toBe('success message!');
  });

  it("use 'as const'", () => {
    const status = { error: none, success: () => 'success' };

    //use any skip typescript validation
    defineMatchObject(status as any);

    //or
    //Recommended for retention of type validation
    const readonly_status = { error: none, success: () => 'success' } as const;
    const StatusEnum = defineMatchObject(readonly_status);
    expect(StatusEnum.error).toBeDefined();
    expect(StatusEnum.success).toBeDefined();
  });

  it('throw error when match did not handle key', () => {
    const Error = defineMatchObject({ error: none });

    expect(() => {
      //skip typescript validation
      (Error.error as any).match({
        Pre: () => 'none',
        Progress: ({ value, show }: any) => {
          if (show) {
            return value;
          }
          return 'unknown';
        },
        Failed: (message: any) => message,
        Success: (message: any) => message,
      });
    }).toThrowError("Match did not handle key: 'error'");
  });

  it('MatchObjectType', () => {
    const obj1 = {
      Quit: none,
      Move: (x: number, y: number) => ({ x, y }),
      Write: (msg: string) => msg,
      ChangeColor: (r: number, g: number, b: number) => ({ r, g, b }),
    } as const;

    const Message1 = defineMatchObject(obj1);

    // Type derivation should be normal
    let msg1: MatchObjectType<typeof obj1>;

    const obj2 = {
      Move: (x: number, y: number) => ({ x, y }),
      Write: (msg: string) => msg,
      ChangeColor: (r: number, g: number, b: number) => ({ r, g, b }),
    } as const;

    const Message2 = defineMatchObject(obj2);

    // Type derivation should be normal
    let msg2: MatchObjectType<typeof obj2>;
  });

  it('test symbol key', () => {
    const Pre = Symbol();
    const Failed = Symbol();
    const Status = defineMatchObject({
      [Pre]: none,
      Progress: (data: { value: string; show: boolean }) => data,
      [Failed]: (message: string) => message,
      Success: (message: string) => message,
    });

    const pre = Status[Pre];
    const failed = Status[Failed]('123');

    const val = pre.match({
      [Pre]: () => 1,
      _: () => 2,
    });
    expect(val).toBe(1);

    const val2 = failed.match({
      //msg type is string
      [Failed]: (msg) => msg,
      _: () => '',
    });
    expect(val2).toBe('123');
  });
});

describe('test baseTypeMatch', () => {
  it('test number', () => {
    const value1 = baseTypeMatch(1, {
      //val type is 1
      1: (val) => val + 2,
      2: (val) => val + 3,
      _: (val) => val,
    });

    expect(value1).toBe(3);

    const value2 = baseTypeMatch(value1, {
      //val type is number
      1: (val) => val + 2,
      2: (val) => val + 3,
      '3 | 4 | 5 | 6': (val) => val + 1,
      _: (val) => val,
    });

    expect(value2).toBe(4);

    const cases: BaseTypeMatchPatternType<number, number> = {
      '1 | 2': (val) => val + 1,
      3: (val) => val + 1,
      _: (val) => val + 1,
    };
    const value3 = baseTypeMatch(value2, cases);
    expect(value3).toBe(5);
  });

  it('test string', () => {
    const value1 = baseTypeMatch('foo', {
      //val type is foo
      foo: (val) => val + 2,
      bar: (val) => val + 3,
      _: (val) => val,
    });

    expect(value1).toBe('foo2');

    const value2 = baseTypeMatch(value1, {
      //val type is string
      foo: (val) => val + 2,
      bar: (val) => val + 3,
      'foo2 | foo1': (val) => val + 1,
      _: (val) => val,
    });

    expect(value2).toBe('foo21');

    const cases: BaseTypeMatchPatternType<string, string> = {
      '1 | 2': (val) => val + 1,
      bar: (val) => val + 1,
      _: (val) => val + 1,
    };
    const value3 = baseTypeMatch(value2, cases);
    expect(value3).toBe('foo211');
  });

  it('test boolean', () => {
    const value1 = baseTypeMatch<number>(false, {
      //val type is false
      false: (val) => (val ? 1 : 2),
      true: (val) => (val ? 1 : 2),
    });

    expect(value1).toBe(2);

    const value2 = baseTypeMatch(value1, {
      //val type is number
      2: (val) => true,
      _: (val) => false,
    });

    expect(value2).toBeTruthy();

    const cases: BaseTypeMatchPatternType<boolean, string> = {
      'true | false': (val) => 'hello',
      bar: (val) => 'rust',
      _: (val) => 'javascript',
    };
    const value3 = baseTypeMatch(value2, cases);
    expect(value3).toBe('hello');
  });

  it('test symbol', () => {
    const symbol = Symbol();
    const value1 = baseTypeMatch<number | symbol>(Symbol(), {
      foo: () => 1,
      bar: () => 2,
      _: () => symbol,
    });
    expect(value1).toBe(symbol);

    const cases: BaseTypeMatchPatternType<symbol, string | boolean | number | symbol> = {
      [value1 as symbol]: (val) => false,
      'a | b': (val) => 1,
      1: (val) => val,
      _: (val) => 'hello',
    };
    const value2 = baseTypeMatch(value1 as symbol, cases);
    expect(value2).toBeFalsy();
  });

  it('throw error when match did not handle key', () => {
    expect(() => {
      baseTypeMatch(1, {
        2: (val) => 1,
        3: (val) => 2,
      });
    }).toThrowError("Match did not handle key: '1'");
  });
});
