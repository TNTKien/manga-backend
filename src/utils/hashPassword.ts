async function hashPassword(password: string, salt = 12): Promise<string> {
  return Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: salt,
  });
}

async function checkPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return Bun.password.verify(password, hashedPassword, "bcrypt");
}

export { hashPassword, checkPassword };
