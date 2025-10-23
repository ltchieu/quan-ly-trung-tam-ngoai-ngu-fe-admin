export interface ContentData {
  id: number;          
  contentName: string; 
}

export interface DocumentDataForModule {
  documentId: number; 
  fileName: string;
  link: string;
  description: string;
  image: string;
}

export interface ModuleData {
  moduleId: number;
  moduleName: string;
  duration: number;
  contents: ContentData[];    
  documents: DocumentDataForModule[];
}