interface TempUser {
  email: string;
  verificationCode: string;
  userData: {
    name: string;
    phone: string;
    region: string;
    city: string;
  };
  createdAt: number;
}

const tempUsers = new Map<string, TempUser>();
const CODE_LIFETIME = 15 * 60 * 1000;

export const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeTempUser = (user: Omit<TempUser, 'createdAt'>): void => {
  tempUsers.set(user.email, {
    ...user,
    createdAt: Date.now()
  });
};

export const getTempUser = (email: string): TempUser | undefined => {
  const user = tempUsers.get(email);
  if (!user) return undefined;

  if (Date.now() - user.createdAt > CODE_LIFETIME) {
    tempUsers.delete(email);
    return undefined;
  }

  return user;
};

export const verifyCode = (email: string, code: string): boolean => {
  const user = getTempUser(email);
  return user?.verificationCode === code;
};

export const deleteTempUser = (email: string): void => {
  tempUsers.delete(email);
};
