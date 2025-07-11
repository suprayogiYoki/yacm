import { mergePrismas } from "./merge_prisma";
console.log('Start generate prisma schema');
mergePrismas().then((result) => {
  console.log('Succes generate prisma schema');
})
.catch((error) => {
  console.error('Failed to generate prisma schema:', error);
});