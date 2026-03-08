if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY environment variable is required");
}
export const SECRET_KEY = process.env.SECRET_KEY;
