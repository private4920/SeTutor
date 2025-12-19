export interface User {
  id: string;
  email: string;
  name: string;
  photo_url: string | null;
  firebase_uid: string;
  created_at: Date;
  updated_at: Date;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  path: string;
  created_at: Date;
  updated_at: Date;
}

export interface Document {
  id: string;
  name: string;
  original_name: string;
  folder_id: string | null;
  user_id: string;
  s3_key: string;
  s3_url: string;
  file_size: number;
  mime_type: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  photo_url?: string;
  firebase_uid: string;
}

export interface CreateFolderInput {
  name: string;
  parent_id?: string | null;
  user_id: string;
  path: string;
}

export interface CreateDocumentInput {
  name: string;
  original_name: string;
  folder_id?: string | null;
  user_id: string;
  s3_key: string;
  s3_url: string;
  file_size: number;
  mime_type: string;
}

export interface UpdateFolderInput {
  name?: string;
  parent_id?: string | null;
  path?: string;
}

export interface UpdateDocumentInput {
  name?: string;
  folder_id?: string | null;
}
