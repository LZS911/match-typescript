# Rust-Like-Match

## 简介

`rust-like-match` 提供了在 javascript 或 typescript 中使用 `Rust-Like` 的模式匹配. 并且在 typescript 环境下, `rust-like-match` 能够利用类型校验来实现 rust 中 `match` 的穷尽匹配以及提供优秀的类型提示.

## 什么是 `Rust-Like` 的模式匹配?

在说到模式匹配之前, 我们先来看下 rust 中的枚举功能.

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}
```

这里定义了一个名为 `Message` 的枚举类型, 包含了四个成员. 成员后的 `{}` 或者 `()` 代表着可以将什么类型的数据附加到该枚举成员上.

初始化枚举成员:

```rust
 let msg1 = Message::Quit;
 let msg2 = Message::Move { x: 10, y: 20 };
 let msg3 = Message::Write("hello rust".to_string());
 let mgs3 = Message::ChangeColor(255, 255, 255);
```

接下来回到主题, 来看下 rust 中的 `match` 关键字.

```rust
 match msg1 {
   Message::Quit => quit(),
   Message::Move { x, y } => move_item(x, y),
   Message::Write(msg) => println!("{}", msg),
   Message::ChangeColor(r, g, b) => change_color(r, g, b),
 }
```

`match` 关键字后跟一个表达式, 在这个栗子中是变量 `msg1` 的值. 接下来是一对大括号, 里面包含了 `match` 的分支. 一个分支由两部分组成: 一个模式和一些代码. 第一个分支的模式是枚举成员 `Message::Quit`, 之后的 `=>` 运算符将模式和需要执行的代码分开, 这里的代码是执行函数 `quit`. 同时, 在匹配上附加了额外数据的枚举成员时, 可以将其作为参数传递给后续需要执行的代码. 这里的代码结构有点类型 javascript 中的箭头函数.

`match` 也支持通配模式:

```rust
 match msg1 {
   Message::Quit => quit(),
   _ => other()
 }
```

上述代码中当匹配上 `Message::Quit` 之外的成员时, 都将执行 `other` 函数, 其中 `_` 为 rust 特定的占位符.

## Typescript 中的模式匹配

接下来我们使用 `switch` 来模仿下 `match`:

```typescript

type Message =
  | {
      key: 'Quit';
    }
  | { key: 'Move'; value: { x: number; y: number } }
  | { key: 'Write'; message: string }
  | { key: 'ChangeColor'; r: number; g: number; b: number };



let msg!: Message;

switch (msg.key) {
  case 'Quit': {
    quit();
    break;
  }
  case 'Move': {
    move(msg.value);
    break;
  }
  case 'Write': {
    console.log(msg.message);
    break;
  }

  case 'ChangeColor': {
    change_color(msg.r, msg.g, msg.b);
    break;
  }
}
```

## Match 的优势

在我看来, `match` 主要的优势有以下三点:

  1. **当 `match` 中没有使用通配模式时, 其中的分支必须覆盖了所有的可能性, 否则编译将不会通过**.
  2. `switch` 是一个语句, 而不是一个表达式, 无法使用类似 `const value = switch(...){...}` 的操作, 只能在每一个 `case` 里面去执行赋值语句, 而 `match` 为一个表达式, 其返回值为分支中执行的代码的返回值.
  3. 优秀的多模式匹配机制. `switch` 中的多模式匹配需要移除 `case` 中的 `break` 语句, 也就是说对于每一个独立 `case` 都需要在尾部添加 `break` 语句, 但也容易因为 `break` 的丢失导致出现一些“误会”. 而 `match` 中的多模式采用类似 `Message::Quit | Message::Start => doSomething()` 的语法, 且每一个独立的分支不需要添加任何额外的语句.

## 使用方式

在了解了 `match` 的具体语法以及优势后, 我们回到主题 `rust-like-match` 中, 我们首先来看下具体的使用方式:

1. 初始化

   ```typescript
   import { defineMatchObject, none } from "rust-like-match";
   
   const Message = defineMatchObject({
     Quit: none,
     Move: (x: number, y: number) => ({ x, y }),
     Write: (msg: string) => msg,
     ChangeColor: (r: number, g: number, b: number) => ({ r, g, b }),
   });
   //or
   const obj = {
     Quit: none,
     Move: (x: number, y: number) => ({ x, y }),
     Write: (msg: string) => msg,
     ChangeColor: (r: number, g: number, b: number) => ({ r, g, b }),
   } as const;
   const Message = defineMatchObject(msg);
   ```

   首先从 `rust-like-match` 中导出函数 `defineMatchObject` 以及变量 `none`. 由于 typescript 中已经存在 `enum` 的概念. 所以, 这里将初始化过程命名为 **定义一个具有Match功能的对象**, 也就是 `defineMatchObject`. 该函数接收一个字面量类型的对象, `key` 值对应 `rust` 中的枚举成员名, `value` 值的类型为 `None (typeof none)` 或者为一个函数. `None` 的情况对应着未给枚举成员附加额外数据, 相应的, 值为函数即代表着附加额外数据的情况.

2. 赋值

   我们来看下得到的 `Message` 的具体格式:

   ![alt](https://lzs911.github.io/assets/rust-like-match/example-1.png)

   ![alt](https://lzs911.github.io/assets/rust-like-match/example-2.png)

   ![alt](https://lzs911.github.io/assets/rust-like-match/example-3.png)

   ![alt](https://lzs911.github.io/assets/rust-like-match/example-4.png)

   可以看到, 当初始值为 `none` 时, `Message` 的成员值(`Quit`)为一个拥有 `match` 属性的对象. 当初始值为函数时, `Message` 的成员值同样也是一个函数, 且该函数的入参类型与初始的函数入参类型一致. 该函数的返回值为一个拥有 `match` 属性的对象.

   所以我们这样来进行赋值:

   ```typescript
   let msg;
   
   msg = Message.Quit;
   //or
   msg = Message.Move(10, 20);
   //or
   msg = Message.Write("hello rust");
   //or
   msg = Message.ChangeColor(255, 255, 255);
   ```

3. 匹配
  
   `match` 函数接收一个对象作为参数, 对象的每一个 `key:value` 对应着一条分支, `key` 值为一个模式, 必须满足穷尽模式或者使用通配模式, `value` 为一个函数, 该函数能够接收到 `defineMatchObject` 时定义的函数的返回值, 并将其作为参数. 函数体为分支匹配上后执行的代码.

   接下来主要介绍在 typescript 环境下其拥有的一些特性:

   1. 支持通配模式, 当分支中存在 `_` 时, 此分支涵盖了其他可能的值, 且无需满足全匹配.

       ```typescript
        msg.match({
          Quit:() => quit(),
          _ :() => other(),
        })
       ```

   2. 穷尽匹配: 当分支中不存在 `_` 时, 分支必须覆盖所有的情况, 否则 `typescript` 将编译失败.

       ```typescript
        msg.match({
          Quit: () => quit(),
          Move: ({ x, y }) => move(x, y),
          Write: (msg) => console.log(msg),
          ChangeColor: ({ r, g, b }) => changeColor(r, g, b),
        });
       ```

   3. 参数类型自动推导. 每个分支中的函数的入参类型为定义时函数的返回类型.
   4. 支持泛型.

     ```typescript
       //此时 res 类型将自动推导为 number
       const res = msg.match({
         Quit: () => 1,
         Move: ({ x, y }) => 2,
         Write: (msg) => 3,
         ChangeColor: ({ r, g, b }) => 4,
       });

      //由于未标注泛型, 且存在分支的返回类型不一致, 此时 typescript 将会报错
      const res = msg.match({
         Quit: () => 1,
         Move: ({ x, y }) => '2',
         Write: (msg) => 3,
         ChangeColor: ({ r, g, b }) => 4,
       });
    
      //res 的类型为 string | number | boolean | Array<number>
      const res = msg.match<string | number | boolean | Array<number>>({
         Quit: () => 1,
         Move: ({ x, y }) => [x, y],
         Write: (msg) => false,
         ChangeColor: ({ r, g, b }) => `${r}-${g}-${b}`,
       });
     ```

## 未来将会支持的功能

1. 实现多模式匹配, 预计会以 `"Quit | Start": () => other()` 的形式来实现.
2. 兼容 typescript 中的 `enum` (实现方案考虑中).
