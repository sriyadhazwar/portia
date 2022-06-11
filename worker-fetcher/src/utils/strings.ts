class Strings {
  public static slugify(input: string, lower?: boolean): string {
    lower = lower || false;


    //white-space
    input = input.replace(/[\s]/g, "-");

    //non-word
    input = input.replace(/[^\w-]/g, "-");

    //duplicated dash
    input = input.replace(/--+/g, "-");

    return lower ? input.toLowerCase() : input;
  }
}

export default Strings;
