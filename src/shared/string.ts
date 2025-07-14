const usFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const lcFirst = (str: string) => str.charAt(0).toLowerCase() + str.slice(1);
const labelcase = (str: string) => usFirst(str).split('_').join(' ');

export { usFirst, lcFirst, labelcase };