export const calculateChecksum = (input: any, parsedValue: any) => {
  console.log(`Calculating checksum for: ${input} should be > ${parsedValue}`);
  const weights = [7, 3, 1];
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let checksum = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const value = chars.indexOf(char);

    if (value === -1 && char !== '<') {
      console.error(`Invalid character '${char}' in MRZ.`);
      throw new Error(`Invalid character '${char}' in MRZ.`);
    }
    checksum += (value >= 0 ? value : 0) * weights[i % 3];
  }

  const result = checksum % 10;
  const valid = result === parseInt(parsedValue[parsedValue.length - 1], 10);
  console.log(`Checksum result: for ${input} is ${result} and is ${valid}`);
  return valid;
};
