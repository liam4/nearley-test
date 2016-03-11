# another programming language

This is just another programming language I'm making for fun. It's mildly based on [another project I made, PLT](https://github.com/liam4/programming-language-thing) and JavaScript.

It's one of those silly interpret-on-the-go programming languages that don't compile to bytecode. This means it's probably much less efficient than, like, any other programming language.

It's a functional programming language (i.e. functions are first class).

That's about it. If you're interested in running it, you can just clone this repository and use `gulp` (while `cd`'d into the repository obviously [also don't forget to `npm install`]).

It doesn't make sense. Please ignore the fact that it doesn't make sense? Also, hide, far, far away from the source code. It might lash out and hurt somebody's brain.

## Examples

Hello world:

    print("Hello, world!");

Comments:

    # This is a comment #
    print("Hi!");

Variables:

    my_var => 42;
    print(my_var);

Functions:

    my_fn => fn(x) {
        return(+(x, 3));
    };
    
    print(my_fn(4));

If/else:

    ifel(true, fn() {
        print("Called for true");
    }, fn() {
        print("Called for false");
    });

## Control structures and syntax and such

There are basically no control structures. In one command (each separated by semicolons) you can do the following:

* Assign or change a variable. (`variable_name => value`, `variable_name -> new_value`)
* Evaluate an expression.
  * Call a function (`function(arg1, arg2, arg3)`)
  * Get a variable (`variable_name`)
  * Do something related to object properties
  * Evaluate a special token, like a string, number or function

But.. where are things like `if`? Well, `if` is a function. So you'll want to evaluate a call a function expression:

    if(true_or_false, call_for_true);

Here's an example of a program using all the things I showed above. Please excuse my terrible ASCII labelling.

    # Variable assign..                             #
    #  v--- Variable identifier                     #
    #  v    vvvv--- A boolean literal.              #
       x => true;

    #  v--- Get a variable using identifier "if",   #
    #  |    this is built-in so all programs will   #
    #  |    automatically have "if" as a variable.  #
    #  |  v--- Get a variable using identifier "x", #
    #  |  |    which we assigned earlier.           #
    #  |  |  vvvvvv--- A function literal.          #
       if(x, fn() {

    #    vvvvv--- Get a variable using identifier   #
    #    |||||    "print", which is also built-in.  #
    #    ||||| vvvvvvvv--- A string literal.        #
         print("Hello!");

       });

## Should I use it?

No. Its syntax is pretty similar to JavaScript, so why aren't you using JavaScript?

On the other hand, if you're just looking at it as a fun project I made as an experiment, go ahead and use it. I have nothing against you using it - I'd enjoy it if you used it! - but it's not a very good programming language, so don't expect something amazing.

## Can I have a specification?

No. [Cool languages have specifications.](http://www.ecma-international.org/publications/standards/Ecma-262.htm) But I'm not sure making a specification for this simple experimental project is either worth it or my style.
