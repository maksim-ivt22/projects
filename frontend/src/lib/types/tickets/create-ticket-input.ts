export type CreateTicketInput = {
  latitude: number;
  longitude: number;
  address: string;
  title: string;
  description?: string;
  typeId: number;
  image?: File;
};
