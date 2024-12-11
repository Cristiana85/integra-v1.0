export class Project {
  id?: number;
  accountId?: number;
  name?: string;
  image?: string;
  description?: string;
  creationDate?: Date;
  editingDate?: Date;
  metadata: Record<string, any>;
}
