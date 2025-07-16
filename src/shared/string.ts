const ucFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const lcFirst = (str: string) => str.charAt(0).toLowerCase() + str.slice(1);
const labelcase = (str: string) => ucFirst(str).split('_').join(' ');

export { ucFirst, lcFirst, labelcase };