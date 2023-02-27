import { defineMatchObject, none } from '.';

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
});
