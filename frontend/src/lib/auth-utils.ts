type TempUserData = {
  name: string;
  phone: string;
  region: string;
  city: string;
};

type TempUser = {
  email: string;
  verificationCode: string;
  userData: TempUserData;
  createdAt: number;
};

const tempUsers = new Map<string, TempUser>();

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeTempUser(input: Omit<TempUser, "createdAt">) {
  tempUsers.set(input.email.toLowerCase(), {
    ...input,
    createdAt: Date.now(),
  });
}
