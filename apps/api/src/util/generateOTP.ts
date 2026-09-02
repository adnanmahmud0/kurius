import { randomInt } from "crypto";

const generateOTP = () => {
  // crypto.randomInt is cryptographically secure, unlike Math.random().
  // randomInt(min, max) is inclusive of min, exclusive of max.
  return randomInt(100000, 1000000);
};

export default generateOTP;
