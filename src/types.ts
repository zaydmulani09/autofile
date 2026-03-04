export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  lastModified: number;
  path: string;
  isDuplicate?: boolean;
  originalFile?: File;
}

export interface SmartRule {
  id: string;
  name: string;
  condition: 'type' | 'size' | 'name' | 'date' | 'extension';
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
  value: string;
  action: 'move' | 'rename' | 'delete';
  actionValue: string;
  enabled: boolean;
}

export type TabId = 'dashboard' | 'organize' | 'rename' | 'duplicates' | 'rules' | 'analytics' | 'ai' | 'timer' | 'notes' | 'settings' | 'converter' | 'password';

export interface AppStats {
  totalFiles: number;
  totalSize: number;
  duplicatesFound: number;
  rulesActive: number;
}
