
declare global {
  interface String {
    formatVariables(values: Map<string, any>): string;

    getVariables(): string[] | null;
  }
}

String.prototype.formatVariables = function(this: string, values: Map<string, any>) {
  return this.replace(/{{([A-Z][A-Z_1-9]+[A-Z1-9]+)}}/g, function(match, varName) {
    return values.has(varName) ? values.get(varName) : varName;
  });
};

String.prototype.getVariables = function(this: string) {
  const matches =  this.matchAll(/{{([A-Z][A-Z_1-9]+[A-Z1-9]+)}}/gi);
  const vars:  string[] = [];
  for (const match of matches) {
    vars.push(match[1]);
  }
  return vars;
};

export {};
