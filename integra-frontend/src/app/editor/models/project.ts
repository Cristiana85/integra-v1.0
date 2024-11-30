export class Project {
  id?: number;
  accountId?: number;
  name?: string;
  creationDate?: Date;
  editingDate?: Date;
  metadata: Record<string, any>;
}
